import express from 'express';
import bodyParser from 'body-parser';
import bearerToken from 'express-bearer-token';
import database from './database/connection';
import dotenv from 'dotenv';
import {createUser, getUsersList, login} from './controllers/authController';
import {createTransaction, getLoggedUserInfo, getLoggedUserTransactions} from "./controllers/userProfileConroller";

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bearerToken());

const PORT = process.env.PORT || 3200;

database.connectToServer();

app.get('/', (req, res) => {
    console.log('get on /');
    res.send('404')
});

app.post('/users', async (req, res) => {
    const resJson = await createUser(req.body);
    res.json(resJson);
});

app.post('/sessions/create', async (req, res) => {
    await login(req, res);
});

// TODO - limit, offset
app.get('/users', async (req, res) => {
    await getUsersList(req, res);
});

// protected
app.post('/api/protected/transactions', async (req, res) => {
    await createTransaction(req, res);
});

app.get('/api/protected/user-info', (req, res) => {
        getLoggedUserInfo(req, res);
});

app.get('/api/protected/transactions', (req, res) => {
    getLoggedUserTransactions(req, res);
});

app.listen(PORT, () => {
    console.log(`server working on port ${PORT}`);
});
