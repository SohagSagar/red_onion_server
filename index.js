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



const verifyJWT= (req,res,next)=>{
  const authHeader = req.headers.authorization;
  
  if(!authHeader){
    return res.status(401).send({message:'unauthorized access'});
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN,function (err,decoded){
    if(err){
      console.log(err);
      return res.status(403).send({message:'forbidden access'})
    }
    req.decoded=decoded;
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




    //********* creating apis ***********//

    //****************
    // GET APIs 
    //****************


    //api for getting superAdmin
    app.get('/super-admin/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }
      const result = await userCollection.findOne(filter);
      if(result?.role==='superAdmin'){
       return res.status(200).send({status:200,message:"verified admin"})
      }
      res.status(403).send(result);
    });

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
    app.get('/my-order/:email',verifyJWT, async (req, res) => {
      const email = req.params.email;
      const result = await orderCollection.find({ email: email }).toArray();
      res.send(result);
    })

    //api for ordered items details
    app.get('/my-order-details/:id', async (req, res) => {
      const id = req.params.id;
      const result = await orderCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    })

    //api for getting user reviews
    app.get('/user-reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    //api for getting user reviews
    app.get('/user-review/:email', async (req, res) => {
      const email= req.params.email;
      const result = await reviewCollection.find({email:email}).toArray();
      res.send(result);
    })

    









    //****************
    // POST APIs 
    //****************


    //api for posting food items into database
    app.post('/add-food', async (req, res) => {
      const data = req.body;
      const result = await foodCollection.insertOne(data)
      res.send(result);
    })

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


    //****************
    // PUT APIs 
    //****************

    //api for register user in the database
    app.put('/users/:email',async(req,res)=>{
      const email=req.params.email;
      const data= req.body;
      const filter={email:email}
      const options={upsert:true};
      const updatedDoc={
        $set:data
      };
      const result = await userCollection.updateOne(filter,updatedDoc,options);
      const token = jwt.sign(filter,process.env.ACCESS_TOKEN,{expiresIn:'1h'});
      res.send({result,token});
    })



    //****************
    // DELETE APIs 
    //****************

    //api for delete order items
    app.delete('/my-order/:id', async (req, res) => {
      const id = req.params.id;
      const result = await orderCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    })

    //api for deleting user review
    app.delete('/user-review/:id', async (req, res) => {
      const id= req.params.id;
      const result = await reviewCollection.deleteOne({_id:ObjectId(id)});
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