import BaseInput from "./base-input"
import Helper from "./helper"

export default class OptionInput extends BaseInput {
    _elements = []
    
    constructor(selector) {
        super()

        if(Helper.isString(selector) && !Helper.isEmpty(selector)) {
            let element = document.querySelector(selector)
            if(!element) {
                throw new Error(`Element with query selector ${selector} is not found`)
            }

            selector = element
        }
        
        if(selector instanceof NodeList || Array.isArray(selector)) {
            if(selector.length == 0) {
                throw new Error(`Element NodeList or array cannot be empty`)
            }

            selector.forEach(el => {
                if(!(el instanceof Element)) {
                    throw new Error(`Item of array must be Element`)
                }

                if(!OptionInput.supportedElement().includes(el.type)) {
                    throw new Error(`Element ${el.type} is not supported`)
                }

                if(Helper.isEmpty(el.id)) {
                    throw new Error(`Element must have id`)
                }

                if(selector.length > 1 && Helper.isEmpty(el.name)) {
                    throw new Error(`Group element must have name`)
                }
            })

            if(selector instanceof NodeList) {
                selector = Array.from(selector)
            }
        } else if(selector instanceof Element) {
            if(!OptionInput.supportedElement().includes(selector.type)) {
                throw new Error(`Element ${selector.type} is not supported`)
            }
            
            if(Helper.isEmpty(selector.id)) {
                throw new Error(`Selector must have id`)
            }

            selector = [selector]
        } else {
            throw new Error(`Selector is not supported`)
        }

        this._elements = selector
        this._id = this._elements[0].id
        this._elementType = this._elements[0].type
        this._isRequired = this._elements[0].getAttribute('solar-form-required') == "true"

        const formLabel = this._elements[0].getAttribute('solar-form-label')
        if(!Helper.isEmpty(formLabel)) {
            this._labelElement = document.querySelector(formLabel)
        }

        const formMessage = this._elements[0].getAttribute('solar-form-message')
        if(!Helper.isEmpty(formMessage)) {
            this._messageElement = document.querySelector(formMessage)
        }

        const formHidden = this._elements[0].getAttribute('solar-form-hidden')
        if(!Helper.isEmpty(formHidden)) {
            this._hiddenElement = document.querySelector(formHidden)
        }

        this._oldValue = this.get()
    }

    //#region static

    static supportedElement() {
        return ["radio", "checkbox", "switch"]
    }

    static supportedEvent() {
        return ["change"]
    }

    //#endregion

    //#region public

    isGroup() {
        return this._elements.length > 1
    }

    getType() {
        return this._elementType
    }

    get() {
        if(this.isGroup() && this._elementType == 'radio') {
            return this.#getGroupRadio()
        }

        if(!this.isGroup() && this._elementType == 'radio') {
            return this.#getSingleRadio()
        }

        if(this.isGroup() && this._elementType == 'checkbox') {
            return this.#getGroupCheckbox()
        }

        if(!this.isGroup() && this._elementType == 'checkbox') {
            return this.#getSingleCheckbox()
        }

        return null
    }

    set(value, isSilent = false) {
        if(!this.isGroup()) {
            this.#setSingle(value, isSilent)
        } else if(this.isGroup() && this._elementType == 'checkbox') {
            this.#setGroupCheckbox(value, isSilent)
        } else if(this.isGroup() && this._elementType == 'radio') {
            this.#setGroupRadio(value, isSilent)
        }

        const isChanged = this._isChanged(value)
        this._oldValue = this.get()
        if(!isSilent && isChanged) {
            this.trigger('change', this.get())
        }
    }

    on(type, callback) {
        if(!this.constructor.supportedEvent().includes(type)) {
            throw new Error(`Event ${type} does not support`)
        }

        if(!Helper.isFunction(callback)) {
            throw new Error(`Callback must be function`)
        }

        this._events.push({
            type: type,
            callback: callback
        })

        this._elements.forEach((el, index) => {
            el.addEventListener(type, (e) => {
                callback(this.get())
            })
        })
    }

    disabled(value = true) {
        if(!this.isGroup()) {
            if(typeof value !== 'boolean') {
                throw new Error(`Value must be boolean for single option`)
            }

            this._elements[0].disabled = value
            this._isDisabled = value

            return
        }

        if(typeof value === 'boolean') {
            this._elements.forEach(el => {
                el.disabled = value
            })
            this._isDisabled = value

            return
        }

        if(!Helper.isObject(value)) {
            throw new Error(`Value must be object for radio group option`)
        }

        if(!value.hasOwnProperty('id') || !value.hasOwnProperty('disabled')) {
            throw new Error(`Value must have id and checked property`)
        }

        if(typeof value.disabled !== 'boolean') {
            throw new Error(`Disabled must be boolean`)
        }

        const radio = this._elements.find(el => el.id = value.id)
        if(!radio) {
            throw new Error(`Radio with id ${value.id} not found`)
        }

        radio.disabled = value.disabled
        this._isDisabled = value
    }

    hidden(value = true) {
        if(typeof value !== 'boolean') {
            throw new Error(`Value must be boolean`)
        }

        if(this._hiddenElement) {
            if(value) {
                this._hiddenElement.classList.add('d-none')
            } else {
                this._hiddenElement.classList.remove('d-none')
            }
        } else {
            this._elements.forEach(el => {
                if(value) {
                    el.classList.add('d-none')
                } else {
                    el.classList.remove('d-none')
                }
            })
        }

        this._isHidden = value
    }

    //#endregion

    //#region private

    //#region get

    #getSingleCheckbox() {
        return this._elements[0].checked
    }

    #getGroupCheckbox() {
        const checked = this._elements
            .filter(el => el.checked)
            .map(el => {
                return {
                    id: el.id,
                    value: el.value
                }
            })
        
        return checked.length == 0 ? null : checked
    }

    #getSingleRadio() {
        const checked = this._elements[0].checked
        return checked ? {
            id: this._elements[0].id,
            value: this._elements[0].value
        } : null 
    }

    #getGroupRadio() {
        const checked = this._elements
            .filter(el => el.checked)
            .map(el => {
                return {
                    id: el.id,
                    value: el.value
                }
            })

        return checked.length == 0 ? null : checked[0]
    }

    //#endregion get

    //#region set

    #setSingle(value) {
        if(typeof value !== 'boolean') {
            throw new Error(`Value must be boolean for single option`)
        }

        this._elements[0].checked = value
    }

    #setGroupCheckbox(value) {
        if(value === null) {
            this._elements.forEach((el, index) => {
                el.checked = false
            })

            return
        }

        if(!Helper.isObject(value)) {
            throw new Error(`Value must be object for radio group option`)
        }

        if(!value.hasOwnProperty('id') || !value.hasOwnProperty('checked')) {
            throw new Error(`Value must have id and checked property`)
        }

        if(typeof value.checked !== 'boolean') {
            throw new Error(`Checked must be boolean`)
        }

        const index = this._elements.findIndex(el => el.id == value.id)
        const option = this._elements[index]
        if(!option) {
            throw new Error(`Element with id ${value.id} not found`)
        }

        option.checked = value.checked
    }

    #setGroupRadio(value) {
        if(value === null) {
            this._elements.forEach((el, index) => {
                el.checked = false
            })

            return
        }

        if(!Helper.isObject(value)) {
            throw new Error(`Value must be object for radio group option`)
        }

        if(!value.hasOwnProperty('id') || !value.hasOwnProperty('checked')) {
            throw new Error(`Value must have id and checked property`)
        }

        if(typeof value.checked !== 'boolean') {
            throw new Error(`Checked must be boolean`)
        }

        const index = this._elements.findIndex(el => el.id == value.id)
        const option = this._elements[index]
        if(!option) {
            throw new Error(`Element with id ${value.id} not found`)
        }

        if(value.checked) {
            this._elements
                .filter(el => el.id != value.id)
                .forEach(el => {
                    el.checked = false
                })
        }
        const isChanged = option.checked != value.checked
        if(isChanged) {
            option.checked = value.checked
        }
    }

    //#endregion

    _setMessage(message, isError) {
        if(!this._messageElement) {
            console.warn(`Element ${this._id} not have message feedback element`)
            return
        }

        this._elements.forEach(el => {
            if(Helper.isEmpty(message)) {
                el.classList.remove(isError ? 'is-invalid' : 'is-valid')
            } else {
                el.classList.remove('is-valid', 'is-invalid')
                el.classList.add(isError ? 'is-invalid' : 'is-valid')
            }
        })

        if(Helper.isEmpty(message)) {
            this._messageElement.classList.remove(isError ? 'invalid-feedback' : 'valid-feedback', 'd-block')
        } else {
            this._messageElement.classList.remove('valid-feedback', 'invalid-feedback', 'd-block')
            this._messageElement.classList.add(isError ? 'invalid-feedback' : 'valid-feedback', 'd-block')
        }

        this._messageElement.textContent = message
    }

    _isChanged() {
        const value = this.get()
        if(!this.isGroup()) {
            return super._isChanged(value)
        }
        
        if (!Array.isArray(this._oldValue) || !Array.isArray(value)) {
            return true
        }

        if(this._oldValue.length !== value.length) {
            return true
        }

        const isDifferent = this._oldValue.some(oldVal => {
            return !value.some(val => val.id === oldVal.id && val.name === oldVal.name)
        })

        const reverseDifferent = value.some(val => {
            return !this._oldValue.some(oldVal => oldVal.id === val.id && oldVal.name === val.name)
        })

        return isDifferent || reverseDifferent
    }

    //#endregion
}