const express = require('express');
const app = express();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
let propertiesReader = require("properties-reader");
let path = require("path");
let cors = require('cors');

    let propertiesPath = path.resolve(__dirname, "conf/db.properties");
    let properties = propertiesReader(propertiesPath);
    let dbPprefix = properties.get("db.prefix");
    //URL-Encoding of User and PWD
    //for potential special characters
    let dbUsername = encodeURIComponent(properties.get("db.user"));
    let dbPwd = encodeURIComponent(properties.get("db.pwd"));
    let dbName = properties.get("db.dbName");
    let dbUrl = properties.get("db.dbUrl");
    let dbParams = properties.get("db.params");
    const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;
        
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    let db = client.db(dbName);


app.get('/', (req, res) => {
    res.send('<a href="/lessons">See Lessons</a> <br> <a href="/user">See User</a>');
});

app.param('Lessons', function(req, res, next, collectionName) {
req.collection = db.collection(collectionName);
return next();
});

app.get('/Courses/:Lessons', (req, res,next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);

    req.collection.find({}).toArray(function(err, results) {
        if (err) {
            return next(err);
        }
        res.send(results);
    });
   
    
});

app.get('/user', (req, res) => {

    var user = [
        {
            ID: "123456",
            Name: "Ronit Rai",
            Email: "ronitrai.rk@gmail.com",
            Password: "rOnItRaI_123"
        }
    ];
    

    res.send( "<a href='/lessons'>See Lessons</a> <br>" + "Email: " + user[0].Email + " <br> Password: " + user[0].Password);
});

app.listen(3000);