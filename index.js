const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId, Timestamp } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//MiddleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.yfy0tas.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//DB connect
async function dbConnect() {
  try {
    await client.connect();
    console.log("Database is Connected");
  } catch (error) {
    console.log(error);
  }
}
dbConnect();

//DB collections
const serviceCollection = client.db("dentisia").collection("services");
const reviewsCollection = client.db("dentReviews").collection("reviews");

//For Home Section
app.get("/home", async (req, res) => {
  try {
    const cursor = serviceCollection.find({});
    const services = await cursor.limit(3).sort({ _id: -1 }).toArray();
    res.send(services);
  } catch (error) {
    console.log(error.message);
  }
});

//For Services Section
app.get("/services", async (req, res) => {
  try {
    const cursor = serviceCollection.find({});
    const services = await cursor.sort({ _id: -1 }).toArray();
    res.send(services);
  } catch (error) {
    console.log(error.message);
  }
});

app.get('/services/:id', async(req,res) => {
    const {id} = req.params
    const result = await serviceCollection.findOne({_id: ObjectId(id)})
    res.send(result)
})

//Add Service
app.post("/services", async (req, res) => {
  try {
    const query = req.body;
    const result = await serviceCollection.insertOne(query);
    console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

//Add Review
app.post('/reviews/', async(req,res)=>{
    try {
        const query = req.body;
        const {serviceId, email, username, photoURL, message} = query;
        const result = await reviewsCollection.insertOne({serviceId, email, username, photoURL, message, "timestamp": new Date()})
        res.send(result)
    } catch (error) {
        console.log(error.message)
    }
})

//Get Review
app.get('/reviews', async(req,res)=>{
    const query = req.query.serviceId;
    const cursor = await reviewsCollection.find({serviceId: query})
    const result = await cursor.sort({timestamp: -1}).limit(3).toArray()
    res.send(result)
})

//Server Connection Status
app.get("/", (req, res) => {
  res.send("API is Running");
});
app.listen(port, () => console.log("Server is running through port: ", port));
