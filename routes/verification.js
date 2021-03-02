const express = require('express')
const { find } = require('lodash')
const {Verytification, validateVerify} = require('../models/Verify.model')
const {User} = require('../models/User.model')
const router = express.Router()

router.post('/',async (req, res)=>{
    const verifyInfo = {
        code:req.body.code,
        type:req.body.type,
        payload:req.body.payload
    }
    const {error} = validateVerify(req.body)
    if(error)
        return res.status(400).send(error.details[0].message)
    switch (req.body.type) {
        case 'email':
            //emailga verifyInfo.code verifyInfo.payloadga jo'natiladi
            break;
        case 'phone':
            //phone numberga verifyInfo.code verifyInfo.payloadga jo'natiladi 
            break;

        default:
            return res.send("Payload type unknown")
    }
   const user =await User.findOne({authType:verifyInfo.type, payload:verifyInfo.payload})
   if(!user)
    return res.status(404).send("Foydalanuvchi topilmadi")

    console.log(user.verifyCode)
   if(user.verifyCode == verifyInfo.code){
    const updated = await user.updateOne({isVerified:true, verifyCode:null})
        if( updated){
            console.log(user)
            return res.send("Verified") 
        }
 
        else
            return res.send('No verified')
   }else{
        return res.send('Xavfsizlik kodi noto\'g\'ri')
   }
})

router.post('/verify',async (req, res)=>{
    // req.body.type || payload || code
    switch(req.body.type){
        case 'email': 
        const userVerified =await Verytification.findOne({email:req.body.payload});
        if(req.body.code === userVerified.code){
            const vUser = await User.findOneAndUpdate({email:req.body.payload}, {isVerified:true})
            if(vUser){
                return res.send("verified")
            }
            else res.status(400).send("no verified")
        }
        break;
    }
})
module.exports = router