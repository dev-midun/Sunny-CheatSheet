import Helper from "../solaris/helper"
import Modal from "../solaris/modal"

let _index = 0
const answerList = []
const modal = new Modal("#questions-modal")
const newButton = document.querySelector("#new-answers")
const answerTable = document.querySelector("#answers_table")
const answerTableBody = answerTable.querySelector("tbody")

modal.on('hide', () => {
    console.log('modal is hide')

    _index = 0
    answerList.length = 0
    answerTableBody.innerHTML = ""
})

modal.on('before', () => {
    modal.form.addData('answers', answerList)
})

modal.on('fail', (error) => {
    console.log({
        error: error,
        haveErrors: error.hasOwnProperty('errors'),
        errorsIsObj: Helper.isObject(error.errors)
    })

    if(error.hasOwnProperty('errors') && Helper.isObject(error.errors)) {
        console.log('masuk sini')
        Helper.errorAlert({title: error.errors.answers})
    }
})

modal.on('edit', (data) => {
    const answers = data.answers
    answers.forEach(answer => {
        addRow(answer)
    })
})

newButton.addEventListener('click', (e) => {
    addRow()
})

function addRow(data) {
    const row = answerTableBody.insertRow()

    const id = data?.id ?? ""
    const number = data?.position ?? row.rowIndex
    const answer = data?.name ?? ""
    const isCorrect = data?.is_correct ?? false

    row.setAttribute('data-index', _index)
    row.innerHTML = `<td class="d-none"><input type="hidden" value="${id}"></td>
        <td class="text-end">${number}</td>
        <td><textarea class="form-control form-control-sm" name="answer_name">${answer}</textarea></td>
        <td class="align-middle">
            <div class="d-flex justify-content-center">
                <div class="form-check form-switch">
                    <input type="checkbox" name="answer_is_correct" class="form-check-input" role="switch" ${isCorrect ? "checked" : ""}></td>
                </div>
            </div>
        <td class="align-middle">
            <button class="btn btn-icon btn-sm waves-effect waves-light rounded-pill" name="delete_answer">
                <i class="text-danger mdi mdi-window-close fs-17"></i>
            </button>
        </td>`

    row.querySelectorAll('textarea[name="answer_name"], input[name="answer_is_correct"]')
        .forEach(elem => {
            elem.addEventListener('change', (e) => {
                const i = parseInt(row.getAttribute('data-index'))
                updateAnswerList(i)
            })
        })

    row.querySelector('button[name="delete_answer"]')
        .addEventListener('click', (e) => { 
            const i = parseInt(row.getAttribute('data-index'))
            const indexAnswer = answerList.findIndex(item => item.index == i)
            const answer = answerList[indexAnswer]

            if(answer.status == 'edit') {
                answer.status = 'delete'
            } else {
                answerList.splice(indexAnswer, 1)
            }

            row.remove()
            updateAllNumber()

            console.log({answerList})
        })

    answerList.push({
        index: _index,
        id: Helper.isEmpty(id) ? null : id,
        no: number,
        answer: answer,
        isCorrect: isCorrect,
        status: !data ? 'new' : 'edit'
    })

    _index++
}

function updateAnswerList(index) {
    const tr = answerTableBody.querySelector(`tr[data-index="${index}"]`)

    const answer = answerList.find(item => item.index == index && item.status != 'delete')
    answer.answer = tr.querySelector(`textarea[name="answer_name"]`).value
    answer.isCorrect = tr.querySelector('input[name="answer_is_correct"').checked
}

function updateAllNumber() {
    Array.from(answerTableBody.children).forEach((row, index) => {
        const newNumber = index + 1
        const attrIndex = parseInt(row.getAttribute('data-index'))
        const answer = answerList.find(item => item.index == attrIndex)
        
        answer.no = newNumber
        row.children[1].textContent = newNumber
    })
}

export { modal }