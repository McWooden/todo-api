const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const passport = require('passport');
const session = require('express-session')
require('./auth')

const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({storage: storage})

const sharp = require('sharp')

const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
    'https://nvhibgshtzxykdbwmats.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aGliZ3NodHp4eWtkYndtYXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjcyMDkwMDIsImV4cCI6MTk4Mjc4NTAwMn0.IpZgZO5x4KTUzlf6BshNh7O1W2N9Q57mvHdungp1rEQ',
)

const url = 'https://x6todo.herokuapp.com'
const urlLocal = 'http://localhost:3000'

function isLoggedin (req, res, next) {
    req.user ? next() : res.sendStatus(401)
}
const port = process.env.PORT || 3000

// connect db
const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://udin:udin123@cluster0.5ieghid.mongodb.net/todoapp`).then(()=>console.log('connected to atlas')).catch(()=>console.log('error connect to atlas'))

// middleware
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json({limit: '1mb'}))

app.use(session({
    secret: 'aku udin',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.set("view engine", "ejs")

// schema
const Task = mongoose.model('Task', {
    tugas: String,
    deskripsi: String,
    color: String,
    mulai: String,
    tipe: String,
    by: String,
    selesaiCount: [String],
    selesai: Boolean,
    images: [String],
    tugasComment: [{
        nickname: String,
        isi: String,
        time: String
    }]
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
    twitComment: [{
        commentNickname: String,
        commentBody: String
    }]
})
const UserSchema = mongoose.model('User', {
    sub: String,
    name: String,
    picture: String,
    nickname: String,
    password: String,
    rank: String
})
const Jadwal = mongoose.model('Jadwal', {
    title: String,
    image: String
})
// more option
const monthName = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sept','Okt','Nov','Des']

app.get('/auth/google', async (req, res) => {
    await passport.authenticate('google', { scope: ['profile'] })
})
app.get('/protected', isLoggedin, (req, res) => {
    res.render('create-account', {data: req.user._json})
})
app.get('/auth/failure', (req, res) => {
    res.send('Somenthing wrong...')
})
app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', successRedirect: '/protected' }))
app.get('/find-account/:nickname', async (req, res) => {
    const user = await UserSchema.findOne({nickname: req.params.nickname})
    if (user) {
        res.send({msg: 'notAvaible'})
    } else {
        res.send({msg: 'avaible'})
    }
})
app.post('/create-account', async (req, res) => {
    const data = await UserSchema.findOneAndUpdate({sub: req.body.sub}, {
        $set: {
            name: req.body.name,
            nickname: req.body.nickname,
            picture: req.body.picture,
            password: req.body.password
        }
    })
    if (data) return res.send({msg: 'akun selesai diupdate'})
    
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
app.get('/adminroom', (req, res) => {
    res.render('adminroom')
})
app.put('/adminroom', async (req, res) => {
    if (req.body.password.match(/din/i)) {
        await UserSchema.findOneAndUpdate({sub: req.body.userID}, {
            $set: {
                "rank": 'Admin'
            }
        })
        res.send({msg: 'Berhasil!'})
    } else {
        res.send({msg: 'password Salah'})
    }
})
app.delete('/adminroom', async (req, res) => {
    if (req.body.password.match(/din/i)) {
        await UserSchema.findOneAndUpdate({sub: req.body.userID}, {
            $set: {
                "rank": 'Member'
            }
        })
        res.send({msg: 'Berhasil!'})
    } else {
        res.send({msg: 'password Salah'})
    }
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
    if (req.body.rank == 'Admin' || req.body.rank == 'Owner') {
        let task = new Task({
            tugas: req.body.tugas,
            deskripsi: req.body.deskripsi,
            color: req.body.color,
            mulai: req.body.mulai,
            tipe: req.body.tipe,
            by: req.body.by,
            selesai: false,
        })
        task.save()
        console.log(task)
        res.send({msg: task})
    } else {
        console.log(req.body)
        res.send({msg: `anda bukan manager`})
    }
})

app.post('/x6/image', upload.single('image'), async (req, res) => {
    const resizeImage = sharp(req.file.buffer).resize({
        height: 1920,
        width: 1080,
        fit: "contain"
    })
    const { data, error } = await supabase.storage.from('tugas')
    .upload(`${req.body.id}/${req.body.nickname}-${+new Date}`, resizeImage, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: true
    })
    await Task.findByIdAndUpdate(req.body.id, {
        $addToSet: {
            "images": data.path
        }
    })
    res.send({msg: data, error})
})

app.get('/x6/jadwal', async (req, res) => {
    const data = await Jadwal.findOne({})
    res.send(data)
})
app.put('/x6/jadwal', upload.single('img'), async (req, res) => {
    const resizeImage = sharp(req.file.buffer).resize({
        height: 1920,
        width: 1080,
        fit: "contain"
    })
    const namaBaru = `jadwal-${+new Date()}`
    const namaLama = await Jadwal.findOne({title: 'Jadwal'})
    const { dataMove, errorMove } = await supabase.storage.from('tugas').move(namaLama.image, namaBaru)
    const { data, error } = await supabase.storage.from('tugas')
    .upload(namaBaru, resizeImage, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: true
    })
    await Jadwal.findOneAndUpdate({title: 'Jadwal'}, {
        $set: {
            'image': namaBaru
        }
    })
    res.send({msg: 'jadwal diganti'})
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
                tipe: req.body.tipe,
            }
        })
        res.send({msg: `item telah diubah oleh`})
})
app.put('/x6/twit', async (req, res) => {
        await Twit.updateOne({_id: req.body.id}, { 
            $set: {
                isi: req.body.isi,
                tag: req.body.tag,
                date: `${new Date().getDate()} ${monthName[new Date().getMonth()]} (diedit)`
            }
        })
        res.send({msg: `item telah diubah oleh`})
})
// nambah array
app.put('/x6/addSelesai', async (req, res) => {
    await Task.findOneAndUpdate({_id: req.body.id}, {
        $addToSet: {
            "selesaiCount": req.body.nickname
        }
    })
    res.send({msg: 'selesai'})
})
app.put('/x6/deleteSelesai', async (req, res) => {
    await Task.findOneAndUpdate({_id: req.body.id}, {
        $pull: {
            "selesaiCount": req.body.nickname
        }
    })
    res.send({msg: 'tunda'})
})
app.put('/x6/twit/addLike', async (req, res) => {
    await Twit.findOneAndUpdate({_id: req.body.id}, {
        $addToSet: {
            "like": req.body.nickname
        }
    })
    res.send({msg: 'like'})
})
app.put('/x6/twit/deleteLike', async (req, res) => {
    const data = await Twit.findByIdAndUpdate(req.body.id, {
        $pull: {
            "like": req.body.nickname
        }
    })
    res.send({msg: data})
})
app.put('/x6/addComment', async (req, res) => {
    const data = await Task.findByIdAndUpdate(req.body.id, {
        $addToSet: {
            "tugasComment": {
                "nickname": req.body.nickname,
                "isi": req.body.isi,
                "time": req.body.time
            }
        }
    })
    console.log(req.body)
    res.send({msg: data})
})
app.put('/x6/deleteComment', async (req, res) => {
    const data = await Task.findByIdAndUpdate(req.body.id, {
        $pull: {
            'tugasComment': {
                '_id': req.body.commentId
            }
        }
    })
    console.log(req.body)
    res.send({msg: data})
})
app.put('/x6/twit/addComment', async (req, res) => {
    const data = await Twit.findByIdAndUpdate(req.body.id, {
        $addToSet: {
            "twitComment": {
                "commentNickname": req.body.commentNickname,
                "commentBody": req.body.commentBody
            }
        }
    })
    res.send({msg: data})
})
app.put('/x6/twit/deleteComment', async (req, res) => {
    const data = await Twit.findByIdAndUpdate(req.body.id, {
        $pull: {
            'twitComment': {
                '_id': req.body.commentId
            }
        }
    })
    res.send({msg: data})
})

// delete
app.delete('/x6/image', async (req, res) => {
    await Task.findByIdAndUpdate(req.body.id, {
        $pull: {
            'images': req.body.path
        }
    })
    await supabase.storage.from('tugas').remove([req.body.path])
    res.send({msg: `item telah dihapus oleh`})
})
app.delete('/x6/twit', async (req, res) => {
        await Twit.findByIdAndDelete(req.body.id)
        res.send({msg: `item telah dihapus`})
})
app.delete('/x6/:id', async (req, res) => {
        await Task.findByIdAndDelete(req.params.id)
        const { data, error } = await supabase.storage.from('tugas').remove(req.body.images)
        console.log(req.params.id, data, error)
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

// find task and twit
app.put('/x6/:id', async (req, res) => {
        const task = await Task.findById(req.params.id)
        res.send(task)
})

app.put('/x6/twit/:id', async (req, res) => {
        const twit = await Twit.findById(req.params.id)
        res.send(twit)
})

app.get('/', (req, res) => {
    UserSchema.find({}, (err, users) => {
        res.render('index', {users})
    })
})

app.get('/getPublicUrl', (req, res) => {
    const { data } = supabase.storage.from('tugas').getPublicUrl('')
    res.send(data)
})

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}/`)
})
