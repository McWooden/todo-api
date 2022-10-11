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
    picture: String,
    nickname: String,
    isi: String,
    tag: String,
    title: String,
    date: String,
    color: String,
    like: [String],
    comment: [String]
})
const UserSchema = mongoose.model('User', {
    sub: String,
    name: String,
    picture: String,
    nickname: String,
    password: String,
    rank: String
})
// more option
const monthName = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sept','Okt','Nov','Des']

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
app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/google', successRedirect: '/protected' }))
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
    res.send({msg: 'akun selesai dibuat'})
})
app.put('/get-my-profile', async (req, res) => {
    const user = await UserSchema.findOne({nickname: req.body.nickname, password: req.body.password})
    res.send(user)
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
        res.send({msg: `item telah ditambah`})
})
app.post('/x6/twit', (req, res) => {
    let twit = new Twit({
        picture: req.body.picture,
        nickname: req.body.nickname,
        title: req.body.title,
        isi: req.body.isi,
        tag: req.body.tag,
        date: `${new Date().getDate()} ${monthName[new Date().getMonth()]}`,
        color: '#31364c',
        like: req.body.nickname,
        comment: []
    })
    twit.save()
    res.send({msg: `Twit telah ditambah oleh`})
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
        res.send({msg: `item telah diubah oleh`})
})
app.put('/x6/twit/addLike', async (req, res) => {
    await Twit.findOneAndUpdate({_id: req.body.id}, {
        $addToSet: {
            "like": req.body.nickname
        }
    })
    res.send({msg: 'like'})
})
app.delete('/x6/twit/removeLike', async (req, res) => {
    const data = await Twit.findOneAndUpdate({_id: req.body.id}, {
        $pull: {
            "like": req.body.nickname
        }
    })
    res.send({msg: data})
})

// delete
app.delete('/x6/:id', async (req, res) => {
        await Task.findByIdAndDelete(req.params.id)
        res.send({msg: `item telah dihapus oleh`})
})

// reverse
app.put('/x6/reverse', async (req, res) => {
        await Task.updateOne({_id: req.body.id}, {
            $set: {
                selesai: !req.body.selesai
            }
        })
        return res.send({msg: `berhasil dibalik oleh`})
})

// find task
app.put('/x6/:id', async (req, res) => {
        const task = await Task.findById(req.params.id)
        res.send(task)
})



app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}/`)
})