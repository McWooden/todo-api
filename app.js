const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const passport = require('passport');
const session = require('express-session')
require('./auth')

const url = 'https://x6todo.herokuapp.com'
const urlLocal = 'http://localhost:3000'

function isLoggedin (req, res, next) {
    req.user ? next() : res.sendStatus(401)
}
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
app.use(session({
    secret: 'aku udin',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.set("view engine", "ejs");


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
const Twit = mongoose.model('Twit', {
    nickname: String,
    isi: String,
    tag: String,
    title: String,
    date: String,
    time: String,
    color: String
})
const UserSchema = mongoose.model('User', {
    sub: String,
    name: String,
    picture: String,
    nickname: String,
    password: String,
    rank: String
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
// more option
const monthName = ['Januari','Februari','Maret','April','Mei','Juni','Juni','Agustus','September','Oktober','November','November']

app.put('/x6/title', (req, res) => {
    res.send({title: swapper[req.body.pass] || 'Guest'})
})

app.get('/google', (req, res) => {
    res.render('register')
})
app.get('/auth/google', async (req, res) => {
    await passport.authenticate('google', { scope: ['profile'] })
})
app.get('/protected', isLoggedin, (req, res) => {
    res.render('create-account', {data: req.user._json})
})
app.get('/auth/failure', (req, res) => {
    res.send('Somenthing wrong...')
})
app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/protected' }))
app.get('/find-account/:nickname', async (req, res) => {
    const user = await UserSchema.findOne({nickname: req.params.nickname})
    if (user) {
        res.send({msg: 'notAvaible'})
    } else {
        res.send({msg: 'avaible'})
    }
})
app.post('/create-account', (req, res) => {
    let user = new UserSchema({
        sub: req.body.sub,
        name: req.body.name,
        picture: req.body.picture,
        nickname: req.body.nickname,
        password: req.body.password,
        rank: 'Member'
    })
    user.save()
    res.send('akun selesai dibuat')
})

// find all
app.get('/x6', (req, res) => {
    Task.find({}, (err, task) => {
        res.send(task)
    })
})
app.get('/x6/twit', (req, res) => {
    Twit.find({}, (err, twit) => {
        res.send(twit)
    })
})

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
            by: req.body.by,
            selesai: false
        })
        task.save()
        res.send({msg: `item telah ditambah oleh ${admin[req.body.token]}`})
    }
})
app.post('/x6/twit', (req, res) => {
    if (!admin.hasOwnProperty(req.body.token)) {
        return res.send({msg: `${req.body.token} bukan admin`})
    } else {
        let twit = new Twit({
            nickname: req.body.nickname,
            title: req.body.title,
            isi: req.body.isi,
            tag: req.body.tag,
            date: `${new Date().getDate()} ${monthName[new Date().getMonth()]}`,
            time: `${new Date().getHours()}.${new Date().getMinutes()}`,
            color: '#31364c'
        })
        twit.save()
        res.send({msg: `Twit telah ditambah oleh ${admin[req.body.token]}`})
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

// find task
app.put('/x6/:id', async (req, res) => {
    if (!admin.hasOwnProperty(req.body.token)) {
        return res.send({msg: `${req.body.token} bukan admin`})
    } else {
        const task = await Task.findById(req.params.id)
        res.send(task)
    }
})



app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}/`)
})