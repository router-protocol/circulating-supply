const express = require('express')

const getCurrentTokenSupply = require('./token-supply')

const app = express()
const PORT = 5000

app.get('/',(req, res)=>{
    res.send('API is running..')
})

app.get('/token-supply/',(req, res)=>{
    res.json(getCurrentTokenSupply(req.query.timestamp)) 
})
app.get('/circulating-supply/',(req, res)=>{
    res.json(getCurrentTokenSupply(req.query.timestamp)) 
})
app.get('/total-supply/',(req, res)=>{
    res.json(20000000) 
})
app.listen(PORT, ()=>console.log('Server running on PORT - ',PORT))