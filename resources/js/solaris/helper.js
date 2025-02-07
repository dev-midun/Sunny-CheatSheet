const NAVBAR_RIGHT_BUTTON = document.querySelector('div.page-title-box .page-title-right')
const BUTTONS_IN_NAVBAR_RIGHT_BUTTON = document.querySelectorAll('div.page-title-box .page-title-right button')

export default class Helper {
    static isDefined(value) {
        return typeof value !== 'undefined' && value !== null
    }

    static isFunction(value) {
        return !!(value && value.constructor && value.call && value.apply)
    }

    static isString(value) {
        return Helper.isDefined(value) && typeof value == "string"
    }

    static isNumber(value) {
        if (typeof value === 'number') {
            return !isNaN(value)
        }
        
        if (typeof value === 'string' && value === value.trim() && !Helper.isEmpty(value)) {
            return !isNaN(Number(value));
        }

        return false
    }

    static isInteger(value) {
        return Helper.isNumber(value) && Number.isInteger(value)
    }

    static isFloat() {
        return Helper.isNumber(value) && !Number.isInteger(value)
    }

    static isValidURL(value) {
        if(!Helper.isString(value) || Helper.isEmpty(value)) {
            return false
        }

        try {
            new URL(value)
        } catch (error) {
            return false
        }

        return true
    }

    static isDate(value) {
        return Helper.isDefined(value) && value instanceof Date
    }

    static isObject(value) {
        return Helper.isDefined(value) && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]'
    }

    static isLookup(value) {
        return Helper.isObject(value) && value.hasOwnProperty("id") && value.hasOwnProperty("name")
    }

    static isEmpty(value) {
        if(!Helper.isDefined(value)) {
            return true
        }

        if(Helper.isString(value) && value?.trim().length == 0) {
            return true
        }
        
        if(Array.isArray(value) && value.length == 0) {
            return true
        }
        
        if(Helper.isObject(value)) {
            for (const prop in value) {
                if (Object.hasOwn(value, prop)) {
                    return false
                }
            }

            return true
        }

        if(value instanceof FormData) {
            return [...value.entries()].length == 0 ? true : false
        }

        if(typeof value === "boolean") {
            return !value
        }

        return false
    }

    static emptyUuid() {
        return "00000000-0000-0000-0000-000000000000"
    }

    static timeToString(date) {
        if(!Helper.isDate(date)) {
            throw `${date} is not valid date`
        }
        
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        const second = String(date.getSeconds()).padStart(2, '0')

        return `${hour}:${minute}:${second}`
    }

    static dateToString(date) {
        if(!Helper.isDate(date)) {
            throw `${date} is not valid date`
        }
        
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    static dateTimeToString(date) {
        if(!Helper.isDate(date)) {
            throw `${date} is not valid date`
        }
        
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        const second = String(date.getSeconds()).padStart(2, '0')

        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }

    static getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    }

    static async delay(timeout) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, timeout)
        })
    }

    static getInitialName(name) {
        return name
            .split(/\s+/)
            .map(word => word[0].toUpperCase())
            .join('')
    }

    //#region loading

    static loading(selector, show, timeout = null) {
        if(!Helper.isString(selector)) {
            throw new Error("Selector must be string")
        }

        if(typeof show !== 'boolean') {
            throw new Error("Show must be boolean")
        }

        if(show) {
            const config = {
                message: '<div class="spinner-border text-white" role="status"></div>',
                css: {
                    backgroundColor: 'transparent',
                    border: '0'
                },
                overlayCSS: {
                    opacity: 0.5
                }
            }

            if(Helper.isInteger(timeout)) {
                config.timeout = timeout
            }
    
            $(selector).block(config)
        } else {
            $(selector).unblock()
        }
    }

    static loadingPage(show, timeout = null) {
        if(typeof show !== 'boolean') {
            throw new Error("Show must be boolean")
        }

        if(show) {
            const config = {
                message: '<div class="spinner-border text-white" role="status"></div>',
                css: {
                    backgroundColor: 'transparent',
                    border: '0'
                },
                overlayCSS: {
                    opacity: 0.5
                }
            }
    
            if(Helper.isInteger(timeout)) {
                config.timeout = timeout
            }
    
            $.blockUI(config)
        } else {
            $.unblockUI()
        }
    }

    static loadingPlaceholder(show, mainElement, placeholderSelector) {
        if(typeof show !== 'boolean') {
            throw new Error("Show must be boolean")
        }
        
        if(BUTTONS_IN_NAVBAR_RIGHT_BUTTON && BUTTONS_IN_NAVBAR_RIGHT_BUTTON.length > 0) {
            if(show) {
                NAVBAR_RIGHT_BUTTON.classList.add('placeholder-glow')
            } else {
                NAVBAR_RIGHT_BUTTON.classList.remove('placeholder-glow')
            }

            BUTTONS_IN_NAVBAR_RIGHT_BUTTON.forEach((button) => {
                if(show) {
                    button.disabled = true
                    button.classList.add('placeholder')
                } else {
                    button.disabled = false
                    button.classList.remove('placeholder')
                }
            })
        }

        const elem = mainElement instanceof Element ? mainElement : document.querySelector(mainElement)
        const placeholder = placeholderSelector instanceof Element ? placeholderSelector :  document.querySelector(placeholderSelector)

        if(show) {
            elem?.classList.add('d-none')
            placeholder?.classList.remove('d-none')
        } else {
            elem?.classList.remove('d-none')
            placeholder?.classList.add('d-none')
        }
    }

    //#endregion

    //#region alert

    static async alert({title, message = '', icon = 'info', timeout = 2000}) {
        const config = {
            title: title,
            text: message,
            icon: icon,
            customClass: {
                confirmButton: 'btn btn-primary waves-effect waves-light'
            },
            buttonsStyling: false
        }

        if(Helper.isInteger(timeout)) {
            config.timer = timeout
        }
        
        return new Promise((resolve) => {
            Swal.fire(config).then((result) => resolve(result))
        })
    }

    static async successAlert({title, message = '', timeout = 2000}) {
        const config = {
            html: '<div class="mt-3">' +
                '<lord-icon src="https://cdn.lordicon.com/lupuorrc.json" trigger="loop" colors="primary:#0ab39c,secondary:#405189" style="width:120px;height:120px"></lord-icon>' +
                '<div class="mt-4 pt-2 fs-15">' +
                `<h4>${title}</h4>` +
                (!Helper.isEmpty(message) ? `<p class="text-muted mx-4 mb-0">${message}</p>` : '') +
                '</div>' +
                '</div>',
            customClass: {
                cancelButton: 'btn btn-primary w-xs mb-1',
            },
            showCancelButton: true,
            showConfirmButton: false,
            customClass: {
                cancelButton: 'btn btn-primary w-xs mb-1',
            },
            cancelButtonText: 'Ok',
            buttonsStyling: false,
            showCloseButton: false
        }

        if(Helper.isInteger(timeout)) {
            config.timer = timeout
        }
        
        return new Promise((resolve) => {
            Swal.fire(config).then((result) => resolve(result))
        })
    }

    static async errorAlert({title, message = '', timeout = 2000}) {
        const config = {
            html: '<div class="mt-3">' +
                '<lord-icon src="https://cdn.lordicon.com/tdrtiskw.json" trigger="loop" colors="primary:#f06548,secondary:#f7b84b" style="width:120px;height:120px"></lord-icon>' +
                '<div class="mt-4 pt-2 fs-15">' +
                `<h4>${title}</h4>` +
                (!Helper.isEmpty(message) ? `<p class="text-muted mx-4 mb-0">${message}</p>` : '') +
                '</div>' +
                '</div>',
            showCancelButton: true,
            showConfirmButton: false,
            customClass: {
                cancelButton: 'btn btn-primary w-xs mb-1',
            },
            cancelButtonText: 'Dismiss',
            buttonsStyling: false,
            showCloseButton: false
        }

        if(Helper.isInteger(timeout)) {
            config.timer = timeout
        }
        
        return new Promise((resolve) => {
            Swal.fire(config).then((result) => resolve(result))
        })
    }

    static async confirm({title, message = ''}) {
        const config = {
            title: title,
            text: message,
            icon: "warning",
            customClass: {
                confirmButton: 'btn btn-primary w-xs me-2 mt-2',
                cancelButton: 'btn btn-danger w-xs mt-2',
            },
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            buttonsStyling: false
        }

        return new Promise((resolve) => {
            Swal.fire(config).then(result => resolve(result.value))
        })
    }

    static async confirmDelete({title, message = ''}) {
        const config = {
            html: '<div class="mt-3">' +
                '<lord-icon src="https://cdn.lordicon.com/gsqxdxog.json" trigger="loop" colors="primary:#f7b84b,secondary:#f06548" style="width:100px;height:100px"></lord-icon>' +
                '<div class="mt-4 pt-2 fs-15 mx-5">' +
                `<h4>${title}</h4>` +
                (!Helper.isEmpty(message) ? `<p class="text-muted mx-4 mb-0">${message}</p>` : '') +
                '</div>' +
                '</div>',
            customClass: {
                confirmButton: 'btn btn-primary w-xs me-2 mb-1',
                cancelButton: 'btn btn-danger w-xs mb-1',
            },
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete It!',
            cancelButtonText: 'No',
            buttonsStyling: false
        }

        return new Promise((resolve) => {
            Swal.fire(config).then(result => resolve(result.value))
        })
    }

    //#endregion

    // static async toast()

    //#region file helper
    
    static isFileValid(file, maxSizeInMB, mimeType = null) {
        return Helper.isFileSizeValid(file, maxSizeInMB) && Helper.isFileMimeValid(file, mimeType)
    }

    static isFileSizeValid(file, maxSizeInMB) {
        const fileSize = file.size
        const sizeMB = fileSize / (1024 * 1024)

        return sizeMB > maxSizeInMB ? false : true
    }
    
    static isFileMimeValid(file, mimeType = null) {            
        const availMimes = Helper.getAvailableMime(mimeType)
        return availMimes.filter(item => item.mime == file.type).length > 0
    }

    static getAvailableMime(type = null) {
        const mimes = [
            {
                type: "office_document",
                ext: ".xlsx",
                mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            },
            {
                type: "office_document",
                ext: ".docx",
                mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            },
            {
                type: "office_document",
                ext: ".pptx",
                mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            },
            {
                type: "pdf",
                ext: ".pdf",
                mime: "application/pdf"
            },
            {
                type: "text",
                ext: ".txt",
                mime: "text/plain"
            },
            {
                type: "image",
                ext: ".gif",
                mime: "image/gif"
            },
            {
                type: "image",
                ext: "jpg",
                mime: "image/jpeg"
            },
            {
                type: "image",
                ext: ".jpeg",
                mime: "image/jpeg"
            },
            {
                type: "image",
                ext: ".png",
                mime: "image/png"
            },
            {
                type: "image",
                ext: ".svg",
                mime: "image/svg+xml"
            },
            {
                type: "image",
                ext: ".webp",
                mime: "image/webp"
            },
            {
                type: "video",
                ext: ".avi",
                mime: "video/x-msvideo"
            },
            {
                type: "video",
                ext: ".mp4",
                mime: "video/mp4"
            },
            {
                type: "compress",
                ext: ".zip",
                mime: "application/zip"
            },
            {
                type: "compress",
                ext: ".zip",
                mime: "application/x-zip-compressed"
            },
            {
                type: "compress",
                ext: ".rar",
                mime: "application/vnd.rar"
            }
        ]

        if(Helper.isEmpty(type)) {
            return mimes
        }

        const filterType = mimes.filter(item => item.type == type)
        if(filterType.length > 0) {
            return filterType
        }

        const filterExt = mimes.filter(item => item.ext == type)
        if(filterExt.length > 0) {
            return filterExt
        }

        const filterMime = mimes.filter(item => item.mime == type)
        if(filterMime.length > 0) {
            return filterMime
        }

        return null 
    }
    
    //#endregion
}