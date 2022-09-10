let tugas = []
const myChache = 'todolist'


// window on load
window.addEventListener('load', () => {
    ambilProggress()
    document.dispatchEvent(new Event('renderTugas'))
    minimize()
    greet()
    getDate()
})

// render Element
document.addEventListener('renderTugas', () => {
    document.getElementById('belum').innerHTML = ''
    document.getElementById('sudah').innerHTML = ''
    tugas.map((x, index) => buatElement(x, index))
    simpanProggress()
    updateProggress()
})

//  form on submit
const form = document.getElementById('form')
form.addEventListener('submit', (e) => {
    e.preventDefault()

    tugas.push({
        id: +new Date(),
        tugas: document.getElementById('tugas').value,
        deskripsi: document.getElementById('deskripsi').value,
        color: document.getElementById('color').value,
        mulai: document.getElementById('mulai').value,
        berakhir: document.getElementById('tanggal').value,
        selesai: false
    })
    
    document.dispatchEvent(new Event('renderTugas'))
    rotateSubmitButton()
    popup(alertMsg.add)
})

// animate btn submit 
function rotateSubmitButton() {
    const btnSubmit = document.getElementById('submitImg')
    btnSubmit.style.animation = 'rotate .3s'
    setTimeout(() => {
        btnSubmit.style.animation = ''
    }, 300)
}

// copy "belumDilakukan" list
document.getElementById('copyBtn').addEventListener('click', copyClipboard)
function copyClipboard() {
    let result = ''
    let textResult = document.createElement('textarea')
    textResult.style.userSelect = 'all'

    // creating text
    tugas.map(x => {
        if(x.selesai == false) {
            if (x.mulai == '' && x.berakhir == '') {
                result += `[${x.tugas}\n${x.deskripsi}]\n\n`
                return
            }
            result += `${x.tugas}\n${x.mulai} | ${x.berakhir}\n${x.deskripsi}\n\n`
        }
    })
    textResult.innerHTML = result + '\nhttps://mcwooden.github.io/todo/'

    // append textarea
    document.getElementById('copyArea').append(textResult)

    // copy
    textResult.select()
    document.execCommand("Copy")

    // hide textarea
    document.getElementById('copyArea').innerHTML = ''
    document.getElementById('CopyState').innerHTML = 'tersalin!'
}

fetch("https://jservice.io/api/random")
.then(res => res.json())
.then(x => {
    document.getElementById('quote').innerHTML = x[0].question
    document.getElementById('author').innerHTML = `Level ${x[0].value}`
    document.getElementById('author').addEventListener('click', () => document.getElementById('author').innerHTML = x[0].answer)
    document.getElementById('trivia').style.display = 'block'
    document.getElementById('header').style.top = 'auto'
})

// styling
// make footer marginBottom = height nav
document.getElementById('footer').style.marginBottom = (document.getElementById('nav').offsetHeight + 15) + 'px'

// form state
let formState = {
    isMinimize: true,
    isEdit: false,
}
function minimize(e) {
    if (formState.isMinimize) {
        document.getElementById('form').style.height = '0'
        formState.isMinimize = false
        document.getElementById('minimize').style.transform = 'rotate(0deg)'
        document.getElementById('buttonToSubmit').style.visibility = 'hidden'
    } else {
        document.getElementById('form').style.height = '235px'
        formState.isMinimize = true
        document.getElementById('minimize').style.transform = 'rotate(180deg)'
        if (!formState.isEdit) {
            document.getElementById('buttonToSubmit').style.visibility = 'visible'
        } else {
            document.getElementById('buttonToSubmit').style.visibility = 'hidden'
        }
    }
}
document.getElementById('minimize').addEventListener('click', minimize) 

// update proggres
function updateProggress() {
    if (tugas.length === 0) {
        document.getElementById('proggress').style.display = 'none'
    }
    const tugasSelesai = tugas.filter(x => !x.selesai)
    const tugasBelum = tugas.filter(x => x.selesai)
    document.getElementById('valueBar').style.width = Math.round((tugasSelesai.length / tugas.length)*100) + '%'
    document.getElementById('valueBarRed').style.width = Math.round((tugasBelum.length / tugas.length)*100) + '%'
}

// greet
function greet() {
    const hours = new Date().getHours()
    if (hours >= 18) {
        document.getElementById('greet').innerText = 'Selamat malam'
    } else if (hours >= 12) {
        document.getElementById('greet').innerText = 'Selamat Siang'
    } else {
        document.getElementById('greet').innerText = 'Selamat Pagi'
    }
}
const dayName = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
const monthName = ['Januari','Februari','Maret','April','Mei','Juni','Juni','Agustus','September','Oktober','November','November']
function getDate() {
    document.getElementById('dateNow').innerText = new Date().getDate()
    document.getElementById('day').innerText = dayName[new Date().getDay()]
    document.getElementById('month').innerText = monthName[new Date().getMonth()]
    document.getElementById('year').innerText = new Date().getFullYear()
}

// edit area
function editCard(x) {
    formState.isEdit = true
    document.getElementById('tugas').value = tugas[x].tugas
    document.getElementById('deskripsi').value = tugas[x].deskripsi
    document.getElementById('mulai').value = tugas[x].mulai
    document.getElementById('tanggal').value = tugas[x].berakhir
    document.getElementById('color').value = tugas[x].color
    if (document.getElementById('color').value == '#000000') {
        document.getElementById('color').value = '#31364c'
    }
    document.getElementById('btnUpdate').style.visibility = 'visible'
    document.getElementById('btnUpdate').dataset.key = x
    getEditStatus(x)
}
document.getElementById('btnUpdate').addEventListener('click', (e) => {
    e.preventDefault()
    saveEdit(document.getElementById('btnUpdate').dataset.key)
    kembalikanKeDefault()
})
function getEditStatus(x) {
    document.getElementById('dateNow').innerText = x
    document.getElementById('day').innerText = tugas[x].tugas
    document.getElementById('month').innerText = '#' + tugas[x].id
    document.getElementById('year').innerText = tugas[x].selesai
    document.getElementById('greet').innerText = 'Mengubah data:' 
}
// save edit
function saveEdit(x) {
    tugas[x].tugas = document.getElementById('tugas').value
    tugas[x].deskripsi = document.getElementById('deskripsi').value
    tugas[x].color = document.getElementById('color').value
    tugas[x].mulai = document.getElementById('mulai').value
    tugas[x].berakhir = document.getElementById('tanggal').value
    document.dispatchEvent(new Event('renderTugas'))
    popup(alertMsg.save)
}
function kembalikanKeDefault() {
    document.getElementById('tugas').value = ''
    document.getElementById('deskripsi').value = ''
    document.getElementById('mulai').value = ''
    document.getElementById('tanggal').value = ''
    document.getElementById('color').value = '#31364c'
    greet()
    getDate()
    formState.isEdit = false
    document.getElementById('btnUpdate').style.visibility = 'hidden'
}

// pop up :)
alertMsg = {
    add: {
        link: 'img/plus-solid.svg',
        bgColor: '#A27B5C'
    },
    delete: {
        link: 'img/trash-solid-white.svg',
        bgColor: '#774360'
    },
    check: {
        link: 'img/check-solid.svg',
        bgColor: '#0D7377'
    },
    reply: {
        link: 'img/reply-solid.svg',
        bgColor: '#A27B5C'
    },
    edit: {
        link: 'img/pen-to-square-solid.svg',
        bgColor: '#2b2f42'
    },
    save: {
        link: 'img/floppy-disk-solid.svg',
        bgColor: '#277BC0'
    }
}

function popup(imgLink) {
    const alertImg = document.createElement('img')
    alertImg.src = imgLink.link
    alertImg.style.backgroundColor = imgLink.bgColor
    document.getElementById('alert').appendChild(alertImg)


    setTimeout(() => {
        alertImg.style.opacity = '0'
        alertImg.style.transform = 'translateX(-5px)'
    }, 2000)
    setTimeout(() => {
        alertImg.remove()
    }, 2100)
}