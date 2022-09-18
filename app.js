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
    by: String,
    selesai: Boolean
})

// read
app.get('/x6', (req, res) => {
    Task.find({}, (err, tasks) => {
        res.send(tasks)
    })
})

// return res.send({msg: })

// create
app.post('/x6', (req, res) => {
    if (!admin.hasOwnProperty(req.body.token)) {
        return res.send({msg: `${req.body.token} bukan admin`})
    } else {
        let task = new Task({
            tugas: req.body.tugas,
            deskripsi: req.body.deskripsi,
            color: req.body.color,
            mulai: req.body.mulai,
            berakhir: req.body.berakhir,
            selesai: false
        })
        task.save()
        res.send({msg: `item telah ditambah oleh ${admin[req.body.token]}`})
    }
})
// update
app.put('/x6', async (req, res) => {
    if (!admin.hasOwnProperty(req.body.token)) {
        return res.send({msg: `${req.body.token} bukan admin`})
    } else {
        await Task.updateOne({_id: req.body.id}, { 
            $set: {
                tugas: req.body.tugas,
                deskripsi: req.body.deskripsi,
                color: req.body.color,
                mulai: req.body.mulai,
                berakhir: req.body.berakhir,
            }
        })
        res.send({msg: `item telah diubah oleh ${admin[req.body.token]}`})
    }    
})
// delete
app.delete('/x6/:id', async (req, res) => {
    if (!admin.hasOwnProperty(req.body.token)) {
        return res.send({msg: `${req.body.token} bukan admin`})
    } else {
        await Task.findByIdAndDelete(req.params.id)
        res.send({msg: `item telah dihapus oleh ${admin[req.body.token]}`})
    }
})
// load task
app.get('/x6/:id', async (req, res) => {
    const task = await Task.findById(req.params.id)
    res.send(task)
})
// reverse
app.put('/x6/reverse', async (req, res) => {
    if (!swapper.hasOwnProperty(req.body.token)) {
        return res.send({msg: `password "${req.body.token}" tidak valid`})
    } else {
        await Task.updateOne({_id: req.body.id}, {
            $set: {
                selesai: !req.body.selesai
            }
        })
        return res.send({msg: `berhasil dibalik oleh ${swapper[req.body.token]}`})
    }
})

// roles
const swapper = {
    akuudin: 'Owner',
    imadmin: 'Admin',
    kelasx6: 'X-6'
}
const admin = {
    akuudin: 'Owner',
    imadmin: 'Admin',
}
app.put('/x6/title', (req, res) => {
    res.send({title: swapper[req.body.pass] || 'Guest'})
})

// listen
app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}/`)
})