require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://glowing-concha-6db759.netlify.app'
  ]
}))
app.use(express.json())

const filmsRouter = require('./routes/films')
const recommendationsRouter = require('./routes/recommendations')

app.use('/films', filmsRouter)
app.use('/api/recommendations', recommendationsRouter)


app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
 console.log(`OMDb API key: ${process.env.OMDB_API_KEY ? 'loaded' : 'MISSING!'}`)
})