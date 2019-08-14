const jwt = require('jwt-then');
import database from '../database/connection';
import dotenv from 'dotenv';
dotenv.config();

export const createUser = async (body) => {
    const db = database.getDb();
    const usersCollection = db.collection('users');
    const {
        username,
        password,
        email
    } = body;

    try {
        const result = await usersCollection.insertOne( {
            username,
            password,
            email
        });

        return await jwt.sign({
            email
        }, process.env.JWT_PRIVATE_KEY);
    } catch (e) {
        console.log(e);
    }
};

export const login = async (req, res) => {
    const db = database.getDb();
    const usersCollection = db.collection('users');
    const {
        email,
        password
    } = req.body;

    try {
        if (!email || !password) {
            return res.code(400).json({errorMessage: 'You must send email and password.'});
        }
        const resArray = [];
        await usersCollection.find({email, password}).forEach(item => resArray.push(item));

        if (resArray.length) {
            const id_token = await jwt.sign({
                email
            }, process.env.JWT_PRIVATE_KEY);

            return res.code(200).json(id_token);
        } else {
            return res.code(401).json({errorMessage: 'Invalid email or password.'});
        }

    } catch (e) {
        console.log(e);
    }
};

export const getUsersList = async (req, res) => {
    const db = database.getDb();
    const usersCollection = db.collection('users');
    try {
        const resArray = [];
        await usersCollection.find().forEach(item => resArray.push(item));

        return res.json(resArray);
    } catch (e) {
        console.log(e);
    }
};
