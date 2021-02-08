import express from 'express'

import getCurrentTokenSupply from './token-supply.js'

const app = express()
const PORT = 5000

app.get('/',(req, res)=>{
    res.send('API is running..')
})

app.get('/token-supply/',(req, res)=>{
    res.json(getCurrentTokenSupply(req.query.timestamp)) // 'http://localhost:5000/token-supply/?timestamp=2021-01-16+14:30:00'
})

app.listen(PORT, ()=>console.log('Server running on PORT - ',PORT))