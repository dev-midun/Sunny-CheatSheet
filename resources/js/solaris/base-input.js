import Helper from "./helper"

export default class BaseInput  {
    _oldValue = null
    _events = []
    _id = ''
    _element = null
    _isRequired = false
    _isDisabled = false
    _isHidden = false
    _labelElement = null
    _messageElement = null
    _hiddenElement = null
    _elementType = ''

    static supportedElement() {
        return []
    }

    static supportedEvent() {
        return []
    }

    //#region public

    get() {
        return null
    }

    set(value, isSilent = false) {

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

        this._element.addEventListener(type, (e) => {
            callback(this.get())
        })
    }

    trigger(event, data) {
        this._events
            .filter(e => e.type == event)
            .forEach(e => e.callback(data ?? this.get()))
    }

    error(message) {
        this._setMessage(message, true)
    }

    valid(message) {
        this._setMessage(message, false)
    }

    disabled(value = true) {
        if(typeof value !== 'boolean') {
            throw new Error(`Value must be boolean`)
        }

        this._element.disabled = value
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
            if(value) {
                this._element.classList.add('d-none')
            } else {
                this._element.classList.remove('d-none')
            }
        }

        this._isHidden = value
    }

    required(value = true) {
        if(typeof value !== 'boolean') {
            throw new Error(`Value must be boolean`)
        }
        
        const isRequired = this._isRequired
        this._isRequired = value

        if((isRequired && !value) || (!isRequired && value)) {
            this.setLabel(this.getLabel())
        }
    }

    getLabel() {
        return this._labelElement?.childNodes[0].data.trim()
    }

    setLabel(label) {
        if(!this._labelElement) {
            return
        }
        
        if(!this._isRequired) {
            this._labelElement.textContent = label
        } else {
            this._labelElement.innerHTML = `${label} <span class="text-danger">*</span>`
        }
    }

    isRequired() {
        return this._isRequired
    }

    isDisabled() {
        return this._isDisabled
    }

    isHidden() {
        return this._isHidden
    }

    //#endregion

    //#region private

    _init(selector) {
        if(Helper.isString(selector) && !Helper.isEmpty(selector)) {
            let element = document.querySelector(selector)
            if(!element) {
                throw new Error(`Element with query selector ${selector} is not found`)
            }

            selector = element
        } else if(!(selector instanceof Element)) {
            throw new Error(`Selector is not supported`)
        }

        if(!this.constructor.supportedElement().includes(selector.type)) {
            throw new Error(`Selector ${selector.type} is not supported`)
        }

        this._element = selector
        this._id = this._element.id
        this._elementType = this._element.type
        this._isRequired = selector.getAttribute('solar-form-required') == "true"

        const formLabel = selector.getAttribute('solar-form-label')
        if(!Helper.isEmpty(formLabel)) {
            this._labelElement = document.querySelector(formLabel)
        }

        const formMessage = selector.getAttribute('solar-form-message')
        if(!Helper.isEmpty(formMessage)) {
            this._messageElement = document.querySelector(formMessage)
        }

        const formHidden = selector.getAttribute('solar-form-hidden')
        if(!Helper.isEmpty(formHidden)) {
            this._hiddenElement = document.querySelector(formHidden)
        }
    }

    _setMessage(message, isError) {
        if(!this._messageElement) {
            console.warn(`Element ${this._id} not have message feedback element`)
            return
        }

        if(Helper.isEmpty(message)) {
            this._element.classList.remove(isError ? 'is-invalid' : 'is-valid')
            this._messageElement.classList.remove(isError ? 'invalid-feedback' : 'valid-feedback', 'd-block')
        } else {
            this._element.classList.remove('is-valid', 'is-invalid')
            this._messageElement.classList.remove('valid-feedback', 'invalid-feedback', 'd-block')
            
            this._element.classList.add(isError ? 'is-invalid' : 'is-valid')
            this._messageElement.classList.add(isError ? 'invalid-feedback' : 'valid-feedback', 'd-block')
        }
        
        this._messageElement.textContent = message
    }

    _isChanged() {
        return this._oldValue !== this.get()
    }

    //#endregion
}