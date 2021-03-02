const express = require('express')
const {Visit} = require('../models/Visitors.model')
const router = express.Router()

router.get('/', (req, res)=>{
    return res.send('salk')
})


module.exports = router