import express from 'express';
import getCurrentTokenSupplyV2, { totalTokenSupplyV2 } from './token-supply-v2.js';
import getCurrentTokenSupply from './token-supply.js';

const app = express();
const PORT = 5001;

app.get('/', (req, res) => {
    res.send('API is running..');
});

app.get('/token-supply/', async (req, res) => {
    try {
        const tokenSupply = await getCurrentTokenSupply(req.query.timestamp);
        res.json(tokenSupply);
    } catch (error) {
        console.error("Error fetching token supply: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/circulating-supply/', async (req, res) => {
    try {
        const tokenSupply = await getCurrentTokenSupply(req.query.timestamp);
        res.json(tokenSupply);
    } catch (error) {
        console.error("Error fetching circulating supply: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/total-supply/', (req, res) => {
    res.json(20000000);
});

app.get('/token-supply-v2/', async (req, res) => {
    try {
        const tokenSupply = await getCurrentTokenSupplyV2(req.query.timestamp);
        res.json(tokenSupply);
    } catch (error) {
        console.error("Error fetching token supply V2: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/circulating-supply-v2/', async (req, res) => {
    try {
        const tokenSupply = await getCurrentTokenSupplyV2(req.query.timestamp);
        res.json(tokenSupply);
    } catch (error) {
        console.error("Error fetching circulating supply V2: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/supply-v2/', async (req, res) => {
    try {
        const tokenSupply = await getCurrentTokenSupplyV2(req.query.timestamp);
        // const totalSupply = await totalTokenSupplyV2();
        const totalSupply = 1000000000
        const response = {
            "circluatingSupply": tokenSupply,
            "totalSupply": totalSupply
        }
        res.json(response);
    } catch (error) {
        console.error("Error fetching circulating supply V2: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/total-supply-v2/', async(req, res) => {
    try {
        const tokenSupply = await totalTokenSupplyV2();
        res.json(tokenSupply);
    } catch (error) {
        console.error("Error fetching total circulating supply V2: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => console.log('Server running on PORT - ', PORT));
