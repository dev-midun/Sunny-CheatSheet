import Cleave from 'cleave.js'
import 'cleave.js/dist/addons/cleave-phone.id'
import Helper from './helper'
import BaseInput from './base-input'

export default class NumberInput extends BaseInput {
    #cleave = null
    #mode = ''
    constructor(selector, config) {
        super()
        
        this._init(selector)

        this.#mode = selector.getAttribute('solar-form')
        if(!["creditcard", "phone", "number", "decimal"].some(item => this.#mode.includes(item))) {
            throw new Error('Selector must have data attribute data-form with value "creditcard, phone, number, decimal"')
        }

        this.#cleave = new Cleave(this._element, config)
        this._oldValue = this.get()
    }

    static supportedElement() {
        return ["text"]
    }

    static supportedEvent() {
        return ["change"]
    }

    get() {
        const rawValue = this.#cleave.getRawValue()
        if(this.#mode.includes("decimal")) {
            return Helper.isNumber(rawValue) ? parseFloat(rawValue) : 0   
        }

        if(this.#mode == 'number') {
            return Helper.isNumber(rawValue) ? parseInt(rawValue) : 0
        }

        return rawValue
    }

    getFormatted() {
        return this.#cleave.getFormattedValue()
    }

    set(value, isSilent = false) {
        this.#cleave.setRawValue(value)

        const isChanged = this._isChanged(value)
        this._oldValue = value
        if(!isSilent && isChanged) {
            this.trigger('change', this.get())
        }
    }

    _isChanged(value) {
        if(this.#mode == 'number' || this.#mode.includes("decimal")) {
            value = Helper.isNumber(value) ? value : 0
            if(this.#mode == 'number') {
                return this._oldValue !== parseInt(value)
            }
            
            return this._oldValue !== parseFloat(value)
        }

        return super._isChanged(value)
    }
}