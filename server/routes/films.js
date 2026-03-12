const router = require('express').Router()
const {sql , poolPromise} = require('../db.js')


router.get('/', async (req, res)=>{
try{
    const pool = await poolPromise
    const result = await pool.request().query('SELECT TOP(50) * FROM imdb_movies')  
    res.json(result.recordset)
}
catch(err){
res.status(500).json({ error : err.message})
}})

module.exports = router