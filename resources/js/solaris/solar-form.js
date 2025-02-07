import Helper from "./helper"
import OptionInput from "./option-input"
import LookupInput from "./lookup-input"
import NumberInput from "./number-input"
import DateTimeInput from "./datetime-input"
import TextInput from "./text-input"
import SelectInput from "./select-input"
import FileInput from "./file-input"
import axios from "../libs/axios"
import { AxiosError } from "axios"

export default class SolarForm {
    #prefix = ''
    #events = []
    #elements = []
    #buttons = []
    #validations = []
    #customData = {}
    #loadingElement = ""
    #showSuccessAlert = true
    #successAlertMessage = "Data saved successfully"
    #showErrorAlert = true
    #errorAlertMessage = "Oops! There was an error"
    #type = "JSON"
    #configs = null
    #mappingData = null

    constructor(form, configs) {
        if(Helper.isString(form) && !Helper.isEmpty(form)) {
            let element = document.querySelector(form)
            if(!element) {
                throw new Error(`Element with query selector ${form} is not found`)
            }

            form = element
        } else if(!(form instanceof Element)) {
            throw new Error(`Selector is not supported`)
        }

        this.form = form
        this.#prefix = this.form.getAttribute('solar-form-prefix') ?? ''

        this.#configs = configs
        this.#getAllFields()
        this.#getAllButtons()

        if(this.form.tagName === 'FORM') {
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault()
                await this.submit()
            })
        } else {
            const submitBtn = this.#buttons.find(btn => btn.type == 'submit')
            if(submitBtn) {
                submitBtn.addEventListener('click', async (e) => {
                    e.preventDefault()
                    await this.submit()
                })
            }

            this.form.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    await this.submit()
                }
            })
        }

        console.warn("If you will submit with upload file, change form type to form-data. Use form.setToFormData()")
    }

    //#region static
    
    static supportedEvent() {
        return ["before", "fail", "success", "error"]
    }

    static dateConfig() {
        return {
            altInput: true,
            altFormat: "d M Y",
            dateFormat: "Y-m-d"
        }
    }

    static dateTimeConfig() {
        return {
            enableTime: true,
            altInput: true,
            altFormat: "d-m-Y G:i K",
            dateFormat: "Y-m-d H:i"
        }
    }

    static timeConfig() {
        return {
            enableTime: true,
            noCalendar: true,
            altFormat: "H:i",
            dateFormat: "H:i:S"
        }
    }

    static lookupConfig(model) {
        const config = {
            allowClear: true,
            width: 'resolve'
        }

        if(!Helper.isEmpty(model)) {
            config.ajax = {
                url: `${BASE_URL}/lookup/${model}`,
                type: 'POST',
                dataType: 'JSON',
                contentType: "application/json",
                headers: {
                    "X-CSRF-TOKEN": Helper.getCsrfToken()
                },
                delay: 500,
                cache: true
            }
        }

        return config
    }

    static numberConfig({delimiter = ".", decimal = ","}) {
        return {
            numeral: true,
            numeralThousandsGroupStyle: 'none',
            numeralDecimalScale: 0,
            delimiter: delimiter,
            numeralDecimalMark: decimal
        }
    }

    static decimalConfig({delimiter = ".", decimal = ",", scale = 2}) {
        return {
            numeral: true,
            numeralThousandsGroupStyle: 'thousand',
            delimiter: delimiter,
            numeralDecimalMark: decimal,
            numeralDecimalScale: scale
        }
    }

    static creditCardConfig() {
        return {
            creditCard: true
        }
    }

    static phoneNumberConfig(country = "ID") {
        return {
            phone: true,
            phoneRegionCode: country
        }
    }
    
    //#endregion

    //#region public

    //#region elements

    addElement({selector, plugin = "default:text", config = null}) {
        if(Helper.isString(selector) && !Helper.isEmpty(selector)) {
            let element = document.querySelector(selector)
            if(!element) {
                throw new Error(`Element with query selector ${selector} is not found`)
            }

            selector = element
        } else if(!(selector instanceof Element)) {
            throw new Error(`Selector is not supported`)
        }

        const elementId = selector.getAttribute('id')
        if(Helper.isEmpty(elementId)) {
            throw new Error('Element must have id')
        }

        let id = selector.getAttribute('solar-form-id')
        if(Helper.isEmpty(id)) {
            id = elementId
        }

        let _plugin = selector.getAttribute('solar-form')
        if(Helper.isEmpty(_plugin)) {
            _plugin = plugin
        }

        let _config = config
        if(!_config) {
            _config = this.#configs ? this.#configs[id] : null 
        }

        const el = {
            id: id,
            plugin: this.#getPlugin(selector, _plugin, _config),
            type: selector.type,
            error: null
        }
        
        el.plugin.on('change', (data) => {
            if(this.isError(id) && !Helper.isEmpty(data)) {
                this.error(id, null)
            }
        })

        this.#elements.push(el)

        return this
    }

    addOptionElement({name, elements, plugin = "option"}) {
        if(!Array.isArray(elements)) {
            throw new Error(`Elements must be array`)
        }

        const type = elements[0].type

        let _plugin = elements[0].getAttribute('solar-form')
        if(Helper.isEmpty(_plugin)) {
            _plugin = plugin;
        }

        const el = {
            id: name,
            plugin: this.#getPlugin(elements, _plugin, null),
            type: type,
            error: null
        }

        el.plugin.on('change', (data) => {
            if(this.isError(name) && !Helper.isEmpty(data)) {
                this.error(name, null)
            }
        })

        this.#elements.push(el)

        return this
    }

    //#endregion

    //#region events

    on(...args) {
        if(args.length == 0) {
            throw new Error("Config cannot be null or empty")
        }

        if(args.length == 2) {
            return this.#onFormEvent(args[0], args[1])
        }

        if(args.length == 3) {
            return this.#onFieldEvent(args[0], args[1], args[2])
        }

        throw new Error("Config is not valid")
    }

    onButton(key, type, event) {
        if(!Helper.isFunction(event)) {
            throw new Error("event must be function")
        }

        const button = this.#buttons.find(el => el.id == key)
        button.addEventListener(type, (e) => event(e))
    }

    trigger(...args) {
        if(args.length == 0) {
            throw new Error("Config cannot be null or empty")
        }

        if(args.length == 1 || args.length == 2) {
            return this.#triggerForm(args[0], args[1] ?? null)
        }

        if(args.length == 2 || args.length == 3) {
            return this.#triggerField(args[0], args[1], args[2] ?? null)
        }

        throw new Error("Config is not valid")
    }  

    addValidation(key, callback) {
        const index = this.#validations.findIndex(item => item.id == key)
        if(index == -1) {
            this.#validations.push({
                id: key,
                validations: [callback]
            })   
        } else {
            this.#validations[index].validations.push(callback)
        }

        return this
    }

    //#endregion

    //#region get and set property
    
    getAll() {
        return this.#elements
    }

    setAll(data, isSilent = true) {
        if(data === null) {
            this.clearAll(isSilent)
            return
        }

        this.#elements.forEach(el => {
            let value = data[el.id] ?? null
            try {
                if(el.plugin instanceof LookupInput && el.plugin.isServerSide()) {
                    if(el.id.endsWith('_id')) {
                        value = data[el.id.substr(0, el.id.length-3)]
                    }
                }
                
                if(el.plugin instanceof OptionInput && !el.plugin.isGroup()) {
                    el.plugin.set(value ?? false, isSilent)
                } else {
                    el.plugin.set(value, isSilent)
                }   
            } catch (error) {
                console.warn(`${el.id} fail to set data: `, error)
            }

            el.plugin.error(null)
            el.error = null
        })
    }

    getPlugin(key) {
        const el = this.#getElementByKey(key)
        return el.plugin
    }

    getButton(id) {
        return this.#buttons.find(el => el.id == id)
    }

    get(key) {
        const el = this.#getElementByKey(key)
        return el.plugin.get()
    }

    set(key, value, isSilent = false) {
        const el = this.#getElementByKey(key)
        el.plugin.set(value, isSilent)
    }

    required(key, isRequired = true) {
        const el = this.#getElementByKey(key)
        el.plugin.required(isRequired)
    }

    disabled(key, isDisable = true) {
        const el = this.#getElementByKey(key)
        el.plugin.disabled(isDisable)
    }

    hidden(key, isHidden = true) {
        const el = this.#getElementByKey(key)
        el.plugin.hidden(isHidden)
    }

    error(key, message) {
        const el = this.#getElementByKey(key)
        if(el) {
            el.plugin.error(message)
            el.error = message
        }
    }

    valid(key, message) {
        const el = this.#getElementByKey(key)
        if(el) {
            el.plugin.valid(message)
            el.error = null
        }
    }

    isRequired(key) {
        const el = this.#getElementByKey(key)
        return el.plugin.isRequired()
    }

    isDisabled(key) {
        const el = this.#getElementByKey(key)
        return el.plugin.isDisable()
    }

    isHidden(key) {
        const el = this.#getElementByKey(key)
        return el.plugin.isHidden()
    }

    isError(key) {
        const el = this.#getElementByKey(key)
        return !Helper.isEmpty(el.error)
    }

    clearAll(isSilent = true) {
        this.#elements.forEach(el => {
            if(el.plugin instanceof OptionInput && !el.plugin.isGroup()) {
                el.plugin.set(false, isSilent)
            } else {
                el.plugin.set(null, isSilent)
            }

            el.plugin.error(null)
            el.error = null
        })
    }

    //#endregion

    //#region alert

    setSuccessAlert(value) {
        if(typeof value !== 'boolean') {
            throw new Error("Value must be boolean")
        }

        this.#showSuccessAlert = value

        return this
    }

    setSuccessAlertMessage(message) {
        if(!Helper.isString(message)) {
            throw new Error("Message must be string")
        }

        if(Helper.isEmpty(message)) {
            throw new Error("Message cannot be empty or null")
        }

        this.#successAlertMessage = message

        return this
    }

    isShowSuccessAlert() {
        return this.#showSuccessAlert && !Helper.isEmpty(this.#successAlertMessage)
    }

    setErrorAlert(value) {
        if(typeof value !== 'boolean') {
            throw new Error("Value must be boolean")
        }

        this.#showSuccessAlert = value

        return this
    }

    setErrorAlertMessage(message) {
        if(!Helper.isString(message)) {
            throw new Error("Message must be string")
        }

        if(Helper.isEmpty(message)) {
            throw new Error("Message cannot be empty or null")
        }

        this.#errorAlertMessage = message

        return this
    }

    isShowErrorAlert() {
        return this.#showErrorAlert && !Helper.isEmpty(this.#errorAlertMessage)
    }

    //#endregion

    //#region form submit

    setErrors(errors) {
        if(errors === null) {
            this.#elements.forEach(el => {
                el.plugin.error(null)
                el.error = null
            })

            return
        }

        if(Array.isArray(errors)) {
            errors.forEach(item => {
                this.error(item.id, item.error)
            })

            return
        }

        if(Helper.isObject(errors)) {
            for(const error in errors) {
                this.error(error, errors[error])
            }

            return
        }
    }

    async validation() {
        const result = {
            success: true,
            errors: []
        }
        
        const errors = []
        this.#elements
            .filter(el => el.plugin.isRequired())
            .forEach(el => {
                const plugin = el.plugin 
                const value = plugin.get()
                const message = `${plugin.getLabel()} is required`

                let isValid = true
                if(el.plugin instanceof OptionInput) {
                    isValid = this.#requiredOptionValidation(value)
                } else if(el.plugin instanceof NumberInput && Helper.isNumber(value)) {
                    isValid = this.#requiredNumberValidation(value)
                } else {
                    isValid = this.#requiredValidation(value)
                }
                
                if(!isValid) {
                    result.success = false
                    errors.push({
                        id: el.id,
                        errors: [message]
                    })
                }
            })

        for (let i = 0; i < this.#validations.length; i++) {
            const item = this.#validations[i]
            const id = item.id

            try {
                const el = this.#getElementByKey(id)
                const value = el.plugin.get()
                const validations = item.validations

                for (let j = 0; j < validations.length; j++) {
                    const validation = validations[j]
                    const validationResult = await validation(value)
                    const isValid = validationResult.success
                    const message = validationResult.message

                    if(!isValid) {
                        result.success = false

                        const index = errors.findIndex(e => e.id == id)
                        if(index == -1) {
                            errors.push({
                                id: el.id,
                                errors: [message]
                            })
                        } else {
                            errors[index].errors.push(message)
                        }
                    }
                }   
            } catch (error) {
                console.error(`Element ${id} is error or not found`, error)
                continue
            }
        }

        if(!result.success && errors.length > 0) {
            result.errors = errors.map(e => {
                return {
                    id: e.id,
                    error: e.errors.join(". ")
                }
            })
        }

        return result
    }

    setToFormData() {
        this.#type = 'form-data'

        return this
    }

    setToJson() {
        this.#type = 'json'

        return this
    }

    setToUrlEncoded() {
        this.#type = 'x-www-form-urlencoded'

        return this
    }

    addData(key, value) {
        if(this.#elements.find(item => item.id == key)) {
            throw new Error(`Cannot add ${key} because it is already registered`)
        }

        this.#customData[key] = value

        return this
    }

    getData() {
        if(this.#type.toLowerCase() == 'json') {
            return this.#getJsonData()
        }

        if(this.#type.toLowerCase() == 'form-data') {
            return this.#getFormData()
        }

        if(this.#type.toLowerCase() == 'x-www-form-urlencoded') {
            return this.#getUrlEncodedData()
        }

        return null
    }

    mapData(callback) {
        if(!Helper.isFunction(callback)) {
            throw new Error("Callback must be function")
        }

        this.#mappingData = callback

        return this
    }

    async submit() {
        this.loading(true)

        let req = null
        try {
            let method = this.form.getAttribute('solar-form-method')
            if(Helper.isEmpty(method)) {
                method = Helper.isEmpty(this.form.method) ? "POST" : this.form.method
            }

            if(!["post", "put", "patch"].includes(method.toLowerCase())) {
                throw new Error(`Method ${method} is not support`)
            }

            let url = this.form.getAttribute('solar-form-action')
            if(Helper.isEmpty(url)) {
                url = this.form?.action ?? ""
            }
            
            if(Helper.isEmpty(url)) {
                throw new Error(`Url cannot be null or empty`)
            }

            await this.trigger('before')

            const validation = await this.validation()
            if(!validation.success) {
                this.setErrors(validation.errors)

                await this.trigger('fail', validation)

                return
            }

            let data = this.getData()
            if(Helper.isFunction(this.#mappingData)) {
                data = this.#mappingData(data)
            }

            if(Helper.isEmpty(data)) {
                throw new Error(`Data cannot be null or empty`)
            }

            req = await axios({
                method: method,
                url: url,
                data: data
            })

            const res = req.data
            if(!res.success) {
                this.setErrors(res.errors)
                if(res.message && !Helper.isEmpty(res.message)) {
                    throw new Error(res.message)
                }

                await this.trigger('fail', res)

                return
            }

            await this.trigger('success', res)

            if(this.isShowSuccessAlert()) {
                Helper.successAlert({title: this.#successAlertMessage})
            }
        } catch (error) {
            console.error(error)
            const errorMessage = error instanceof AxiosError ? error.response?.data?.message : error

            await this.trigger('error', {error, req})

            if(this.isShowErrorAlert()) {
                Helper.errorAlert({title: this.#errorAlertMessage, message: errorMessage, timeout: null})
            }
        } finally {
            await this.trigger('after')

            this.loading(false)
        }
    }

    //#endregion

    setLoadingElement(selector) {
        this.#loadingElement = selector

        return this
    }

    loading(show) {
        if(Helper.isEmpty(this.#loadingElement)) {
            Helper.loadingPage(show)
        } else {
            Helper.loading(this.#loadingElement, show)
        }
    }

    disableAllButton(value = true) {
        this.#buttons.forEach(el => {
            el.disabled = value
        })
    }

    //#region private

    #getAllFields() {
        let defaultSelector = `[solar-form]:not(button):not([type="radio"]):not([type="checkbox"])`
        let optionSelector = `[solar-form][type="radio"], [solar-form][type="checkbox"]`

        if(!Helper.isEmpty(this.#prefix)) {
            defaultSelector += `[id^="${this.#prefix}"]`
            optionSelector = `[solar-form][type="radio"][name^="${this.#prefix}"], [solar-form][type="checkbox"][name^="${this.#prefix}"]`
        }

        const defaultElements = this.form.querySelectorAll(defaultSelector)
        defaultElements.forEach(el => {
            this.addElement({selector: el})
        })

        const groups = []
        const optionElements = this.form.querySelectorAll(optionSelector)
        optionElements.forEach(el => {
            const name = el.getAttribute('name')
            let id = el.getAttribute('solar-form-id')
            if(Helper.isEmpty(id)) {
                id = name
            }

            if(Helper.isEmpty(id)) {
                this.addElement({selector: el})
            } else {
                const index = groups.findIndex(item => item.name == id)
                if(index == -1) {
                    groups.push({
                        name: id,
                        elements: [el]
                    })
                } else {
                    groups[index].elements.push(el)
                }
            }
        })

        groups.forEach(el => {
            this.addOptionElement({name: el.name, elements: el.elements})
        })

        if(this.#elements.length == 0) {
            throw new Error("No elements are supported")    
        }
    }

    #getAllButtons() {
        let selector = `button[solar-form="button"]`
        if(!Helper.isEmpty(this.#prefix)) {
            selector += `[id^="${this.#prefix}"]`
        }

        const buttonElements = this.form.querySelectorAll(selector)
        buttonElements.forEach(el => {
            this.#buttons.push(el)
        })
    }

    #getElementByKey(key) {
        const el = this.#elements.find(item => item.id == key)
        if(!el) {
            console.warn(`Element ${key} not found`)
        }

        return el ?? null
    }

    #getPlugin(element, plugin, config) {
        const splitPlugin = plugin.split(':')
        const pluginName = splitPlugin[0]
        const pluginType = splitPlugin[1] ?? null

        if(pluginName == 'default') {

            if(TextInput.supportedElement().includes(pluginType)) {
                return new TextInput(element)
            }

            if(SelectInput.supportedElement().includes(pluginType)) {
                return new SelectInput(element)
            }

            if(pluginType == "file") {
                return new FileInput(element)
            }
        }

        if(pluginName == 'option') {
            if(OptionInput.supportedElement().includes(pluginType)) {
                return new OptionInput(element)
            }
        }

        if(["date", "datetime", "time"].includes(pluginName)) {
            if(!config) {
                if(plugin == "date") {
                    config = SolarForm.dateConfig()
                } else if(plugin == "datetime") {
                    config = SolarForm.dateTimeConfig()
                } else {
                    config = SolarForm.timeConfig()
                }
            }

            return new DateTimeInput(element, config)
        }

        if(pluginName == "lookup") {
            const url = element.getAttribute('solar-form-lookup-source') ?? ''
            config = config ? Object.assign({}, config, SolarForm.lookupConfig(url)) : SolarForm.lookupConfig(url);

            return new LookupInput(element, config)
        }
        
        if(["creditcard", "phone", "number", "decimal"].includes(pluginName)) {
            if(!config) {
                if(pluginName == "creditcard") {
                    config = SolarForm.creditCardConfig()
                } else if(pluginName == "phone") {
                    config = SolarForm.phoneNumberConfig(pluginType ?? "ID")
                } else if(pluginName == "number") {
                    config = SolarForm.numberConfig({})
                } else {
                    config = SolarForm.decimalConfig({scale: pluginType ? parseInt(pluginType) : 2})
                }
            }

            return new NumberInput(element, config)
        }

        throw new Error(`Plugin ${plugin} is not supported`);
    }

    #requiredValidation(value) {
        return !Helper.isEmpty(value)
    }

    #requiredNumberValidation(value) {
        return value > 0
    }

    #requiredOptionValidation(value) {
        if(typeof value === 'boolean') {
            return value
        }

        if(Helper.isObject(value)) {
            return !Helper.isEmpty(value)
        }

        return false
    }

    #getJsonData() {
        const data = {}

        const defaultElement = this.#elements
            .filter(el => el.typpe != 'file' && el.type != 'select-multiple' && !(el.plugin instanceof OptionInput))  
        defaultElement.forEach(el => {
            const value = el.plugin instanceof DateTimeInput ? el.plugin.toString() : el.plugin.get()
            data[el.id] = Helper.isLookup(value) ? value.id : value          
        })
        
        const selectMultipleElement = this.#elements.filter(el => el.type == 'select-multiple')
        selectMultipleElement.forEach(el => {
            const value = el.plugin.get()
            data[el.id] = !Helper.isEmpty(value) ? value.map(item => item.id) : null
        })

        const optionElement = this.#elements.filter(el => el.plugin instanceof OptionInput)
        optionElement.forEach(el => {
            let value = el.plugin.get()
            data[el.id] = value
        })

        for(const cData in this.#customData) {
            data[cData] = this.#customData[cData]
        }

        return data
    }

    #getFormData() {
        const form = new FormData()

        const defaultElement = this.#elements
            .filter(el => el.typpe != 'file' && el.type != 'select-multiple' && !(el.plugin instanceof OptionInput))
        defaultElement.forEach(el => {
            let value = el.plugin.get()
            if(el.type == 'select-one') {
                value = Helper.isLookup(value) ? value.id : (value ?? Helper.emptyUuid())
            }

            form.append(el.id, value)          
        })

        const selectMultipleElement = this.#elements.filter(el => el.type == 'select-multiple')
        selectMultipleElement.forEach(el => {
            let value = el.plugin.get()
            value = !Helper.isEmpty(value) ? JSON.stringify(value.map(item => item.id)) : JSON.stringify([])

            form.append(el.id, value)
        })

        const optionElement = this.#elements.filter(el => el.plugin instanceof OptionInput)
        optionElement.forEach(el => {
            let value = el.plugin.get()
            const isGroup = el.plugin.isGroup()
            const type = el.type
            const isRadio = type == 'radio'

            if(isGroup || isRadio) {
                value = Helper.isEmpty(value) ? "" : JSON.stringify[value]
            } else if(!isRadio) {
                value = JSON.stringify(value)
            }

            form.append(el.id, value)
        })

        const fileElement = this.#elements.filter(el => el.type == 'file')
        fileElement.forEach(el => {
            const value = el.plugin.get()
            if(value && value.length > 1) {
                for (let i = 0; i < value.length; i++) {
                    form.append(`${el.id}[]`, value[i])
                }
            } else if(value && value.length == 1) {
                form.append(`${el.id}`, value[0])
            } else {
                form.append(el.id, "")
            }
        })

        for(const cData in this.#customData) {
            form.append(cData, this.#customData[cData])
        }

        return form
    }

    #getUrlEncodedData() {

    }

    #onFieldEvent(key, type, event) {
        if(!Helper.isFunction(event)) {
            throw new Error("event must be function")
        }

        const el = this.#getElementByKey(key)
        el.plugin.on(type, event)
    }

    #onFormEvent(type, event) {
        if(!SolarForm.supportedEvent().includes(type)) {
            throw new Error(`Event ${type} does not support`)
        }
        
        if(!Helper.isFunction(event)) {
            throw new Error("event must be function")
        }

        this.#events.push({
            type: type,
            callback: event
        })

        return this
    }

    #triggerField(key, event, data) {
        const plugin = this.getPlugin(key)
        plugin.trigger(event, data)
    }

    async #triggerForm(event, data) {
        const events = this.#events.filter(e => e.type == event)
        for (let i = 0; i < events.length; i++) {
            const event = events[i]
            await event.callback(data)
        }
    }

    //#endregion
}