import Form from "../solaris/solar-form"
import Helper from "../solaris/helper"

(function() {
    const form = new Form("#form_login")
    form.setSuccessAlert(false)
    form.on('success', function(response) {
        form.disableAllButton(true)
        window.location = response.redirect
    })
})()