import BaseInput from "./base-input"
import Helper from "./helper"

export default class TextInput extends BaseInput {
    constructor(selector) {
        super()
        
        this._init(selector)
        if(Helper.isEmpty(this._id)) {
            throw new Error(`Selector must have id`)
        }

        this._oldValue = this.get()
    }

    static supportedElement() {
        return ["text", "password", "email", "textarea"]
    }

    static supportedEvent() {
        return ["input", "change", "keydown", "keyup", "keypress", "focus", "blur"]
    }

    get() {
        return this._element.value
    }

    set(value, isSilent = false) {
        this._element.value = value

        const isChanged = this._isChanged()
        this._oldValue = value
        if(!isSilent && isChanged) {
            this.trigger('change', this.get())
        }
    }
}