const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  Timestamp,
} = require("mongodb");
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

//DB collections

const serviceCollection = client.db("dentisia").collection("services");
const reviewsCollection = client.db("dentReviews").collection("reviews");

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

//JWT Verification Middleware
const verifyJWT = (req, res, next) => {
  const verifyHeader = req.headers.authorization;
  if (!verifyHeader) {
    res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = verifyHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
    if (error) {
      console.log(error.message);
    } else {
      req.decoded = decoded;
      return next();
    }
  });
};

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

app.get("/services/:id", async (req, res) => {
  const { id } = req.params;
  const result = await serviceCollection.findOne({ _id: ObjectId(id) });
  res.send(result);
});

//Add Service

app.post("/services", async (req, res) => {
  try {
    const query = req.body;
    const result = await serviceCollection.insertOne(query);
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

//Add Review

app.post("/reviews/", async (req, res) => {
  try {
    const query = req.body;
    const { serviceId, email, username, photoURL, message, name , serviceImg} = query;
    const result = await reviewsCollection.insertOne({
      serviceId,
      serviceImg,
      email,
      username,
      photoURL,
      message,
      name,
      timestamp: new Date(),
    });
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

//Get Review

app.get("/reviews", async (req, res) => {
  const query = req.query.serviceId;
  const cursor = reviewsCollection.find({ serviceId: query });
  const result = await cursor.sort({ timestamp: -1 }).toArray();
  res.send(result);
});

//JWT Authorization

app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.send({ token });
});

//Get my reviews with JWT Verification

app.get("/myreviews", verifyJWT, async (req, res) => {
  const decoded = req.decoded;
  if (decoded.email !== req.query.email) {
    res.status(403).send({ message: "Forbidden" });
  }
  const query = req.query.email;
  const cursor = reviewsCollection.find({ email: query });
  const result = await cursor.sort({ _id: -1 }).toArray();
  res.send(result);
});

//Delete my reviews

app.delete("/myreviews/:id", async (req, res) => {
  const { id } = req.params;
  const result = await reviewsCollection.deleteOne({ _id: ObjectId(id) });
  res.send(result);
});

//Edit my Review

app.get("/editreview/:id" , async(req,res)=>{
  const {id} = req.params;
  const result = await reviewsCollection.findOne({_id: ObjectId(id)})
  res.send(result)
})

app.patch("/editreview/:id", async (req, res) => {
  const { id } = req.params;
  const message = req.body.message;
  const result = await reviewsCollection.updateOne(
    { _id: ObjectId(id) },
    { $set: { message: message } }
  );
  res.send(result);
});

//Server Connection Status
app.get("/", (req, res) => {
  res.send("API is Running");
});
app.listen(port, () => console.log("Server is running through port: ", port));
