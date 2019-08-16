import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bearerToken from 'express-bearer-token';
import database from './database/connection';
import dotenv from 'dotenv';
import {
    createUser,
    getUsersList,
    login
} from './controllers/authController';
import {
    createTransaction,
    getLoggedUserInfo,
    getLoggedUserTransactions,
    getFilteredUsersList
} from "./controllers/userProfileConroller";
// import bluebird from "bluebird";
// import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(bearerToken());

const PORT = process.env.PORT || 3200;

database.connectToServer();

// const jwtVerify = bluebird.promisify(jwt.verify);

// const jwtAuthMiddleware = async (req, res, next) => {
//     const { token } = req;
//     console.log(token);
//     try {
//         await jwtVerify(token, process.env.JWT_PRIVATE_KEY);
//     } catch (e) {
//         console.log(e)
//         return res.status(401).send('UnauthorizedError');
//     }
//
//     next();
// };

app.all('/', (req, res) => {
    console.log('get on /');
    res.send('404')
});

app.post('/users', (req, res) => {
    createUser(req, res);
});

app.post('/sessions/create', (req, res) => {
    login(req, res);
});

// TODO - limit, offset
app.get('/users', (req, res) => {
    getUsersList(req, res);
});

// protected
app.post('/api/protected/transactions', (req, res) => {
    createTransaction(req, res);
});

app.get('/api/protected/user-info', (req, res) => {
    getLoggedUserInfo(req, res);
});

app.get('/api/protected/transactions', (req, res) => {
    getLoggedUserTransactions(req, res);
});

app.post('/api/protected/users/list', (req, res) => {
    getFilteredUsersList(req, res);
});

app.listen(PORT, () => {
    console.log(`server working on port ${PORT}`);
});
