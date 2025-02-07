import $ from 'jquery'
import * as bootstrap from 'bootstrap'
import 'block-ui/jquery.blockUI'
import SimpleBar from 'simplebar'
import Waves from 'node-waves/src/js/waves'
import feather from 'feather-icons'
import select2 from 'select2/dist/js/select2.full'
import Swal from 'sweetalert2/dist/sweetalert2.js'
import ApexCharts from 'apexcharts'

import.meta.glob([
    '../images/**',
    '../velzon/images/**'
])

window.jQuery = window.$ = $
window.bootstrap = bootstrap
window.SimpleBar = SimpleBar
window.feather = feather
window.Swal = Swal
window.ApexCharts = ApexCharts

Waves.init()
select2()