// create element
function buatElement(x, index) {   
    // card
    const card = document.createElement('div')
    card.classList.add('card')
    card.setAttribute('id', x.id)

    // text card
    const cardText = document.createElement('div')
    cardText.classList.add('card-text')

    const textTitle = document.createElement('p')
    textTitle.innerText = x.tugas

    const deskripsiText = document.createElement('p')
    deskripsiText.classList.add('text-time')
    let deadline;
    if (x.mulai == '' && x.berakhir == '') {
        deadline = x.deskripsi
    } else {
        deadline = `${x.mulai} | ${x.berakhir}`
    }
    deskripsiText.innerHTML = deadline

    // btn card
    const cardBtn = document.createElement('div')
    cardBtn.classList.add('card-btn')

    const centang = document.createElement('img')
    centang.classList.add('centang')
    centang.setAttribute('src', 'img/check-solid.svg')
    centang.addEventListener('click', (e) => {
        pindahKeSudahSelesai(e.target.parentElement.parentElement.id)
        popup(alertMsg.check)
    })

    const ulangi = document.createElement('img')
    ulangi.classList.add('ulangi')
    ulangi.setAttribute('src', 'img/reply-solid.svg')
    ulangi.addEventListener('click', (e) => {
        pindahKeBelumSelesai(e.target.parentElement.parentElement.id)
        popup(alertMsg.reply)
    })

    const buang = document.createElement('img')
    buang.classList.add('buang')
    buang.setAttribute('src', 'img/trash-solid.svg')
    buang.addEventListener('click', (e) => {
        buangDariSudahSelesai(e.target.parentElement.parentElement.id)
        popup(alertMsg.delete)
    })
    // edit btn
    const editBtn = document.createElement('img')
    editBtn.classList.add('editBtn')
    if (x.selesai) {
        editBtn.setAttribute('src', 'img/pen-to-square-solid-dark.svg')
    } else {
        editBtn.setAttribute('src', 'img/pen-to-square-solid.svg')
    }
    editBtn.addEventListener('click', () => {
        editCard(index)
        popup(alertMsg.edit)
    })

    // penggabungan
    cardText.append(textTitle, deskripsiText)
    card.append(cardText, cardBtn, editBtn)

    card.addEventListener('click', () => {
        deskripsiText.innerText = x.deskripsi
    })
    card.addEventListener('mouseleave', () => {
        deskripsiText.innerHTML = deadline
    })
    // dataset
    card.dataset.cardIndex = index
    // style
    card.style.borderLeftColor = x.color
    
    if (x.selesai) {
        cardBtn.append(ulangi, buang)
        return document.getElementById('sudah').appendChild(card)
    } else {
        cardBtn.append(centang)
        return document.getElementById('belum').appendChild(card)
    }
}

// element option
function pindahKeSudahSelesai(idYangDiCari) {
    for (let i in tugas) {
        if (tugas[i].id == idYangDiCari) {
            tugas[i].selesai = true
            document.dispatchEvent(new Event('renderTugas'))
        }
    }
}

function pindahKeBelumSelesai(idYangDiCari) {
    for (let i in tugas) {
        if (tugas[i].id == idYangDiCari) {
            tugas[i].selesai = false
            document.dispatchEvent(new Event('renderTugas'))
        }
    }
}

function buangDariSudahSelesai(idYangDiCari) {
    for (let i in tugas) {
        if (tugas[i].id == idYangDiCari) {
            tugas.splice(i, 1)
            document.dispatchEvent(new Event('renderTugas'))
        }
    }
}