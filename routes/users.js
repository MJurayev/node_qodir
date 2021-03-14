const express = require('express');
const config = require('config')
const router = express.Router();
const {sendVerificationSms} = require('../services/sendSms')
const  {transporter, mailOptions} = require('../services/sendEmail')
const {User, validator, generateCode} = require("../models/User.model");
const _ = require("lodash");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt")
router.use(express.json());
// const cors = require('cors');


//Get query /users:GET
router.get('/',auth, async (req, res)=>{
    const users =await User.find()
    .sort({login:1, isAdmin:1});
    return res.status(200).json(users);
});

router.post('/', async (req, res)=>{
    // req.body must login, password, repeat_password, email, imgUrl, 
    const {error} = validator(req.body);
    if(error)
        return res.status(400).send(error.details[0].message);
    let user =await User.findOne({payload:req.body.payload});
    if(user)
        return res.status(400).send(`Bu ${req.body.authType} avval ro'yxatdan o'tgan`);
    user =await User.findOne({login:req.body.login});
    if(user)
        return res.status(400).send("Bu login avval ro'yxatdan o'tgan");
    //generate random number string
    const verifyCode = generateCode(4)
    console.log(req.body)
    if(req.body.authType ==='phone'){
        sendVerificationSms(req.body.payload, `Your verify code is: ${verifyCode}`)
    }
    if(req.body.authType ==='email'){
        const mailOptions={
            from:"solihaeljahonqizi@gmail.com",
            to : req.body.payload,
            subject : "Please confirm your Email account",
            // text:"Ro'yxatdan o'tish uchun emailingizni tasdiqlang",
            html : `<a href="${config.get('appLink')}">jurayev.uz</a><br><h1 align="center">Sizning xavfsizlik kodingiz: ${verifyCode}</h1>` 
            }
         transporter.sendMail(mailOptions,async function(err, res){
            if(err){
                console.log(err)
            }else{
                console.log('success')
                }
            })
    }
                user = new User(_.pick(req.body, ['login',  'password','authType','payload']));
                user.verifyCode = verifyCode
                const salt = await bcrypt.genSalt();
                user.password = await bcrypt.hash(user.password, salt);
                await user.save();
               return  res.send(_.pick(user, ['_id', 'login','payload', 'isAdmin','authType', 'isVerified']));    
});

//for delete method /users/id
router.delete('/:id',auth, async(req, res)=>{
    if(!(await User.findOne({_id:{$eq:req.params.id}})))
        return res.status(404).send("User topilmadi");

    const user  = await User.findByIdAndDelete(req.params.id);
        return res.send(user);
});

router.put('/:id', auth, async(req, res)=>{
    const {error} = validator(req.body);
    if(error)
        return res.status(400).send(error.details[0].message);
    let userDB2 = await User.findOne({_id:{$ne:req.params.id}, login:{$eq:req.body.login} });
    let userDB1 = await User.findOne({_id:{$ne:req.params.id}, payload:{$eq:req.body.payload} });
    if(userDB2)
        return res.send(`Bunday ${userDB1.authType} mavjud`);
    if(userDB1)
        return res.send(`Bunday ${userDB2.authType} mavjud`);
    let user = await User.findByIdAndUpdate({_id:req.params.id}, {
        login:req.body.login,
        password:req.body.password,
        authType:req.body.authType,
        payload:req.body.payload,
        imgUrl:req.body.imgUrl,
        isAdmin:false,
        updated_at:Date.now()
    }, {new :true});
    if(user)
         res.send(_.pick(user, ['_id','login', 'email','authType', 'payload', 'imgUrl', 'isAdmin' ]));
        return res.send('Foydalanuvchini yangilab bo\'lmadi');
});


router.get('/:id',auth, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send('Yaroqsiz id');
  
    let user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).send('Berilgan IDga teng bo\'lgan foydalanuvchi topilmadi');
  
    res.send(user);
  });
module.exports = router;