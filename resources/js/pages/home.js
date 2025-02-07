import _ from 'lodash'
import Helper from '../solaris/helper'
import Model from '../solaris/model'
import SolarTable from '../solaris/solar-table'
import { modal as QuestionModal } from "./modal"

(function() {
    const placeholder = document.querySelector('#questions-placeholder')
    const wrapper = document.querySelector('.questions-table')

    const newQuestions = document.querySelector('#new-questions')
    const search = document.querySelector('#search')

    const table = new SolarTable('#questions-table', '/questions/datatable')
    table.setInfiniteScroll(true, {
        length: 50,
        maxData: 250,
        removeOldData: 50 
    })

    table.setLayout({
        topStart: null,
        topEnd: null,
        bottomStart: null,
        bottom: null,
        bottomEnd: null
    })

    table.addColumn({
        data: 'name',
        className: 'text-wrap',
        render: (data, row) => {
            const answers = row.answers.map(item => {
                const icon = item.is_correct ? 'ri-checkbox-circle-fill text-success' : 'ri-radio-button-fill'
                return `<div class="d-flex">
                    <div class="flex-shrink-0">
                        <i class="${icon}"></i>
                    </div>
                    <div class="flex-grow-1 ms-2 text-muted">
                        ${item.name}
                    </div>
                </div>`
            })

            const actions = `<ul class="list-inline card-toolbar-menu d-flex align-items-center mb-0">
                <li class="list-inline-item">
                    <a class="align-middle dt-action-edit" href="javascript:void(0);">
                        <i class="${SolarTable.icon.EDIT} align-middle"></i>
                    </a>
                </li>
                <li class="list-inline-item">
                    <button type="button" class="btn-close fs-10 align-middle dt-action-delete"></button>
                </li>
            </ul>`

            const header = `<div class="card-header">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <h6 class="card-title mb-0">${data}</h6>
                    </div>
                    <div class="flex-shrink-0">
                        ${actions}
                    </div>
                </div>
            </div>`
            
            const body = `<div class="card-body">
                ${answers.length > 0 ? answers.join("") : "<h4>Tak ada yang tahu 😢</h4>"}
            </div>`

            const content = `<div class="card card-animate mb-0">
                ${header}
                ${body}
            </div>`

            return content
        }
    })

    table.addEvent({
        type: 'click',
        selector: 'tbody tr td .dt-action-edit',
        action: (data) => {
            QuestionModal.edit(data.id)
        }
    })

    table.addEvent({
        type: 'click',
        selector: 'tbody tr td .dt-action-delete',
        action: async (data) => {
            await remove(data.id)
        }
    })

    table.onDraw(() => {
        
    })

    table.onComplete(async () => {        
        Helper.loadingPlaceholder(false, wrapper, placeholder)
    })

    const debounce = _.debounce((value) => {
        table.addFilter('search', value)
        refresh(true)
    }, 400)

    search.addEventListener('input', (e) => {
        debounce(e.target.value)
    })

    newQuestions.addEventListener('click', (e) => {
        QuestionModal.show()
    })

    document.addEventListener('DOMContentLoaded', () => {
        table.render()
        
        QuestionModal.on('success', (res) => {
            QuestionModal.close()
            refresh()
        })
    })

    async function refresh(isSearching = false) {
        Helper.loadingPlaceholder(true, wrapper, placeholder)
        
        await table.refresh(false, isSearching)

        Helper.loadingPlaceholder(false, wrapper, placeholder)
    }

    async function remove(id) {
        if(await Model.delete(`questions`, id)) {
            table.refresh()
        }
    }
})()