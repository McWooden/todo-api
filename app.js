const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

const port = process.env.PORT || 3000

// connect db
const mongoose = require('mongoose')
mongoose.connect(`mongodb+srv://udin:udin123@cluster0.5ieghid.mongodb.net/todoapp`)

// middleware
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json({limit: '1mb'}))

// schema
const Task = mongoose.model('Task', {
    tugas: String,
    deskripsi: String,
    color: String,
    mulai: String,
    berakhir: String,
    selesai: Boolean
})

// create
app.post('/x6', (req, res) => {
    let task = new Task({
        tugas: req.body.tugas,
        deskripsi: req.body.deskripsi,
        color: req.body.color,
        mulai: req.body.mulai,
        berakhir: req.body.berakhir,
        selesai: false
    })

    task.save()
    res.send(req.body)
})
// read
app.get('/x6', (req, res) => {
    Task.find({}, (err, tasks) => {
        res.send(tasks)
    })
})
// update
app.put('/x6', async (req, res) => {
    await Task.updateOne({_id: req.body.id}, { 
        $set: {
            tugas: req.body.tugas,
            deskripsi: req.body.deskripsi,
            color: req.body.color,
            mulai: req.body.mulai,
            berakhir: req.body.berakhir,
        }
    })
    console.log(req.body)
    res.send('berhasil diubah cuy')
})
// delete
app.delete('/x6/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id)
    res.send('item telah dihapus')
})
// load task
app.get('/x6/:id', async (req, res) => {
    const task = await Task.findById(req.params.id)
    res.send(task)
})
// reverse
app.put('/x6/reverse', async (req, res) => {
    await Task.updateOne({_id: req.body.id}, {
        $set: {
            selesai: !req.body.selesai
        }
    })
    res.send('berhasil dibalik')
})

// listen
app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}/`)
})