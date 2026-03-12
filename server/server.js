
const router = require('./routes/films.js')

const express = require('express')
const cors = require('cors')
require('./db.js')

const app = express()
const PORT = 5000

//middleware

app.use(cors())
app.use(express.json())
app.use('/films', router)

app.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`)
})

