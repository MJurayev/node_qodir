require('express-async-errors')
const express =require('express')
const app = express()
const helmet = require('helmet')
const winston = require('winston')
const cors =  require('cors')
const path = require('path')
const errorMiddleware = require('./middleware/error')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(helmet());

const homeRoute = require('./routes/home')
const usersRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const booksRoute = require('./routes/book')
const posterRoute = require('./routes/poster')
const slideRoute = require('./routes/slides')
const verificationRoute = require('./routes/verification')
const visitorRoute = require('./routes/visits')
const quizRoute = require('./routes/quiz')
const resultRoute = require('./routes/result')
require('./includes/db')()
// initialize  Routes
app.use('/api/users',usersRoute)
app.use('/', homeRoute)
app.use('/api/auth', authRoute)
app.use('/api/books', booksRoute)
app.use('/api/slide', slideRoute)
app.use('/api/poster', posterRoute)
app.use('/api/verification', verificationRoute)
app.use('/api/visits', visitorRoute)
app.use('/api/quiz', quizRoute)
app.use('/api/result', resultRoute)
app.use(errorMiddleware)
// app.get('*', (req, res)=>{
//     return res.send('addres topilmadi')
// })

const PORT = 8080

// winston.add(new winston.transports.File({filename:'./ErrorLog.log'}))

app.use( '/uploads',express.static(path.join(__dirname, 'uploads')));
app.listen(PORT, ()=>{
    console.log(`${PORT} - eshitilmoqda`)
})