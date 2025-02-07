import Form from "./solar-form"
import Helper from "./helper"
import Model from "./model"

export default class Modal {
    form = null
    #mode = 'new'
    #modal = null
    #formConfigs = null
    #element = null
    #events = []
    #url = ''
    #model = ''
    constructor(selector, formConfigs) {
        if(Helper.isString(selector) && !Helper.isEmpty(selector)) {
            let element = document.querySelector(selector)
            if(!element) {
                throw new Error(`Element with query selector ${selector} is not found`)
            }

            selector = element
        } else if(!(selector instanceof Element)) {
            throw new Error(`Selector is not supported`)
        }

        this.#element = selector
        this.#modal = new bootstrap.Modal(selector)

        this.#formConfigs = formConfigs
        this.#getForm()
        
        this.#element.addEventListener('hide.bs.modal', (e) => {
            this.setMode('new')
            this.clear()
        })
    }

    static supportedEvent() {
        return ["hide", "show", "edit", "success", "fail", "error", "before"]
    }

    #getForm() {
        const forms = this.#element.querySelectorAll(`
            form[action], 
            form[solar-form-action], 
            form[method], 
            form[solar-form-method],
            div[solar-form-action][solar-form-method]`
        )
        if(forms.length == 0) {
            console.warn("This modal does not support forms")
            return
        }

        const form = forms[0]
        this.form = new Form(form, this.#formConfigs)
        
        let action = form.getAttribute('solar-form-action')
        if(Helper.isEmpty(action)) {
            action = form.action ?? ""
        }
        
        this.#url = action
        this.#model = form.getAttribute('solar-form-model')

        this.setMode('new')
    }

    on(type, event) {
        if(!Modal.supportedEvent().includes(type)) {
            throw new Error(`Event ${type} does not support`)
        }
        
        if(!Helper.isFunction(event)) {
            throw new Error("event must be function")
        }

        if(!["success", "fail", "error", "before"].includes(type)) {
            this.#element.addEventListener(`${type}.bs.modal`, (e) => {
                event()
            })
        } else if(this.form) {
            this.form.on(type, (res) => {
                event(res)
            })
        }

        this.#events.push({
            type: type,
            callback: event
        })

        return this
    }

    trigger(event, data) {
        this.#events
            .filter(e => e.type == event)
            .forEach(e => e.callback(data))
    }

    show() {
        this.#modal.show()
    }

    async edit(id) {
        if(!this.form) {
            return
        }

        if(!Helper.isString(id) || Helper.isEmpty(id)) {
            throw new Error("Id must be string and cannot empty")
        }

        this.setMode('edit')
        
        const updateUrl = new URL(id, this.#url.endsWith("/") ? this.#url : this.#url + "/").href

        if(this.form.form.getAttribute('action')) {
            this.form.form.setAttribute("solar-form-action", updateUrl)
        } else {
            this.form.form.setAttribute("solar-form-action", updateUrl)
        }

        this.#modal.show()

        this.form.loading(true)
        try {
            const data = await Model.get(this.#model, id)
            this.form.setAll(data)
            this.trigger('edit', data)
        } catch (error) {
            
        } finally {
            this.form.loading(false)
        }
    }

    close() {
        this.#modal.hide()
    }

    clear() {
        if(!this.form) {
            return
        }

        this.form.clearAll()
    }

    getMode() {
        return this.#mode
    }

    getModel() {
        return this.#model
    }

    setMode(mode) {
        if(!this.form) {
            return   
        }
        
        if(!Helper.isString(mode)) {
            throw new Error("Mode must be string")
        }

        if(!["new", "edit"].includes(mode.toLowerCase())) {
            throw new Error("Only New/Edit mode is supported")
        }

        this.#mode = mode.toLowerCase()
        this.form.form.setAttribute("solar-form-method", this.#mode == 'edit' ? "PUT" : "POST")
        if(this.#mode == 'new') {
            if(this.form.form.getAttribute('action')) {
                this.form.form.setAttribute("action", this.#url)
            } else {
                this.form.form.setAttribute("solar-form-action", this.#url)
            }
        }
    }

    async submit() {
        if(!this.form) {
            return   
        }

        await this.form.submit
    }
}