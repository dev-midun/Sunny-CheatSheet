import BaseInput from "./base-input"
import Helper from "./helper"

export default class SelectInput extends BaseInput {
    constructor(selector) {
        super()
        
        this._init(selector)
        if(Helper.isEmpty(this._id)) {
            throw new Error(`Selector must have id`)
        }

        this._oldValue = this.get()
    }

    static supportedElement() {
        return ["select-one", "select-multiple"]
    }

    static supportedEvent() {
        return ["change"]
    }

    get() {
        return this._elementType == "select-one" ? this.#getSingle() : this.#getMultiple()
    }

    set(value, isSilent = false) {
        if(this._elementType == "select-one") {
            this.#setSingleSelect(value)
        } else {
            this.#setMultipleSelect(value)
        }

        const isChanged = this._isChanged(value)
        this._oldValue = value
        if(!isSilent && isChanged) {
            this.trigger('change', this.get())
        }
    }

    #getSingle() {
        return !Helper.isEmpty(this._element.value) ? {
            id: this._element.value,
            name: this._element.text
        } : null
    }

    #getMultiple() {
        const options = Array.from(this._element.selectedOptions)
            .filter(opt => !Helper.isEmpty(opt.value))

        return options.length > 0 ? 
            options.map(opt => {
                return {
                    id: opt.value,
                    name: opt.text
                }
            }) : null
    }

    #setSingleSelect(value) {
        if(value === null) {
            this._element.value = ""
            return
        }

        const isLookup = Helper.isLookup(value)
        if(!isLookup && !Helper.isString(value)) {
            throw new Error("Value must be lookup or string for select element")
        }

        this._element.value = isLookup ? value.id : value
    }

    #setMultipleSelect(value) {
        const options = Array.from(this._element.options)

        if(value === null) {
            options.forEach(opt => {
                opt.selected = false
            })

            return
        }

        const setFromObject = (value) => {
            if(!value.hasOwnProperty('id') || !value.hasOwnProperty('selected')) {
                throw new Error(`Value must have id and selected property`)
            }

            if(typeof value.selected !== 'boolean') {
                throw new Error(`Selected must be boolean`)
            }

            const opt = options.find(opt => opt.value == value.id)
            opt.selected = value.selected
        }

        if(Helper.isObject(value)) {
            setFromObject(value)
            return
        }

        if(Array.isArray(value)) {
            value.forEach(val => {
                if(Helper.isObject(val)) {
                    setFromObject(val)
                } else if(Helper.isString(val)) {
                    const opt = options.find(opt => opt.value == val)
                    opt.selected = true
                } else {
                    throw new Error("Value is not support")
                }
            })

            return
        }

        throw new Error("Value is not support")
    }

    _isChanged() {
        const value = this.get()
        if(this._elementType == "select-one") {
            return this._oldValue?.id !== value?.id
        }

        if(this._elementType == "select-multiple") {
            if (!Array.isArray(this._oldValue) || !Array.isArray(value)) {
                return true
            }

            if(this._oldValue.length !== value.length) {
                return true
            }

            const isDifferent = this._oldValue.some(oldVal => {
                return !value.some(val => val.id === oldVal.id)
            })

            const reverseDifferent = value.some(val => {
                return !this._oldValue.some(oldVal => oldVal.id === val.id)
            })

            return isDifferent || reverseDifferent
        }
    }
}