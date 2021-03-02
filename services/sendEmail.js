const nodemailer = require('nodemailer')
// var transporter = nodemailer.createTransport({
    
//     service: "Yandex",
//     auth: { 
//         user: 'jurayevmansurbek@yandex.ru', 
//         pass: 'avjnyvwnlixndngd' 
//     }
    
// });
var transporter = nodemailer.createTransport({
   
    service: "gmail",
    auth: { 
        user: 'solihaeljahonqizi@gmail.com', 
        pass: 'soliha94'
    },
    
});
exports.transporter = transporter


