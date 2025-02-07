import './bootstrap';

document.addEventListener('DOMContentLoaded', (e) => {
    const toogleShowPassword = document.querySelectorAll(`div.form-icon:has(input[type="password"]) i`)
    toogleShowPassword.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault()

            const icon = e.target
            const parent = icon.closest('div')
            const password = parent.querySelector('input')
            const passAttribute = password.getAttribute('type')

            if(passAttribute == "password") {
                password.setAttribute('type', 'text')
                icon.classList.add('ri-eye-off-fill')
                icon.classList.remove('ri-eye-fill')
            } else {
                password.setAttribute('type', 'password')
                icon.classList.remove('ri-eye-off-fill')
                icon.classList.add('ri-eye-fill')
            }
        })
    })

    const collapseButtonCustom = document.querySelectorAll('a.collapse-custom[data-bs-toggle="collapse"]')
    collapseButtonCustom.forEach(button => {
        button.addEventListener('click', function(e) {
            const a = e.currentTarget
            const icon = a.querySelector('.collapse-custom-icon')
            
            if(icon.classList.contains('ri-arrow-down-fill')) {
                icon.classList.remove('ri-arrow-down-fill')
                icon.classList.add('ri-arrow-right-fill')
            } else {
                icon.classList.remove('ri-arrow-right-fill')
                icon.classList.add('ri-arrow-down-fill')
            }
        })
    })
})