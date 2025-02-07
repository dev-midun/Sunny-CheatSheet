import Helper from "./helper"
import Modal from "./modal"
import Model from "./model"
import Table from "./table"

export default class Detail {
    _parentColumn = null
    _parentId = null
    _model = null
    _newButton = false
    _actionButton = false
    _actions = []
    _isGroupActionButton = false
    _detailWrapper = null
    _events = []
    table = null
    modal = null 
    constructor({
        table, 
        newButton = true,
        actionButton = true,
        isGroupActionButton = true,
        actions = ['edit', 'delete'],
        source = null, 
        model = null, 
        modal = null,
        modalConfig = null,
        parentColumn = null, 
        parentId = null, 
        detailWrapper = null, 
        placeholder = null
    }) {
        this._parentColumn = parentColumn
        this._parentId = parentId
        this._model = model
        this._newButton = newButton
        this._actionButton = actionButton
        this._isGroupActionButton = isGroupActionButton
        this._actions = actions

        if(!Helper.isEmpty(detailWrapper)) {
            if(Helper.isString(detailWrapper)) {
                this._detailWrapper = document.querySelector(detailWrapper)
            } else if(detailWrapper instanceof Element) {
                this._detailWrapper = detailWrapper
            } else {
                throw new Error("Detail wrapper is not valid element")
            }
        }

        if(!Helper.isEmpty(placeholder)) {
            if(Helper.isString(detailWrapper)) {
                this._placeholder = placeholder
            } else if(detailWrapper instanceof Element) {
                this._placeholder = placeholder
            } else {
                throw new Error("Placeholder is not valid element")
            }

            if(Helper.isEmpty(this._detailWrapper)) {
                throw new Error("Detail wrapper cannot be null or empty if placeholder is define")
            }
        }

        Helper.loadingPlaceholder(true, this._detailWrapper, this._placeholder)

        this._initModal(modal, modalConfig)
        this._initTable(table, source)
    }

    async initModal(modal) {
        // override me for add custom logic when modal init
    }

    async initTable(table) {
        // override me for add custom logic when table init, example add column
    }

    async refresh() {
        if(this._placeholder) {
            Helper.loadingPlaceholder(true, this._detailWrapper, this._placeholder)
        }

        await this.table.refresh()

        if(this._placeholder) {
            Helper.loadingPlaceholder(false, this._detailWrapper, this._placeholder)
        }
    }

    on(type, callback) {
        const splitType = type.split('.')
        const isModal = splitType[0] == 'modal'
        const isTable = splitType[0] == 'table'

        if(!isModal && !isTable) {
            throw new Error(`Event ${type} does not support`)
        }

        if(isModal && this.modal) {
            this.modal.on(type, (res) => callback(res))
        }

        this._events.push({
            type: type,
            callback: callback
        })

        return this
    }

    trigger(event, data) {
        this._events
            .filter(e => e.type == event)
            .forEach(e => e.callback(data))
    }

    async _initModal(modal, modalConfig) {
        if(Helper.isEmpty(modal)) {
            return
        }

        this.modal = new Modal(modal, modalConfig ?? null)
        if(!Helper.isEmpty(this._parentColumn) && !Helper.isEmpty(this._parentId)) {
            this.modal.form.addData(this._parentColumn, this._parentId)
        }

        if(Helper.isEmpty(this._model)) {
            this._model = this.modal.getModel()
        }

        this.initModal(this.modal)

        this.modal.on('success', (res) => {
            if(this._isEventsExists('modal.success')) {
                this.trigger('modal.success', res)
            } else {
                this.modal.close()
                this.table.refresh()
            }
        })
    }

    async _initTable(table, source) {
        this.table = new Table(table, source)
        
        if(!Helper.isEmpty(this._parentColumn) && !Helper.isEmpty(this._parentId)) {
            this.table.addFilter(this._parentColumn, this._parentId)
        }

        if(Helper.isEmpty(this._model)) {
            this._model = this.table.getModel()
        }

        this.table.setLayout({
            topStart: ['pageLength', 'buttons'],
            bottomStart: null,
            bottom: {
                paging: {
                    type: 'simple_numbers'
                }
            },
            bottomEnd: null
        })
        
        await this.initTable(this.table)

        if(this._newButton) {
            this.table.addNewButton((e, dt, button, config) => {
                if(this._isEventsExists('table.new')) {
                    this.trigger('table.new')
                } else {
                    if(this.modal) {
                        this.modal.show()
                    }
                }
            })
        }

        if(this._actionButton) {

            const viewAction = this._actions.includes('view') ?
                async (data) => {
                    if(this._isEventsExists('table.view')) {
                        this.trigger('table.view', data)
                    }
                } : null

            const editAction = this._actions.includes('edit') ?
                async (data) => {
                    if(this._isEventsExists('table.edit')) {
                        this.trigger('table.edit', data)
                    } else {
                        if(this.modal) {
                            await this.modal.edit(data.id)
                        }
                    }
                } : null

            const deleteAction = this._actions.includes('delete') ?
                async (data) => {
                    if(this._isEventsExists('table.delete')) {
                        this.trigger('table.delete', data)
                    } else {
                        await Model.delete(this._model, data.id)
                        this.table.refresh()
                    }
                } : null

            if(this._isGroupActionButton) {

                this.table.addGroupAction({
                    viewAction: viewAction,
                    editAction: editAction,
                    deleteAction: deleteAction
                })

            } else {

                if(viewAction) {
                    this.table.addViewAction(viewAction)
                }

                if(editAction) {
                    this.table.addEditAction(editAction)
                }

                if(deleteAction) {
                    this.table.addDeleteAction(deleteAction)
                }
            }
        }
        
        this.table.onComplete(() => {
            if(this._placeholder) {
                Helper.loadingPlaceholder(false, this._detailWrapper, this._placeholder)
            }
        })

        document.addEventListener('DOMContentLoaded', (e) => {
            this.table.render()
        })
    }

    _isEventsExists(type) {
        return this._events.filter(event => event.type === type).length > 0
    }
}