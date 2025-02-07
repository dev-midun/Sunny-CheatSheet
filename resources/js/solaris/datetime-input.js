import Helper from "./helper"
import flatpickr from "flatpickr"
import BaseInput from "./base-input"

export default class DateTimeInput extends BaseInput {
    #flatpickr = null
    #mode = ''
    constructor(selector, config) {
        super()

        this._init(selector)

        this.#mode = selector.getAttribute('solar-form')
        if(!["datetime", "date", "time"].includes(this.#mode)) {
            throw new Error('Selector must have data attribute data-form with value "datetime, date, time"')
        }

        this.#flatpickr = flatpickr(this._element, config)
        this._oldValue = this.get()
    }

    static supportedElement() {
        return ["text"]
    }

    static supportedEvent() {
        return ["change", "open", "close", "ready", "day-create"]
    }

    get() {
        if(this.#flatpickr.selectedDates.length == 0) {
            return null
        }

        return this.#flatpickr.config.mode == "single" ? (this.#flatpickr.selectedDates[0]) : this.#flatpickr.selectedDates
    }

    toString() {
        if(this.#flatpickr.selectedDates.length == 0) {
            return null
        }

        const value = this.#flatpickr.selectedDates
        const convert = value.map(val => {
            if(this.#mode == "datetime") {
                return Helper.dateTimeToString(val)
            }

            if(this.#mode == "date") {
                return Helper.dateToString(val)
            }

            if(this.#mode == "time") {
                return Helper.timeToString(val)
            }

            return ""
        })
        
        return this.#flatpickr.config.mode == "single" ? convert[0] : convert
    }

    // perlu check ulang
    set(value, isSilent = false) {
        this.#flatpickr.setDate(value, !isSilent, this.#flatpickr.config.dateFormat)

        // const isChanged = this._isChanged(value)
        // this._oldValue = value
        // if(!isSilent && isChanged) {
        //     this.trigger('change', this.get())
        // }
    }

    on(type, callback) {
        const supportedEvent = DateTimeInput.supportedEvent()        
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

        if(type == 'change') {
            this.#flatpickr.config.onChange.push((selectedDates, dateStr, instance) => {
                callback(this.get())
            })
        } else if(type == 'open') {
            this.#flatpickr.config.onOpen.push((selectedDates, dateStr, instance) => {
                callback(this.get())
            })
        } else if(type == 'close') {
            this.#flatpickr.config.onChange.push((selectedDates, dateStr, instance) => {
                callback(this.get())
            })
        } else if(type == 'ready') {
            this.#flatpickr.config.onReady.push((selectedDates, dateStr, instance) => {
                callback(this.get())
            })
        } else if(type == 'day-create') {
            this.#flatpickr.config.onDayCreate.push((selectedDates, dateStr, instance, dayElem) => {
                callback(this.get(), dayElem)
            })
        }
    }

    _setMessage(message, isError) {
        if(!this._messageElement) {
            console.warn(`Element ${this._id} not have message feedback element`)
            return
        }

        const flatpickrElement = this._element.nextElementSibling
        if(Helper.isEmpty(message)) {
            flatpickrElement.classList.remove(isError ? 'is-invalid' : 'is-valid')
            this._messageElement.classList.remove(isError ? 'invalid-feedback' : 'valid-feedback', 'd-block')
        } else {
            flatpickrElement.classList.remove('is-valid', 'is-invalid')
            this._messageElement.classList.remove('valid-feedback', 'invalid-feedback', 'd-block')
            
            flatpickrElement.classList.add(isError ? 'is-invalid' : 'is-valid')
            this._messageElement.classList.add(isError ? 'invalid-feedback' : 'valid-feedback', 'd-block')
        }
        
        this._messageElement.textContent = message
    }
}