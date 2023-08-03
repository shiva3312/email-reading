require('dotenv').config();
var gmail = require("./GmailAPI");
// const cors = require('cors')

const express = require('express')
const app = express()
const port = 8080

// app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
app.get('/reademail', async (req, res) => {
    const { message, createdDate } = await gmail.readInboxContent("from:someEmail@gmail.com");
    const otp = parseInt(message.split("*")[1]);
    console.log({ OTP: otp, CREATED_DATE: createdDate });
    return res.json({ OTP: otp, createdDate });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})