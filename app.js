const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

const port = 3000

// connect db
const mongoose = require('mongoose')
mongoose.connect(`mongodb+srv://udin:udin123@cluster0.5ieghid.mongodb.net/todoapp`)

// setup
app.set('view engine', 'ejs')

// middleware
app.use(cors())
app.use(express.static('public'))
// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


// schema
const Task = mongoose.model('Task', {
    tugas: String,
    deskripsi: String,
    color: String,
    mulai: String,
    berakhir: String,
    selesai: Boolean
})

// create object
app.get('/x6', (req, res) => {
    Task.find({}, (err, tasks) => {
        res.send(tasks)
    })
})
app.get('/x6/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id)
    res.redirect('/x6')
})
app.post('/x6', (req, res) => {
    let task = new Task({
        tugas: req.body.tugas,
        deskripsi: req.body.deskripsi,
        color: req.body.color,
        mulai: req.body.awal,
        berakhir: req.body.akhir,
        selesai: false
    })
    task.save()
    console.log(task)
    res.redirect('/x6')
})

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}/`)
})