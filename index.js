const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const config = require('./config/key')

const { User } = require("./models/User")

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());

app.use(cookieParser())

const mongoosu = require('mongoose')
mongoosu.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected.....'))
  .catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World!'))


app.post('/register', (req, res) => {

    const user = new User(req.body)
    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "Not exist User."
            })
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
                return res.json({loginSuccess: false, message: "Not matched password."})
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                res.cookie("x-auth", user.token)
                .status(200)
                .json({ loginSuccess: true,
                userId: user._id})
            })
        })    

    })
})



app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))