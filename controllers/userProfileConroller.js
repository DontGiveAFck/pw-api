const jwt = require('jwt-then');
const jsonwebtoken = require('jsonwebtoken');
import database from '../database/connection';
import dotenv from 'dotenv';
dotenv.config();

export const createTransaction = async (req, res) => {
    const db = database.getDb();
    const usersCollection = db.collection('users');
    const currentDate = new Date().toLocaleString('en-US');

    const token = req.token;

    try {
        await jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    } catch (e) {
        return res.status(401).send('UnauthorizedError');
    }

    const {
        username,
        amount
    } = req.body;

    if (!username || amount <= 0) {
        return res.status(400).send('Invalid username or amount');
    }

    // get sender email from token
    const { email: senderEmail} = jsonwebtoken.decode(token);

    // find sender
    const sender = await usersCollection.findOne({email: senderEmail});

    // check if sender balance enough
    if (sender.balance < amount) {
        return res.status(400).send('balance exceeded');
    }

    // find recipient
    const recipient = await usersCollection.findOne({username});
    if (!recipient) {
        return res.status(400).send('user not found');
    }

    // update recipient balance
    usersCollection.updateOne({
        username
    }, {
        $set: {
            balance: recipient.balance + amount,
            transactions: [
                ...recipient.transactions,
                {
                    id: recipient.transactions.length,
                    date: currentDate,
                    username: recipient.username,
                    amount: amount,
                    balance: recipient.balance + amount
                }
            ]
        }
    });

    // update sender account
    usersCollection.updateOne({
        username: sender.username
    }, {
        $set: {
            balance: sender.balance - amount,
            transactions: [
                ...sender.transactions,
                {
                    id: sender.transactions.length,
                    date: currentDate,
                    username: sender.username,
                    amount: -amount,
                    balance: sender.balance - amount
                }
            ]
        }
    });

    return res.json({
        id: sender.transactions.length,
        date: currentDate,
        username: recipient.username,
        amount: -amount,
        balance: sender.balance - amount
    })
};

export const getLoggedUserInfo = async (req, res) => {
    const db = database.getDb();
    const usersCollection = db.collection('users');
    const { token } = req;

    try {
        await jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    } catch (e) {
        return res.status(401).send('UnauthorizedError');
    }

    const { email } = jsonwebtoken.decode(token);

    try {
        const user = await usersCollection.findOne({email}, {username: 1});

        return res.json(user);
    } catch (e) {
        console.log(e);

        return res.status(503).send('Something went wrong.');
    }
};

export const getLoggedUserTransactions = async (req, res) => {
    const db = database.getDb();
    const usersCollection = db.collection('users');
    const { token } = req;

    try {
        await jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    } catch (e) {
        return res.status(401).send('UnauthorizedError');
    }

    const { email } = jsonwebtoken.decode(token);

    try {
        const user = await usersCollection.findOne({email});

        return res.json(user.transactions);
    } catch (e) {
        console.log(e);

        return res.status(503).send('Something went wrong.');
    }
};

export const getFilteredUsersList = async (req, res) => {
    const db = database.getDb();
    const usersCollection = db.collection('users');
    const { token, body } = req;

    try {
        await jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    } catch (e) {
        return res.status(401).send('UnauthorizedError');
    }

    const { filter } = body;

    const resArray = [];
    await usersCollection.find({"username": {$regex : `.*${filter}.*`}})
        .forEach(item => resArray.push(item));

    const mappedResArray = resArray.map(item => ({id: item._id, name: item.username}));

    return res.json(mappedResArray);
};
