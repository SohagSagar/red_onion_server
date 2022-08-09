const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

// middlewire
app.use(cors()) //for sharing data from different port number
app.use(express.json()); // for receiving data from body and parsing that data

//mongodb connection strings
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.fr5zi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      console.log(err.message);
      return res.status(403).send({ message: 'forbidden access' })
    }
    req.decoded = decoded;
    next();
  })
}

const run = async () => {
  try {

    // connection status with mongodb
    await client.connect();
    console.log('db connected successfully');

    //creating db collections
    const foodCollection = client.db(`${process.env.DB_NAME}`).collection('foodCollection');
    const orderCollection = client.db(`${process.env.DB_NAME}`).collection('orderCollection');
    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection('reviewCollection');
    const userCollection = client.db(`${process.env.DB_NAME}`).collection('userCollection');

    const verifyAdmin = async (req, res, next) => {
      const resquester = req.decoded.email;
      const result = await userCollection.findOne({ email: resquester });
      if (result.role === 'superAdmin') {
        next();
      } else {
        return res.status(403).send({ message: 'forbidden access' })
      }
    }


    //********* creating apis ***********//

    //****************
    // GET APIs 
    //****************


    //****************************************
    // ******GET APIs for User dashboard******
    //****************************************

    //api for getting food item with category
    app.get('/food-items/:category', async (req, res) => {
      const category = req.params.category;
      const filter = { category: category }
      const result = await foodCollection.find(filter).toArray();
      res.send(result);
    });

    //api for geting individual food item details
    app.get('/food-details/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) }
      const result = await foodCollection.findOne(filter);
      res.send(result);
    })

    //api for getting all food items
    app.get('/food-items', async (req, res) => {
      const result = await foodCollection.find().toArray();
      res.send(result);
    })

    // api for getting my-order for individual orders
    app.get('/my-order/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const result = await orderCollection.find({ email: email }).toArray();
      res.send(result);
    })

    //api for ordered items details
    app.get('/my-order-details/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const result = await orderCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    })

    //api for getting all user reviews
    app.get('/user-reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    //api for getting individual user reviews
    app.get('/user-review/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const result = await reviewCollection.find({ email: email }).toArray();
      console.log('result', result);
      res.send(result);
    })




    //****************************************
    // ******GET APIs for Admin dashboard*****
    //****************************************

    //api for getting superAdmin
    app.get('/super-admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await userCollection.findOne(filter);
      if (result?.role === 'superAdmin') {
        return res.status(200).send({ status: 200, message: "verified admin" })
      }
      res.status(403).send(result);
    });

    //api for geting all orders 
    app.get('/all-orders/:orderStatus', verifyJWT, verifyAdmin, async (req, res) => {
      const status = req.params.orderStatus;
      console.log(status);
      const filter = { orderStatus: status }

      if (status === 'all-orders') {
        const result = await orderCollection.find().toArray();
        res.send(result);
      } else {
        const result = await orderCollection.find(filter).toArray();
        res.send(result);
      }


    })

    //api for getting all foods
    app.get('/all-foods/:category',verifyJWT,verifyAdmin,async(req,res)=>{
      const category= req.params.category;
      if(category==='all-foods'){
        const result = await foodCollection.find().toArray();
        res.send(result)
      }else{
        const filter= {category:category};
        const result= await foodCollection.find(filter).toArray()
        res.send(result);
      }
    })

    // get api for all user
    app.get('/all-user',verifyJWT,verifyAdmin, async (req, res) => {
      const filter= {role:{$not:{$eq: 'superAdmin'}}}
      const result = await userCollection.find(filter).toArray()
      res.send(result);
    })




    //****************
    // POST APIs 
    //****************



    //****************************************
    // ******POST APIs for User dashboard*****
    //****************************************




    //api for ordering foods
    app.post('/order-foods', async (req, res) => {
      const data = req.body;
      const result = await orderCollection.insertOne(data);
      res.send(result);
    })

    //api for writing user review
    app.post('/user-review', async (req, res) => {
      const data = req.body;
      const result = await reviewCollection.insertOne(data);
      res.send(result);
    })




    //****************************************
    // ******POST APIs for Admin dashboard*****
    //****************************************

    //api for posting food items into database
    app.post('/add-food', verifyJWT, verifyAdmin, async (req, res) => {
      const data = req.body;
      const result = await foodCollection.insertOne(data)
      res.send(result);
    })









    //****************
    // PUT APIs 
    //****************

    //****************************************
    // ******POST APIs for user dashboard*****
    //****************************************

    //api for register user in the database
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email;
      const data = req.body;
      const filter = { email: email }
      const options = { upsert: true };
      const updatedDoc = {
        $set: data
      };
      const result = await userCollection.updateOne(filter, updatedDoc, options);
      const token = jwt.sign(filter, process.env.ACCESS_TOKEN);
      res.send({ result, token });
    })


    //****************************************
    //******POST APIs for Admin dashboard*****
    //****************************************

    //api for changing order status
    app.put('/change-status/:id', verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(data);
      const filter = { _id: ObjectId(id) };
      options = { upsert: true }
      const updatedDoc = {
        $set: data
      }
      const result = await orderCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    })



    //****************
    // DELETE APIs 
    //****************

    //****************************************
    //******POST APIs for User dashboard*****
    //****************************************

    //api for delete order items
    app.delete('/my-order/:id', async (req, res) => {
      const id = req.params.id;
      const result = await orderCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    })

    //api for deleting user review
    app.delete('/user-review/:id', async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    })


    //****************************************
    //******DELETE APIs for Admin dashboard*****
    //****************************************
    app.delete('/all-orders/:id', verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) }
      const result = await orderCollection.deleteOne(filter)
      res.send(result);
    })

    //api for delete food items
    app.delete('/food-items/:id',verifyJWT,verifyAdmin,async(req,res)=>{
      const id = req.params.id;
      const filter = {_id:ObjectId(id)}
      const result= await foodCollection.deleteOne(filter);
      res.send(result);
    })

    //api for deleting user
    app.delete('/user/:id',verifyJWT,verifyAdmin,async(req,res)=>{
      const id = req.params.id;
      const filter = {_id:ObjectId(id)}
      const result= await userCollection.deleteOne(filter)
      res.send(result);
    })



  }

  finally {

  }
}

run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Red onion server is running')
})

app.listen(port, () => {
  console.log(`Red onion server is listening on port ${port}`)
})