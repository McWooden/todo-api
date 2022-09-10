if (localStorage.getItem(myChache) == null) {
    localStorage.setItem(myChache, '')
}
function simpanProggress() {
    let simpanJSON = JSON.stringify(tugas)
    localStorage.setItem(myChache, simpanJSON)
}
function ambilProggress() {
    let ambilJSON = JSON.parse(localStorage.getItem(myChache))
    tugas = ambilJSON
}