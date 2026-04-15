const express = require('express')
const cors = require('cors')
const app = express() 

require('./db.js')

// middleware
app.use(cors({
    origin: 'http://localhost:5173'
}))
app.use(express.json())


const filmsRouter = require('./routes/films.js')
const recommendationsRouter = require('./routes/recommendations')

app.use('/films', filmsRouter)
app.use('/api/recommendations', recommendationsRouter)

const PORT = 5000
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})