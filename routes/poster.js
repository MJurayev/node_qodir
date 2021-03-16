const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose');
const {Poster, validatorPoster} = require("../models/Poster.model");
const _ = require("lodash");
const auth = require("../middleware/auth");
router.use(express.json());
const acceptedImgExt = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
const acceptedBookExt = [ '.docx', '.cdr']
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
            case 'poster' :{
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

const uploadFile = multer({ storage: storage, fileFilter: fileFilter }).fields([{name:'poster', maxCount: 1}, {name:'image', maxCount:1}]);

router.get('/',auth, async (req, res)=>{
    const poster =await Poster.find()
    .sort({updated_at:1});   
   return res.send(poster);
});

//Upload route
router.post('/',auth, async (req, res) => {
    const newPoster= {name:req.body.name}
    const {error} = validatorPoster(newPoster);
    
    if(error)
        return res.status(400).send(error.details[0].message);
        
              
        uploadFile(req, res, async (err)=>{
            if(err)return res.send(err);
        if(req.imageValidationError ){            
            return res.status(400).send(req.fileValidationError)
        }else if(req.fileValidationError){
            return res.status(400).send(req.fileValidationError)
        } else{
            const uploadedPoster = {
            name:req.body.name, 
            filename:req.files.poster[0].filename, 
            filepath:req.files.poster[0].path, 
            imagepath:req.files.image[0].path
        }
        const savedPoster = new Poster(uploadedPoster)
        const savedObject = await savedPoster.save()
        if(savedObject){
            return res.send(savedObject)
        }else
        return res.status(403).send('Bu Faylni qo\'shib bo\'lmadi');}
        })
            
        
        
    
    
})

// //for delete method /posters/id
router.delete('/:id',auth, async(req, res)=>{
    const poster = await Poster.findOne({_id:{$eq:req.params.id}})
    if(!poster)
        return res.status(404).send("Fayl  topilmadi");

    const deleted = poster.deleteOne()
    if(deleted)
    await fs.unlink(poster.filepath, ()=>{
        return res.send(poster);
    })
    else
    res.send("Fayl o'chirishda xatolik")

});



router.put('/:id',auth, async (req, res)=>{
    const newPoster= {name:req.body.name}
    const {error} = validatorPoster(newPoster);
    
    if(error)
        return res.status(q).send(error.details[0].message);
    
    const poster = await Poster.findOne({_id:{$eq:req.params.id}})
    if(!poster)return res.status(404).send("file topilmadi")
    uploadFile(req, res,async (err)=>{
        if(req.fileValidationError){
            return res.status(400).send(req.fileValidationError)
        }
        else{
            const uploadedPoster = {
                name:req.body.name, 
                filename:req.file.filename, 
                filepath:req.file.path, 
                updated_at:Date.now()
            }

            const updatedPoster =await Poster.findByIdAndUpdate(req.params.id, uploadedPoster, {new:true})
            if(updatedPoster){
                await fs.unlink(poster.filepath, (err)=>{
                    if(err){
                        return res.send("failed to delete")
                    }
                    return res.send(updatedPoster);
                })
            }else
                return res.status(403).send('Bu Faylni yangilab bo\'lmadi');
        }
    })
});


router.get('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send('Yaroqsiz id');
    let poster = await Poster.findById(req.params.id);
    if (!poster)
      return res.status(404).send('Berilgan IDga teng bo\'lgan fayl topilmadi');
    return res.download(path.join(path.parse(__dirname).dir, poster.filepath));
  });

  router.get('/image/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send('Yaroqsiz id');
    let poster = await Poster.findById(req.params.id);
    if (!poster)
      return res.status(404).send('Berilgan IDga teng bo\'lgan fayl topilmadi');
    return res.sendFile(path.join(path.parse(__dirname).dir, poster.imagepath));
  });


module.exports = router;