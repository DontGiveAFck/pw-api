import express from 'express';
import bodyParser from 'body-parser';
import bearerToken from 'express-bearer-token';
import database from './database/connection';
import dotenv from 'dotenv';
import {createUser, getUsersList, login} from './controllers/authController';
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

// protected
// TODO - limit, offset
app.get('/users', async (req, res) => {
    const resJson = await getUsersList(req, res);
});

app.listen(PORT, () => {
    console.log(`server working on port ${PORT}`);
});
