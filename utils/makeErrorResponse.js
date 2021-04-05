function makeError(message="Nimadir xato ketdi",status='error'){
    return JSON.stringify({
        status:status,
        message:message
    })
}

module.exports.makeError = makeError