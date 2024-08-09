const nodemialer = require('nodemailer')

const transport = nodemialer.createTransport({
    service: 'gmail',
    port: 587,
    auth:{
        user: process.env.GMAIL_ACCOUNT,
        pass:  process.env.GMAIL_PASSWORD
    }
})

module.exports = transport