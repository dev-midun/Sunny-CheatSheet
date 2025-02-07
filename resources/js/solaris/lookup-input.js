import Helper from './helper'
import BaseInput from './base-input'

export default class LookupInput extends BaseInput {
    #select2 = null
    #placeholder = ''
    #defaultValue = null
    #config = null
    #pagination = false
    constructor(selector, config) {
        super()

        this._init(selector)

        this.#placeholder = $(this._element).attr('solar-form-placeholder')

        const defaultValue = $(this._element).attr('solar-form-lookup-value')
        try {
            if(defaultValue) {
                this.#defaultValue = JSON.parse(defaultValue.replace(/&amp;quot;/g, '"'))
            }
        } catch (error) {}
        
        this.#config = config

        if(this.#config?.pagination ?? false) {
            this.#pagination = this.#config.pagination
            delete this.#config.pagination
        }

        this.#init()
    }

    static supportedElement() {
        return ["select-one"]
    }

    static supportedEvent() {
        return ["change", "open", "select", "unselect", "clear"]
    }

    static processResults(callback = null) {
        const func = (data) => {
            if(callback) {
                return callback(data)
            }
            
            return {
                results: data.map(item => ({id: item.id, text: item.name}))
            }
        }

        return func
    }

    static ajaxData(callback = null, isPagination = false) {
        const func = (params) => {
            const param = {
                search: params.term
            }

            if(isPagination) {
                param.length = 10
                param.page = params.page || 1 
            }

            if(callback) {
                return JSON.stringify(callback(param))
            }

            return JSON.stringify(param)
        }

        return func
    }

    get() {
        const value = this.#select2.select2("data")
        if(value.length == 0) {
            return null
        }

        const defaultValue = [
            "disabled",
            "element",
            "id",
            "selected",
            "text",
            "_resultId",
        ];

        const lookupValue = {};
        Object.keys(value[0]).forEach((item) => {
            if (!defaultValue.includes(item)) {
                lookupValue[item] = value[0][item];
            }
        });

        lookupValue.id = value[0].id
        lookupValue.name = value[0].text.trim()

        return !Helper.isEmpty(lookupValue.id) ? lookupValue : null
    }

    set(value, isSilent = false) {
        const isChanged = this._isChanged(value)
        this._oldValue = value

        if(value === null) {
            $(this._element).val(null).trigger('change')
            if(!isSilent && isChanged) {
                this.trigger('change', value)
            }

            return
        }

        const isLookup = Helper.isLookup(value)
        const isString = Helper.isString(value)
        if(!isLookup && !isString) {
            throw new Error("Value must be lookup or string")
        }

        let isValExists = false
        const _value = isLookup ? value.id : value

        if ($(this._element).find(`option[value="${_value}"]`).length) {
            $(this._element).val(_value).trigger('change')
            if(!isSilent && isChanged) {
                this.trigger('change', value)
            }

            isValExists = true
        }

        if(this.isServerSide() && !isValExists) {
            if(isString) {
                throw new Error("Value must be lookup for server side lookup")
            }

            const newOption = new Option(value.name, value.id, true, true)
            $(this._element).append(newOption).trigger('change')
            
            if(!isSilent && isChanged) {
                this.trigger('change', value)
                // $(this._element).trigger({
                //     type: 'select2:select',
                //     params: {
                //         data: value
                //     }
                // })
            }
        }
    }

    on(type, callback) {
        const supportedEvent = LookupInput.supportedEvent()        
        if(!supportedEvent.includes(type)) {
            throw new Error(`Event ${type} does not support`)
        }

        if(!Helper.isFunction(callback)) {
            throw new Error(`Callback must be function`)
        }

        this._events.push({
            type: type,
            callback: callback
        })
        
        if(type != 'change') {
            $(this._element).on(`select2:${type}`, (e) => {
                callback(this.get())
            })
        }
    }

    #init() {
        if(this.#config) {
            if(!this.#config.hasOwnProperty('placeholder')) {
                this.#config.placeholder = this.#placeholder
            }

            const allowClear = this.#config.hasOwnProperty('allowClear') ? this.#config.allowClear : false
            if(allowClear && Helper.isEmpty(this.#placeholder)) {
                throw new Error("If allowClear is setup, placeholder cannot be empty")
            }

            const ajax = this.isServerSide() ? this.#config.ajax : null
            if(ajax && !ajax.hasOwnProperty('processResults')) {
                this.#config.ajax.processResults = LookupInput.processResults()
            }

            if(ajax && this.#config.hasOwnProperty('data')) {
                const data = this.#config.data
                delete this.#config.data

                this.#config.ajax.data = LookupInput.ajaxData(data, this.#pagination)
            } else if(ajax && !ajax.hasOwnProperty('data')) {
                this.#config.ajax.data = LookupInput.ajaxData(null, this.#pagination)
            }
        }
        
        this.#select2 = $(this._element).select2(this.#config ?? {}) 

        if(this.#defaultValue) {
            this.set(this.#defaultValue, true)
        } else {
            this.#select2.val(null).trigger('change')    
        }

        this._oldValue = this.get()

        const isChanged = () => {
            const value = this.get()
            const isChanged = this._isChanged(value)
            this._oldValue = value

            if(isChanged) {
                this.trigger('change', value)
            }
        }

        $(this._element).on(`select2:select`, (e) => {
            isChanged()
        })

        $(this._element).on(`select2:unselect`, (e) => {
            isChanged()
        })

        $(this._element).on('select2:unselecting', function() {
            $(this).data('unselecting', true)
        })
        
        $(this._element).on('select2:opening', function(e) {
            if ($(this).data('unselecting')) {
                $(this).removeData('unselecting')
                e.preventDefault()
            }
        })
    }

    isServerSide() {
        const ajax = this.#config && this.#config.hasOwnProperty('ajax') ? this.#config.ajax : null
        const isUrlExists = ajax && ajax.hasOwnProperty('url') ? true : false

        return isUrlExists
    }

    _isChanged(value) {
        return this._oldValue?.id !== value?.id 
    }
}