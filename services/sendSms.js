const Nexmo = require('nexmo');
const config = require('config')
const nexmo = new Nexmo({
  apiKey: config.get('smsApiKey'),
  apiSecret: config.get('smsApiSecret'),
});

exports.sendVerificationSms = function(reciever, text){
    
const from = config.get('appName');
const to = reciever;
const smsText = text;

const result = nexmo.message.sendSms(from, to, smsText);
console.log(result, reciever)
}