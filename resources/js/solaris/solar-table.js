import Helper from './helper'
import DataTable from '../libs/datatable'
import axios from '../libs/axios'
import _ from 'lodash'

export default class SolarTable {
    #dataTable = null
    #model = null
    #config = null
    #customConfig = false
    #customFilter = {}
    #customSort = {}
    #columns = []
    #buttons = []
    #customButtons = []
    #actionButtons = []
    #pageLength = 10
    #lengthMenu = [10, 25, 50, 100]
    #events = []
    #onComplete = null
    #onDraw = null
    #supportedType = ['string', 'lookup']
    #serverSide = false
    #ajax = null
    #element = ''
    #elementWrapper = ''
    #layouts = null
    #scrollX = true
    #infiniteScroll = false
    #infiniteScrollState = null
    #emptyTableLabel = null
    #zeroRecordsLabel = null

    /**
     * constructor
     * 
     * @param {string} element 
     * @param {Object|string} ajax 
     */
    constructor(element, ajax = null) {
        if(Helper.isEmpty(element)) {
            throw new Error("Element cannot be null or empty")
        }

        if(!Helper.isString(element)) {
            throw new Error("Element must be string, and supports query selectors")
        }

        this.#element = element
        this.#elementWrapper = this.#element + "_wrapper"
        this.#model = document.querySelector(`${element}[data-form-model]`)?.getAttribute("data-form-model") ?? null
        this.#ajax = ajax
    }

    static icon = {
        VIEW: 'mdi mdi-eye-outline fs-17',
        EDIT: 'mdi mdi-square-edit-outline fs-17',
        DELETE: 'mdi mdi-trash-can-outline fs-17',
        DEFAULT: 'mdi mdi-dots-vertical fs-17'
    }

    static ajax(url) {
        return {
            url: url,
            type: 'POST',
            headers: {
                "X-CSRF-TOKEN": Helper.getCsrfToken()
            }
        }
    }

    static renderBadge(text, color = 'primary') {
        return Helper.isEmpty(text) ? '' : `<span class="badge rounded-pill bg-${color} bg-glow">${text}</span>`
    }

    static renderLink(text, link, isNewTab = true) {
        return Helper.isEmpty(text) ? '' : `<a href="${link}" ${isNewTab ? 'target="blank"' : ''}>${text}</a>`
    }

    //#region column

    /**
     * addColumn - add new column to table
     * 
     * @param {Object} config
     * @param {string} config.name - optional, can be null
     * @param {string} config.data - required
     * @param {string} config.type - [string, lookup]
     * @param {string} config.className - optional. custom css
     * @param {Function} config.render - optional. custom render in column
     * @param {Function} config.event - optional. custom event
     * @param {boolean} config.searchable - default is true
     * @param {boolean} config.orderable - default is true
     * @param {boolean} config.isAutoNumber - default is false, if true then searchable and orderable auto change to false
     * @returns {SolarTable}
     */
    addColumn({name, data, type = 'string', className = null, render = null, event = null, searchable = true, orderable = true, isAutoNumber = false}) {
        if(this.isRendered()) {
            throw new Error("addColumn can only be called before rendered")
        }

        const column = {}
        const index = this.#columns.length

        if(!Helper.isEmpty(name)) {
            if(!Helper.isString(name)) {
                throw new Error("addColumn: name must be string")
            }

            column.name = name
        }

        if(!Helper.isEmpty(data)) {
            if(!Helper.isString(data)) {
                throw new Error("addColumn: data must be string")
            }

            column.data = data
        }

        if(!Helper.isEmpty(className)) {
            if(!Helper.isString(className)) {
                throw new Error("addColumn: className must be string")
            }

            column.className = className
        }

        if(!Helper.isEmpty(type)) {
            if(!Helper.isString(type)) {
                throw new Error("addColumn: type must be string")
            }

            if(!this.#supportedType.includes(type)) {
                throw new Error(`addColumn: type ${type} is not supported ${this.#supportedType.join(', ')}`)
            }
            
            column.type = type
        }

        if(render) {
            if(!Helper.isFunction(render)) {
                throw new Error("addColumn: render must be function")
            }

            column.render = render
        }

        if(Helper.isObject(event)) {
            if(!event.hasOwnProperty('action') || (event.hasOwnProperty('action') && !Helper.isFunction(event.event))) {
                throw new Error("addColumn: event must have action function")
            }

            let selector = `${this.#elementWrapper} tbody tr td`
            if(Helper.isEmpty(event.selector)) {
                selector += `:nth-child(${index+1})`
            } else {
                selector += ` ${event.selector}`
            }

            column.event = {
                type: event.type ?? 'click',
                selector: selector,
                action: event.action
            }
        }

        if(Helper.isEmpty(name) && !Helper.isEmpty(data)) {
            column.name = data
        }

        if(isAutoNumber && !Helper.isEmpty(data)) {
            throw new Error("addColumn: If IsAutoNumber true, then data must be empty")
        }

        column.searchable = isAutoNumber ? false : !column.name ? false : searchable
        column.orderable = isAutoNumber ? false : !column.name ? false : orderable
        column.isAutoNumber = isAutoNumber

        this.#columns.push(column)
        if(column.event) {
            this.addEvent(column.event)
        }

        return this
    }

    //#endregion

    //#region action button in action columns

    /**
     * addViewAction - add view action button
     * 
     * @param {Function} action 
     * @returns {SolarTable}
     */
    addViewAction(action) {
        if(this.isRendered()) {
            throw new Error("addViewAction can only be called before rendered")
        }

        return this.addAction({
            name: "view", 
            title: "View", 
            icon: this.constructor.icon.VIEW, 
            action: action
        })
    }

    /**
     * addEditAction - add edit action button
     * 
     * @param {Function} action 
     * @returns {SolarTable}
     */
    addEditAction(action) {
        if(this.isRendered()) {
            throw new Error("addEditAction can only be called before rendered")
        }

        return this.addAction({
            name: "edit", 
            title: "Edit", 
            icon: this.constructor.icon.EDIT, 
            action: action
        })
    }

    /**
     * addDeleteAction - add delete action button
     * 
     * @param {Function} action 
     * @returns 
     */
    addDeleteAction(action) {
        if(this.isRendered()) {
            throw new Error("addDeleteAction can only be called before rendered")
        }

        return this.addAction({
            name: "delete", 
            title: "Delete", 
            icon: this.constructor.icon.DELETE, 
            action: action
        })
    }

    /**
     * addAction - add custom action button
     * 
     * @param {Object} config
     * @param {string} config.name - required. name required for define selector, and must unique
     * @param {string} config.title - optional
     * @param {string} config.icon - optional. if null then will be use Icon.Default
     * @param {Function} config.action - required
     * @param {string} config.group - optional. if you want your action grouped in dropdown
     * @param {boolean} config.tooltip - optional. default is true, text tooltip will print by title
     * @returns {SolarTable}
     */
    addAction({name, title, icon, action, group = null, tooltip = true}) {
        if(this.isRendered()) {
            throw new Error("addAction can only be called before rendered")
        }

        if(Helper.isEmpty(name)) {
            throw new Error("addAction: name cannot be null or empty")
        }

        if(!Helper.isString(name)) {
            throw new Error("addAction: name must be string")
        }

        if(!/^[a-zA-Z_]+$/.test(name)) {
            throw new Error("addAction: name must be letter and underscore character only")
        }

        if(this.#actionButtons.find(item => item.name == name)) {
            throw new Error(`addAction: action ${name} is exists`)
        }

        if(!Helper.isEmpty(icon)) {
            if(!Helper.isString(icon)) {
                throw new Error("addAction: icon must be string")
            }
        }

        if(!Helper.isFunction(action)) {
            throw new Error("addEvent: action must be function")
        }

        const act = {
            name: name,
            title: title,
            tooltip: tooltip,
            icon: icon ?? this.constructor.icon.DEFAULT,
            group: group
        }
        this.#actionButtons.push(act)
        this.addEvent({
            type: 'click',
            selector: `tbody tr td .dt-action-${name}`,
            action: action
        })

        return this
    }

    /**
     * addGroupAction - add default group action button
     * 
     * @param {Function} viewAction
     * @param {Function} editAction 
     * @param {Function} deleteAction 
     * @returns {SolarTable}
     */
    addGroupAction({viewAction = null, editAction = null, deleteAction = null}) {
        if(this.isRendered()) {
            throw new Error("addGroupAction can only be called before rendered")
        }

        if(Helper.isFunction(viewAction)) {
            this.addAction({
                name: "view", 
                title: "View", 
                icon: this.constructor.icon.VIEW, 
                action: viewAction,
                tooltip: false,
                group: 'group_action'
            })
        }

        if(Helper.isFunction(editAction)) {
            this.addAction({
                name: "edit", 
                title: "Edit", 
                icon: this.constructor.icon.EDIT, 
                action: editAction,
                tooltip: false,
                group: 'group_action'
            })
        }

        if(Helper.isFunction(deleteAction)) {
            this.addAction({
                name: "delete", 
                title: "Delete", 
                icon: this.constructor.icon.DELETE, 
                action: deleteAction,
                tooltip: false,
                group: 'group_action'
            })
        }

        return this
    }

    //#endregion

    //#region buttons

    /**
     * addNewButton - add default new button
     * 
     * @param {Function} action 
     * @returns {SolarTable}
     */
    addNewButton(action) {
        if(this.isRendered()) {
            throw new Error("addNewButton can only be called before rendered")
        }

        return this.addButton({
            text: 'New', 
            className: 'btn-primary waves-effect waves-light',
            action: action,
            init: function(api, node, config) {
                $(node).removeClass('btn-secondary')
            }
        })
    }

    /**
     * addButton - add custom button
     * 
     * @param {Object} options - config same with datatable buttons
     * @param {string} options.text
     * @param {string} options.className
     * @param {Function} options.action - required
     * @returns {SolarTable}
     */
    addButton(options) {
        if(this.isRendered()) {
            throw new Error("addButton can only be called before rendered")
        }

        if(!Helper.isFunction(options?.action)) {
            throw new Error("addButton: action must be function")
        }

        this.#buttons.push(options)

        return this
    }
    
    /**
     * addCustomButton - add custom button with more custom element
     * @param {Element|string} element
     * @param {Function} action
     */
    addCustomButton({element, action = null}) {
        if(!element instanceof Element && !Helper.isString(element)) {
            throw new Error("Element must be element or string contains of element")
        }

        if(action && Helper.isFunction(action)) {
            throw new Error("Action must be function")
        }

        this.#customButtons.push({
            element: element,
            action: action
        })
    }

    //#endregion

    //#region set - get property
    
    /**
     * setPageLength - set page length value
     * 
     * @param {int} length 
     * @returns {SolarTable}
     */
    setPageLength(length) {
        if(this.isRendered()) {
            throw new Error("setPageLength can only be called before rendered")
        }

        if(!Helper.isInteger(length)) {
            return this
        }

        this.#pageLength = length

        return this
    }

    /**
     * setLengthMenu - set length menu value
     * 
     * @param {Array} lengthMenu - array of int
     * @returns {SolarTable}
     */
    setLengthMenu(lengthMenu) {
        if(this.isRendered()) {
            throw new Error("setLengthMenu can only be called before rendered")
        }

        if(Helper.isEmpty(lengthMenu)) {
            this.#lengthMenu = null

            return this
        }
        
        if(!Array.isArray(lengthMenu)) {
            throw new Error('setLengthMenu: Length menu must be array')
        }

        const isNotNumber = lengthMenu.filter(item => !Helper.isInteger(item)).length > 0
        if(isNotNumber) {
            throw new Error('setLengthMenu: Length menu must be array of numbers and integer')
        }

        this.#lengthMenu = lengthMenu

        return this
    }

    /**
     * setConfig - create custom DataTable
     * 
     * @param {Object} config - config DataTable 
     * @returns {SolarTable}
     */
    setConfig(config) {
        if(this.isRendered()) {
            throw new Error("setConfig can only be called before rendered")
        }

        if(!Helper.isObject(config)) {
            throw new Error('setConfig: Config must be object')
        }

        this.#config = config
        this.#customConfig = true

        return this
    }

    /**
     * setLayout - set custom layout
     * 
     * @param {Object} layout - config layout DataTable 
     * @returns {SolarTable}
     */
    setLayout(layout) {
        if(this.isRendered()) {
            throw new Error("setLayout can only be called before rendered")
        }

        if(!Helper.isObject(layout)) {
            throw new Error('setLayout: layout must be object')
        }

        this.#layouts = layout

        return this
    }

    /**
     * setScrollX - set to use scrollX
     * 
     * @param {boolean} active 
     * @returns {SolarTable}
     */
    setScrollX(active) {
        if(this.isRendered()) {
            throw new Error("setScrollX can only be called before rendered")
        }

        this.#scrollX = active

        return this
    }

    /**
     * setEmptyTable - set emptyTable language DataTable
     * 
     * @param {string} label 
     * @returns {SolarTable}
     */
    setEmptyTable(label) {
        if(this.isRendered()) {
            throw new Error("setEmptyTable can only be called before rendered")
        }

        this.#emptyTableLabel = label
        
        return this
    }

    /**
     * setZeroRecords - set zeroRecords language DataTable
     * 
     * @param {string} label 
     * @returns {SolarTable}
     */
    setZeroRecords(label) {
        if(this.isRendered()) {
            throw new Error("setZeroRecords can only be called before rendered")
        }

        this.#zeroRecordsLabel = label
        
        return this
    }

    /**
     * setInfiniteScroll
     * 
     * @param {boolean} active
     * @param {Object} config
     * @param {int} config.maxData - maximum row in table, if total data exceed maxData, then data in top or bottom will be remove. Default is 100
     * @param {int} config.removeOldData - how much data will be removed. Defalt is 20
     * @param {int} config.length - how much data will be fetch. Default is 10
     * @returns {SolarTable}
     */
    setInfiniteScroll(active, config = null) {
        if(this.isRendered()) {
            throw new Error("setInfiniteScroll can only be called before rendered")
        }

        this.#infiniteScroll = active
        this.#infiniteScrollState = active ? {
            startIndex: 0,
            endIndex: 0,
            start: 0,
            length: config?.length ?? 10,
            recordsTotal: 0,
            recordsFiltered: 0,
            totalData: 0,
            maxData: config?.maxData ?? 100,
            removeOldData: config?.removeOldData ?? 20,
            isRefresh: false,
            isSearching: false,
            isSorting: false,
            scroll: 'down'
        } : null

        return this
    }

    /**
     * getModel
     * 
     * @returns {string}
     */
    getModel() {
        return this.#model
    }

    /**
     * getDataTable - get current DataTable
     * 
     * @returns {DataTable}
     */
    getDataTable() {
        return this.#dataTable
    }
    
    //#endregion

    //#region custom filter

    /**
     * addFilter - add custom filter to ajax request
     * 
     * @param {string} key 
     * @param {any} value 
     * @returns {SolarTable}
     */
    addFilter(key, value) {
        this.#customFilter[key] = value

        return this
    }

    /**
     * setSort - set custom sorting, will be trigger refresh
     * 
     * @param {string} key - required. column name
     * @param {string} value - optional. default is ASC. [ASC, DESC]
     */
    setSort(key, value = 'ASC') {
        this.#customSort = {}
        this.#customSort[key] = value
        
        if(this.#infiniteScroll) {
            this.#infiniteScrollState.isSorting = true
        }

        this.#dataTable.draw(false)
    }

    //#endregion

    //#region events

    /**
     * addEvent - add custom event
     * 
     * @param {Object} config 
     * @param {string} config.type - optional. event type, ex: click, etc. default is click
     * @param {string} config.selector - optional. default is 'tbody tr'
     * @param {Function} config.action - required
     * @returns {SolarTable}
     */
    addEvent({type, selector, action}) {
        if(this.isRendered()) {
            throw new Error("addEvent can only be called before rendered")
        }

        if(!Helper.isFunction(action)) {
            throw new Error("addEvent: action must be function")
        }

        const event = {}
        event.type = type ?? 'click'
        event.selector = Helper.isEmpty(selector) ? 'tbody tr' : selector
        event.action = action

        this.#events.push(event)

        return this
    }

    /**
     * onComplete - callback when initComplete fired in DataTable 
     * 
     * @param {Function} callback 
     * @returns {SolarTable}
     */
    onComplete(callback) {
        if(!Helper.isFunction(callback)) {
            throw new Error("onComplete: callback must be function")
        }

        this.#onComplete = callback

        return this
    }

    /**
     * onDraw - callback when draw fired in DataTable
     * 
     * @param {Function} callback 
     * @returns {SolarTable}
     */
    onDraw(callback) {
        if(!Helper.isFunction(callback)) {
            throw new Error("onDraw: callback must be function")
        }

        this.#onDraw = callback
        if(this.#dataTable) {
            this.#dataTable.off('draw.dt')
            this.#onDrawCallback()
        }

        return this
    }

    //#endregion

    //#region render table

    /**
     * isRendered - check DataTable is render or not
     * 
     * @returns {boolean}
     */
    isRendered() {
        return this.#dataTable ? true : false
    }

    render() {
        if(this.#dataTable) {
            throw new Error("Render method can only be called once")
        }

        if(!this.#customConfig) {
            this.#buildConfig()
        }

        this.#dataTable = new DataTable(this.#element, this.#config)
        this.#buildEvent()
        this.#onDrawCallback()

        if(!this.#infiniteScroll) {
            this.#handlingScrollToTop()
        }

        const container = this.#dataTable.table().container()
        const resizeObserver = new ResizeObserver(() => {
            this.#dataTable.columns.adjust()
        })
        resizeObserver.observe(container)
    }

    #buildConfig() {
        this.#config = {}

        this.#config.ajax = this.#getAjax()
        this.#config.processing = true
        this.#config.serverSide = this.#serverSide
        this.#config.columns = this.#getColumns()
        this.#config.columnDefs = this.#getColumnDefs()
        this.#config.buttons = this.#getButtons()
        this.#config.layout = Helper.isEmpty(this.#layouts) ? this.#defaultLayouts() : this.#layouts
        this.#config.scrollX = this.#getScrollX()
        
        if(!this.#infiniteScroll) {
            this.#config.pageLength = this.#pageLength
            this.#config.lengthMenu = this.#lengthMenu
        }

        if(this.#infiniteScroll) {
            const windowHeight = window.innerHeight
            const headerHeight = document.querySelector('#page-topbar')?.offsetHeight ?? 0
            const footerHeight = document.querySelector('footer.footer')?.offsetHeight ?? 0

            this.#config.stateSave = true
            this.#config.scrollY = (windowHeight - headerHeight - footerHeight - 100)
            this.#config.scrollCollapse = true
        }

        const emptyTable = !Helper.isEmpty(this.#emptyTableLabel) ? 
            this.#emptyTableLabel : 
            `<lord-icon 
                src="https://cdn.lordicon.com/jdgfsfzr.json"
                trigger="loop"
                delay="1000"
                stroke="light"
                colors="primary:#f06548,secondary:#f7b84b"
                style="width:120px;height:120px">
            </lord-icon>
            <h4>Oh dear! There's nothing to display</h4>`
            
        const zeroRecords = !Helper.isEmpty(this.#zeroRecordsLabel) ? 
            this.#zeroRecordsLabel : 
            `<lord-icon 
                src="https://cdn.lordicon.com/wjyqkiew.json"
                trigger="loop"
                delay="1000"
                state="morph-cross"
                stroke="light"
                colors="primary:#f7b84b,secondary:#f06548"
                style="width:120px;height:120px">
            </lord-icon>
            <h4>Sorry, no records fit your criteria</h4>`

        this.#config.language = {
            search: '',
            searchPlaceholder: 'Search',
            lengthMenu: '_MENU_',
            paginate: {
                previous: '<i class="mdi mdi-arrow-left-thin me-1"></i>Prev',
                next: 'Next<i class="mdi mdi-arrow-right-thin ms-1"></i>'
            },
            emptyTable: emptyTable,
            zeroRecords: zeroRecords,
        }

        this.#config.initComplete = async (settings, json) => {
            const lengthMenu = document.querySelector(`${this.#elementWrapper} .dt-length select`)
            lengthMenu?.classList.remove('form-select-sm')

            const search = document.querySelector(`${this.#elementWrapper} .dt-search input`)
            search?.classList.remove('form-control-sm')

            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
            
            if(this.#infiniteScroll) {
                this.#handleInfiniteScroll()
            }

            this.#renderCustomButtons()

            if(Helper.isFunction(this.#onComplete)) {
                this.#onComplete(settings, json)
            }
        }
    }

    //#region ajax

    #getAjax() {
        let ajax = null

        if(Helper.isObject(this.#ajax) && this.#ajax.hasOwnProperty('url')) {
            ajax = this.#getDefaultAjax()
        } else if(Helper.isString(this.#ajax) && this.#infiniteScroll) {
            ajax = this.#getInfiniteScrollAjax()
        }

        if(!Helper.isEmpty(ajax)) {
            this.#serverSide = true
        }

        return ajax
    }

    #getDefaultAjax() {
        const ajax = this.#ajax
        if(ajax.hasOwnProperty('type') && ajax.type.toLowerCase() == 'post' && !ajax.hasOwnProperty('headers')) {
            ajax.headers["X-CSRF-TOKEN"] = Helper.getCsrfToken()
        }

        ajax.data = (data) => {
            data = this.#getDefaultAjaxData(data)
        }

        return ajax
    }

    #getInfiniteScrollAjax() {
        return async (data, callback, settings) => {
            const state = this.#infiniteScrollState
            const api = settings.api

            data = this.#getDefaultAjaxData(data)

            console.log({state})

            if(state.isRefresh) {
                data.refresh = true
                await this.#getInfiniteScrollRefreshAjax(state, data, callback, api)
            } else if(state.isSearching || state.isSorting) {
                await this.#getInfiniteScrollSearchAjax(state, data, callback, api)
            } else {
                await this.#getInfiniteScrollDownAjax(state, data, callback, api)
            }
        }
    }

    async #getInfiniteScrollRefreshAjax(state, data, callback, api) {
        const url = this.#ajax
        const start = state.startIndex
        const length = state.endIndex == 0 ? state.length : Math.ceil(state.endIndex/state.length) * state.length

        const fetchData = await this.#fetchData({
            url: url, 
            draw: data.draw, 
            start: start, 
            length: length,
            data: data
        })

        state.recordsTotal = fetchData.recordsTotal
        state.recordsFiltered = fetchData.recordsFiltered
        state.endIndex = fetchData.data.length

        state.isRefresh = false
        api.clear()

        api.rows.add(fetchData.data)

        callback({
            draw: data.draw,
            recordsTotal: state.recordsTotal,
            recordsFiltered: state.recordsFiltered,
            data: api.data()
        })
    }

    async #getInfiniteScrollSearchAjax(state, data, callback, api) {
        const url = this.#ajax
        const start = 0
        const length = state.length

        state.start = 0
        state.startIndex = 0

        const fetchData = await this.#fetchData({
            url: url, 
            draw: data.draw, 
            start: start, 
            length: length,
            data: data
        })

        state.recordsTotal = fetchData.recordsTotal
        state.recordsFiltered = fetchData.recordsFiltered

        state.isSearching = false
        state.isSorting = false
        api.clear()

        state.totalData = fetchData.data.length
        state.endIndex = fetchData.data.length

        api.rows.add(fetchData.data)

        callback({
            draw: data.draw,
            recordsTotal: state.recordsTotal,
            recordsFiltered: state.recordsFiltered,
            data: api.data()
        })
    }

    async #getInfiniteScrollUpAjax(state, data, callback, api) {
        const url = this.#ajax
        
        if(state.totalData >= state.maxData) {
            const rowsToDelete = api.rows().indexes().toArray().reverse().slice(0, state.length)
            api.rows(rowsToDelete).remove()

            state.totalData -= rowsToDelete.length
            state.start -= rowsToDelete.length
            state.endIndex -= rowsToDelete.length
            state.startIndex -= rowsToDelete.length

            setTimeout(() => {
                callback({
                    draw: data.draw,
                    recordsTotal: state.recordsTotal,
                    recordsFiltered: state.recordsFiltered,
                    data: api.data()
                })
            }, 100)
        }

        let start = state.startIndex
        let length = state.length
        
        const fetchData = await this.#fetchData({
            url: url, 
            draw: data.draw, 
            start: start, 
            length: length,
            data: data
        })

        state.recordsTotal = fetchData.recordsTotal
        state.recordsFiltered = fetchData.recordsFiltered
        state.totalData += fetchData.data.length

        const oldData = api.data().toArray()
        const newData = fetchData.data.concat(oldData)

        api.clear()
        api.rows.add(newData)

        callback({
            draw: data.draw,
            recordsTotal: fetchData.recordsTotal,
            recordsFiltered: fetchData.recordsFiltered,
            data: api.data()
        })
    }

    async #getInfiniteScrollDownAjax(state, data, callback, api) {
        const url = this.#ajax

        if(state.totalData > state.maxData) {
            const rowsToDelete = api.rows().indexes().toArray().slice(0, state.removeOldData)
            api.rows(rowsToDelete).remove()

            state.totalData -= rowsToDelete.length
            state.startIndex += rowsToDelete.length

            callback({
                draw: data.draw,
                recordsTotal: state.recordsTotal,
                recordsFiltered: state.recordsFiltered,
                data: api.data()
            })

            return
        }

        let start = state.start
        let length = state.length

        const fetchData = await this.#fetchData({
            url: url, 
            draw: data.draw, 
            start: start, 
            length: length,
            data: data
        })

        state.recordsTotal = fetchData.recordsTotal
        state.recordsFiltered = fetchData.recordsFiltered
        state.totalData += fetchData.data.length
        state.endIndex += fetchData.data.length

        api.rows.add(fetchData.data)

        state.start += state.length

        callback({
            draw: data.draw,
            recordsTotal: fetchData.recordsTotal,
            recordsFiltered: fetchData.recordsFiltered,
            data: api.data()
        })
    }

    #getDefaultAjaxData(data) {
        const columns = data.columns
        columns.map((item, index) => {
            item.type = this.#columns[index]?.type ?? 'string' 
            return item
        })
        
        if(this.#customFilter) {
            data.filters = this.#customFilter
        }

        if(this.#customSort) {
            data.sort = this.#customSort
        }

        return data
    }

    async #fetchData({url, draw, start, length, data}) {
        try {
            const body = {
                draw: draw,
                start: start,
                length: length
            }

            for (const key in data) {
                if(!["draw", "start", "length"].includes(key)) {
                    body[key] = data[key]
                }
            }

            const req = await axios({
                method: 'POST',
                url: url,
                data: body
            })
    
            return req.data
        } catch (error) {
            console.error({error})
        }
    }

    //#endregion

    //#region render column
    
    #getColumns() {
        if(Helper.isEmpty(this.#columns)) {
            return []
        }

        const colMap = this.#columns.map(col => {
            const column = {}
            column.name = col.name ?? null
            column.data = col.data ?? null
            column.className = col.className ?? null

            return column
        })

        if(!Helper.isEmpty(this.#actionButtons)) {
            colMap.push({
                name: null,
                data: null,
                className: null
            })
        }

        return colMap
    }

    #getColumnDefs() {
        if(Helper.isEmpty(this.#columns)) {
            return null
        }

        const colMap = this.#columns.map((col, index) => {
            const column = {}

            column.targets = index
            column.searchable = col.searchable
            column.orderable = col.orderable

            if(col.render) {
                column.render = (data, type, row, meta) => {
                    if(type == 'display') {
                        return col.render(data, row)
                    }

                    return null
                }
            }

            return column
        })

        if(!Helper.isEmpty(this.#actionButtons)) {
            colMap.push({
                targets: -1,
                searchable: false,
                orderable: false,
                render: () => {
                    return this.#renderActionButton()
                }
            })
        }

        return colMap
    }

    #renderActionButton() {
        let button = `<div class="d-flex align-items-center justify-content-center">`
        
        const buttonWithoutGroup = this.#actionButtons.filter(item => !item.group)
        buttonWithoutGroup.forEach((btn, index) => {
            const selector = `dt-action-${btn.name}`
            const tooltip = btn.tooltip && !Helper.isEmpty(btn.title) ? `data-bs-toggle="tooltip" data-bs-placement="top" title="${btn.title}"` : ''
            let className = "btn btn-icon btn-sm waves-effect waves-light rounded-pill"
            const isPrintLabel = !Helper.isEmpty(btn.icon) && !Helper.isEmpty(btn.title) && !btn.tooltip

            let label = ''
            if(Helper.isEmpty(btn.icon) && !Helper.isEmpty(btn.title)) {
                label = btn.title
                className = className.replace('btn-icon', '')
            } else if(isPrintLabel) {
                label = `<i class="${btn.icon} me-1"></i>${btn.title}`
                className = className.replace('btn-icon', '')
            } else {
                label = `<i class="${btn.icon}"></i>`
            }

            if(buttonWithoutGroup.length > 1 && index != buttonWithoutGroup.length-1 && isPrintLabel) {
                className += " me-2"
            }
            button += `<a href="javascript:;" class="${selector} ${className}" ${tooltip}>${label}</a>`
        })

        const buttonWithGroup = Object.values(
            this.#actionButtons
                .filter(item => !Helper.isEmpty(item.group))
                .reduce((acc, item) => {
                    if (!acc[item.group]) {
                        acc[item.group] = { group: item.group, items: [] }
                    }

                    acc[item.group].items.push(item)
                    return acc
                }, {})
        )

        buttonWithGroup.forEach((group, index) => {
            button += '<div class="dropdown">' +
                    '<button class="btn btn-icon btn-sm waves-effect waves-light rounded-pill dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="true">' +
                        '<i class="ri-more-2-fill"></i>' +
                    '</button>'
            
            button += '<ul class="dropdown-menu dropdown-menu-end" data-popper-placement="bottom-end">'
            group.items.forEach(btn => {
                const selector = `dt-action-${btn.name}`
                const tooltip = btn.tooltip && !Helper.isEmpty(btn.title) ? `data-bs-toggle="tooltip" data-bs-placement="top" title="${btn.title}"` : ''
                const isPrintLabel = !Helper.isEmpty(btn.icon) && !Helper.isEmpty(btn.title) && !btn.tooltip

                let label = ''
                if(Helper.isEmpty(btn.icon) && !Helper.isEmpty(btn.title)) {
                    label = btn.title
                } else if(isPrintLabel) {
                    label = `<i class="${btn.icon} me-1"></i>${btn.title}`
                } else {
                    label = `<i class="${btn.icon}"></i>`
                }

                if(length > 1 && i != length-1 && isPrintLabel) {
                    className += " me-2"
                }
                button += `<li><a href="javascript:;" class="${selector} dropdown-item" ${tooltip}>${label}</a></li>`
            })
            button += '</ul></div>'
        })

        button += '</div>'

        return button
    }

    #handlingAutoNumber(columnIndex) {
        const startIndex = this.#dataTable.context[0]._iDisplayStart
        this.#dataTable.column(columnIndex, {search: 'applied', order: 'applied'}).nodes().each(function(cell, i) {
            cell.innerHTML = startIndex + i + 1
        })
    }
    
    //#endregion

    #getButtons() {
        const buttons = []

        const length = this.#buttons.length
        for (let i=0; i<length; i++) {
            const el = this.#buttons[i]
            if(length > 1 && i != length-1) {
                el.className += " me-2"
            }

            buttons.push(el)
        }

        return buttons
    }

    #defaultLayouts() {
        const def = {
            topStart: ['pageLength', 'info'],
            topEnd: ['buttons', 'search'],
            bottomStart: null,
            bottom: {
                paging: {
                    type: 'simple_numbers'
                }
            },
            bottomEnd: null
        }

        if(this.#infiniteScroll) {
            def.topStart = ['info'],
            def.bottom = null
        }

        return def
    }

    #getScrollX() {
        return this.#infiniteScroll ? false : this.#scrollX
    }

    #handleInfiniteScroll() {
        const state = this.#infiniteScrollState
        const dtScrollBody = document.querySelector(`${this.#elementWrapper} div.dt-scroll div.dt-scroll-body`)
        let currentScroll = 0

        if(dtScrollBody) {
            const getVisibleIndices = () => {
                let firstIndex = null, lastIndex = null

                const containerRect = dtScrollBody.getBoundingClientRect()
                const rows = dtScrollBody.querySelectorAll('table tbody tr')
        
                rows.forEach((row, index) => {
                    const rowRect = row.getBoundingClientRect()
                    const isPartiallyVisible = rowRect.bottom >= containerRect.top && rowRect.top <= containerRect.bottom

                    if (isPartiallyVisible) {
                        if (firstIndex === null) {
                            firstIndex = index
                        }

                        lastIndex = index
                    }
                })
        
                return { firstIndex, lastIndex }
            }

            const dtInfo = document.querySelector(`${this.#elementWrapper} div.dt-info`)
            const updateDtInfo = () => {
                if(!dtInfo) {
                    return
                }

                const info = getVisibleIndices()
                const firstIndex = (info.firstIndex + 1) + state.startIndex
                const lastIndex = (info.lastIndex + 1) + state.startIndex

                const isSearching = state.recordsTotal != state.recordsFiltered
                dtInfo.textContent = !isSearching ? 
                    `Showing ${firstIndex} to ${lastIndex} of ${state.recordsTotal} entries` :
                    `Showing ${firstIndex} to ${lastIndex} of ${state.recordsFiltered} entries (filtered from ${state.recordsTotal} total entries)`
            }
            
            dtScrollBody.addEventListener('scroll', async () => {
                if((dtScrollBody.scrollTop + dtScrollBody.clientHeight >= dtScrollBody.scrollHeight) && state.endIndex != state.recordsFiltered) {
                    state.scroll = 'down'

                    this.#dataTable.draw(false)
                } else if(dtScrollBody.scrollTop === 0 && state.startIndex > 0) {
                    state.scroll = 'up'


                    this.#dataTable.draw(false)
                }

                updateDtInfo()
            })
            
            let previousScrollHeight = 0
            this.#dataTable
                .on('preDraw.dt', () => {
                    if(state.scroll == 'up') {
                        previousScrollHeight = dtScrollBody.scrollHeight
                    } else {
                        currentScroll = dtScrollBody.scrollTop
                    }
                })
                .on('draw.dt', () => {
                    if(state.scroll == 'up') {
                        const newScrollHeight = dtScrollBody.scrollHeight
                        const addedHeight = newScrollHeight - previousScrollHeight
                        dtScrollBody.scrollTop = addedHeight


                    } else {
                        dtScrollBody.scrollTop = currentScroll
                    }

                    updateDtInfo()
                })

            updateDtInfo()
        }

        const searchInput = document.querySelector(`${this.#elementWrapper} .dt-search input[type="search"]`)
        if(searchInput) {
            $(searchInput).off()

            const debounce = _.debounce((value) => {
                state.isSearching = true
                this.#dataTable.search(value).draw(false)
            }, 400)

            searchInput.addEventListener('input', (e) => {
                debounce(e.target.value)
            })
        }
    }

    #renderCustomButtons() {
        const dtButtons = document.querySelector(`${this.#elementWrapper} div.dt-buttons`)
        if(!dtButtons || !this.#customButtons || (this.#customButtons && this.#customButtons.length == 0)) {
            return
        }

        this.#customButtons.forEach(btn => {
            let elem
            if(btn.element instanceof Element) {
                elem = btn.element

                dtButtons.appendChild(btn.element)
            } else if(Helper.isString(btn.element)) {
                const template = document.createElement("template")
                template.innerHTML = btn.element.trim()
                elem = template.content.firstElementChild

                dtButtons.appendChild(elem)
            }

            if(Helper.isFunction(btn.action)) {
                elem.addEventListener('click', () => btn.action)
            }
        })
    }

    #buildEvent() {
        if(!this.#dataTable) {
            throw new Error("Cannot build events because DataTable not rendered")
        }

        for(let i=0; i<this.#events.length; i++) {
            const event = this.#events[i]
            const selector = event.selector

            this.#dataTable.on(event.type, selector, (e) => {
                const data = this.#dataTable.row(e.target.closest('tr')).data()
                event.action(data)
            })
        }
    }

    #onDrawCallback() {
        this.#dataTable.on('draw.dt', (settings) => {
            this.#columns.forEach((col, index) => {
                if(col.isAutoNumber) {
                    this.#handlingAutoNumber(index)
                }
            })

            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl, {
                    boundary: document.body
                })
            })

            this.#dropdownResponsiveHanlde()
            this.#textTruncateHandle()

            if(Helper.isFunction(this.#onDraw)) {
                this.#onDraw(settings)
            }
        })
    }

    #handlingScrollToTop() {
        this.#dataTable.on('page.dt', () => {
            $('html, body').animate({
                scrollTop: $(`${this.#elementWrapper}`).offset().top
            }, 'slow')
        })
    }

    #dropdownResponsiveHanlde() {
        const dropdowns = document.querySelectorAll(`${this.#elementWrapper} div.dropdown`)
        const tableBody = document.querySelector(`${this.#elementWrapper} .dt-scroll-body`)

        dropdowns?.forEach(el => {
            el.addEventListener('show.bs.dropdown', (event) => {
                const dropdownItem = el.querySelector('ul')

                let tableHeight = getComputedStyle(tableBody, null).height
                tableHeight = parseFloat(tableHeight.substring(0, tableHeight.length-2))
                const dropdownHeight = 40 * (dropdownItem.children.length) + 40

                if(dropdownHeight > tableHeight) {
                    tableBody.style.paddingBottom = dropdownHeight + 'px'
                }
            })

            el.addEventListener('hide.bs.dropdown', (event) => {
                tableBody.style.paddingBottom = ""
            })
        })
    }

    #textTruncateHandle() {
        const textTruncate = document.querySelectorAll(`${this.#elementWrapper} tbody tr td .text-truncate`)
        textTruncate?.forEach(el => {
            const maxWidth = el.style.maxWidth
            el.addEventListener('click', (e) => {
                if(el.classList.contains('text-truncate')) {
                    el.classList.remove('d-inline-block', 'text-truncate')
                    el.style.maxWidth = null
                } else {
                    el.classList.add('d-inline-block', 'text-truncate')
                    el.style.maxWidth = maxWidth
                }
                
                el.parentElement.classList.toggle('text-wrap')
            })
        })
    }

    //#endregion

    async refresh(resetPage = false, isSearching = false) {
        if(!this.#dataTable) {
            throw new Error("Cannot refresh because DataTable not rendered")
        }
        
        if(this.#infiniteScroll) {
            if(isSearching) {
                this.#infiniteScrollState.isSearching = true
            } else {
                this.#infiniteScrollState.isRefresh = true
            }
        }

        return await new Promise((resolve) => {
            this.#dataTable.ajax.reload(() => {
                resolve()
            }, resetPage)
        })
    }
}