const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//MiddleWare
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.yfy0tas.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//DB connect
async function dbConnect (){
    try {
        await client.connect()
        console.log('Database is Connected')
    } catch (error) {
        console.log(error)
    }
}
dbConnect();

//DB collections
const serviceCollection = client.db('dentisia').collection('services');

//Server Connection Status
app.get('/', (req,res)=>{
    res.send('API is Running')
})
app.listen(port, ()=> console.log('Server is running through port: ', port))
