import Helper from "./helper"
import BaseInput from "./base-input"

export default class FileInput extends BaseInput {
    constructor(selector) {
        super()
        
        this._init(selector)
        if(Helper.isEmpty(this._id)) {
            throw new Error(`Selector must have id`)
        }

        this._oldValue = this.get()
    }

    //#region static

    static supportedElement() {
        return ["file"]
    }

    static supportedEvent() {
        return ["change"]
    }

    //#endregion

    //#region public

    get() {
        const files = this._element.files
        return files.length >= 1 ? files : null
    }

    set(value, isSilent = false) {
        if(value === null) {
            this._element.value = value

            const isChanged = this._isChanged()
            this._oldValue = value
            if(!isSilent && isChanged) {
                this.trigger('change', this.get())
            }

            return
        }

        throw new Error("Element with type file cannot be set directly")
    }
}