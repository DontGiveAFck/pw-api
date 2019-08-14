const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
import dotenv from 'dotenv';
dotenv.config();
const dbName = process.env.DB_NAME || 'parrotwings';

let _db;

export default {
    connectToServer: function() {
        console.log(dbName);
        MongoClient.connect( url,  { useNewUrlParser: true }, function( err, client ) {
            _db  = client.db(dbName);
            console.log('connected to mongoDB');
        } );
    },

    getDb: function() {
        return _db;
    }
};
