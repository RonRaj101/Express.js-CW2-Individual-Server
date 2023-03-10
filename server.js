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
    res.send('<a href="/Lessons">See Lessons</a> <br> <a href="/user">See User</a>');
});

app.param('Lessons', function(req, res, next, collectionName) {
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/:Lessons', (req, res,next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);

    req.collection.find({}).toArray(function(err, results) {
        if (err) {
            return next(err);
        }
        res.send(results);
    });
   
    
});



//save a new order to the database
app.post('/createOrder', async(req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);

    let collection = db.collection('Orders');
    const name = req.body.name;
    const phone = req.body.phone;   
    
    const product_id = req.product_id;//item._id;
    const quantity = req.quantity; //item.quantity;

    const newListing = { name: name, phone: phone, product_id:product_id, quantity:quantity };

    const result = await collection.insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);
    res.redirect('/updateLessonQuantity?id'+product_id+'&quantity='+quantity);

    //go to update lesson quantity route

    // items.forEach(item => {
    //     const product_id = item._id;
    //     const quantity = item.quantity;
    //     collection.insertOne(
    //     {   
    //         name: name, 
    //         phone: phone, 
    //         product_id:product_id,
    //         quantity:quantity
    //      }, 
    //      (err, results) => {
    //     if (err) {
    //         return next(err);
    //     }
    //      res.json(results);
    //     });
    // });
});

//update lesson quantity
app.put('/updateLessonQuantity', async(req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);

    const id = req.body.id;
    const quantity = req.body.quantity;

    let collection = db.collection('Lessons');
    const result = await collection.updateOne(
        { _id: ObjectId(id) },
        { $set: { total_stock: total_stock - quantity } }
    );
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
    res.json(result);
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
    

    res.send( "<a href='/Lessons'>See Lessons</a> <br>" + "Email: " + user[0].Email + " <br> Password: " + user[0].Password);
});

//create 404 error for undefined routes
app.use('*',function(req, res, next) {
    res.status(404).send("Sorry can't find that!");
});

const createLog = (req, res, next) => {
    res.on("finish", function() {
      console.log(req.method, decodeURI(req.url), res.statusCode, res.statusMessage);
    });
    next();
};

app.listen(process.env.PORT || 3000);