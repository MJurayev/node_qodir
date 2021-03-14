const express = require('express');
const router = express.Router();
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose');
const {Book, validatorBook} = require("../models/Book.model");
const _ = require("lodash");
const auth = require("../middleware/auth");
router.use(express.json());

const acceptedBookExt = [ '.docx', '.pdf', '.doc', '.rtf', '.pb2']
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
            case 'book' :{
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

const upload = multer({ storage: storage, fileFilter: fileFilter }).fields([{name:'book', maxCount: 1}, {name:'image', maxCount:1}]);

router.get('/',auth, async (req, res)=>{
    const book =await Book.find()
    .sort({updated_at:1});
   return res.send(book);
});

//Upload route
router.post('/',auth, async (req, res) => {
    const newBook= {
        name:req.body.name,
        author:req.body.author,
        category:req.body.category
    }
    const {error} = validatorBook(newBook);
    if(error)
        return res.status(400).send(error.details[0].message)
        
        await upload(req, res, async (err)=>{
            if(req.imageValidationError )
                return res.status(400).send(req.imageValidationError)
    
            if(req.fileValidationError)
                return res.status(400).send(req.fileValidationError)
    
            const uploadedBook = {
                name:req.body.name, 
                filename:req.files.book[0].filename, 
                filepath:req.files.book[0].path,
                imagepath:req.files.image[0].path
            }
    
            const savedBook = new Book(uploadedBook)
            const savedObject = await savedBook.save()
    
            if(savedObject)
                return res.status(200).send(savedObject)
                
            else return res.status(500).send('Bu Faylni qo\'shib bo\'lmadi');
        })
})

// //for delete method /books/id
router.delete('/:id',auth, async(req, res)=>{
    const book = await Book.findOne({_id:{$eq:req.params.id}})
    if(!book)
        return res.status(404).send("Kitob  topilmadi");

    const deleted = book.deleteOne()
    if(deleted)
    await fs.unlink(book.filepath, ()=>{
        return res.send(book);
    })
    else
    return res.send("Fayl o'chirishda xatolik")
});

router.put('/:id',auth, async (req, res)=>{
    const newBook= {name:req.body.name}
    const {error} = validatorBook(newBook);
    
    if(error)
        return res.status(q).send(error.details[0].message);
    
    const book = await Book.findOne({_id:{$eq:req.params.id}})
    if(!book)return res.status(404).send("kitob topilmadi")
     upload(req, res,async (err)=>{
        if(req.fileValidationError){
            return res.status(400).send(req.fileValidationError)
        }
        else{
            const uploadedBook = {
                name:req.body.name, 
                filename:req.file.filename, 
                filepath:req.file.path,
                author:req.body.author,
                category:req.body.category, 
                updated_at:Date.now()
            }
            console.log(req.file)
            const updatedBook =await Book.findByIdAndUpdate(req.params.id, uploadedBook, {new:true})
            if(updatedBook){
                await fs.unlink(book.filepath, (err)=>{
                    if(err){
                        return res.send("failed to delete")
                    }
                    return res.send(updatedBook);
                })
            }else
                return res.status(403).send('Bu Kitobni yangilab bo\'lmadi');
        }
    })
    
});


router.get('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send('Yaroqsiz id');
  
    let book = await Book.findById(req.params.id);
    if (!book)
      return res.status(404).send('Berilgan IDga teng bo\'lgan kiton topilmadi');
    return res.download(path.join(path.parse(__dirname).dir, book.filepath));
  });
router.get('/image/:id', async (req, res)=>{
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send('Yaroqsiz id');
  
    let book = await Book.findById(req.params.id);
    if (!book)
      return res.status(404).send('Berilgan IDga teng bo\'lgan kiton topilmadi');
    return res.sendFile(path.join(path.parse(__dirname).dir, book.imagepath));
})
router.get('/open/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).send('Yaroqsiz id');

    let book = await Book.findById(req.params.id);
    if (!book)
        return res.status(404).send('Berilgan IDga teng bo\'lgan kitob topilmadi');
    return res.sendFile(path.join(path.parse(__dirname).dir, book.filepath));
});

module.exports = router;