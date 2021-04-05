const express = require('express');
const router = express.Router();
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose');
const {Slide, validateSlide} = require("../models/Slide.model");
const _ = require("lodash");
const auth = require("../middleware/auth");
const { makeError } = require('../utils/makeErrorResponse');
router.use(express.json());

const acceptedBookExt = [ '.ppt', '.pptx', '.doc', '.docx']
const acceptedImgExt = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.doc']
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `uploads/${file.fieldname}`);
    },
    filename: (req, file, cb) => {
        cb(null ,req.body.name + '_'+ path.parse(file.originalname).name+'_'+Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
        switch(file.fieldname){
            case 'slide' :{
                if (acceptedBookExt.includes(path.extname(file.originalname))) {
                    cb(null, true);
                } else {
                    req.fileValidationError =`fayl turi mos kelmadi qo'llanadigan fayl turlari:${acceptedBookExt.join(' ')}`
                    cb(null, false);
                } break;
            }
            case 'image' : {
                if (acceptedImgExt.includes(path.extname(file.originalname))) {
                    cb(null, true);
                } else {
                    req.imageValidationError =`fayl turi mos kelmadi qo'llanadigan fayl turlari:${acceptedImgExt.join(' ')}`
                    cb(null, false);
                }
            }
            
           
        }
    };

const upload = multer({ storage: storage, fileFilter: fileFilter }).fields([{name:'slide', maxCount: 1}, {name:'image', maxCount:1}]);

router.get('/',auth, async (req, res)=>{
    const slide =await Slide.find()
    .sort({updated_at:1});
   return res.send(slide);
});

//Upload route
router.post('/',auth, async (req, res) => {
    const newSlide= {
        name:req.body.name,
        author:req.body.author
    }
    const {error} = validateSlide(newSlide);
    if(error)
        return res.status(400).send(error.details[0].message)
        
        await upload(req, res, async (err)=>{
            if(req.imageValidationError )
                return res.status(400).send(req.imageValidationError)
    
            if(req.fileValidationError)
                return res.status(400).send(makeError("image "+req.fileValidationError))
            console.log(req.files)
            const uploadedSlide = {
                name:req.body.name, 
                filename:req.files.slide[0].filename, 
                filepath:req.files.slide[0].path,
                imagepath:req.files.image[0].path
            }
    
            const savedSlide = new Slide(uploadedSlide)
            const savedObject = await savedSlide.save()
    
            if(savedObject)
                return res.status(200).send(savedObject)
                
            else return res.status(500).send(makeError('Bu Faylni qo\'shib bo\'lmadi'));
        })
})

// //for delete method /books/id
router.delete('/:id',auth, async(req, res)=>{
    const slide = await Slide.findOne({_id:{$eq:req.params.id}})
    if(!slide)
        return res.status(404).send(makeError("Kitob  topilmadi"));

    const deleted = slide.deleteOne()
    if(deleted)
    await fs.unlink(slide.filepath, ()=>{
        return res.send(slide);
    })
    else return res.status(400).send(makeError("Fayl o'chirishda xatolik"))
});

router.put('/:id',auth, async (req, res)=>{
    const newSlide= {name:req.body.name}
    const {error} = validatorBook(newSlide);
    
    if(error)
        return res.status(q).send(error.details[0].message);
    
    const slide = await Slide.findOne({_id:{$eq:req.params.id}})
    if(!slide)
        return res.status(404).send(makeError("kitob topilmadi"))
     upload(req, res,async (err)=>{
        if(req.fileValidationError){
            return res.status(400).send(makeError(req.fileValidationError))
        }
        else{
            const uploadedSlide = {
                name:req.body.name, 
                filename:req.file.filename, 
                filepath:req.file.path,
                updated_at:Date.now()
            }
            
            const updatedSlide =await Slide.findByIdAndUpdate(req.params.id, uploadedSlide, {new:true})
            if(updatedSlide){
                await fs.unlink(slide.filepath, (err)=>{
                    if(err){
                        return res.status(403).send(makeError("failed to delete"))
                    }
                    return res.send(updatedSlide);
                })
            }else
                return res.status(403).send(makeError('Bu Kitobni yangilab bo\'lmadi'));
        }
    })
    
});
router.get('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send(makeError('Yaroqsiz id'));
  
    let slide = await Slide.findById(req.params.id);
    if (!slide)
      return res.status(404).send(makeError('Berilgan IDga teng bo\'lgan kitob topilmadi'));
    return res.download(path.join(path.parse(__dirname).dir, slide.filepath));
  });
router.get('/image/:id', async (req, res)=>{
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send(makeError('Yaroqsiz id'));
  
    let slide = await Slide.findById(req.params.id);
    if (!slide)
      return res.status(404).send(makeError('Berilgan IDga teng bo\'lgan kiton topilmadi'));
    return res.sendFile(path.join(path.parse(__dirname).dir, slide.imagepath));
})

router.get('/image/:id', async (req, res)=>{
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send('Yaroqsiz id');
  
    let slide = await Slide.findById(req.params.id);
    if (!slide)
      return res.status(404).send('Berilgan IDga teng bo\'lgan slide topilmadi');
    return res.sendFile(path.join(path.parse(__dirname).dir, slide.imagepath));
})

router.get('/open/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send(makeError('Yaroqsiz id'));

    let slide = await Slide.findById(req.params.id);
    if (!slide)
        return res.status(404).send(makeError('Berilgan IDga teng bo\'lgan kitob topilmadi'));
    return res.sendFile(path.join(path.parse(__dirname).dir, slide.filepath));
});

module.exports = router;