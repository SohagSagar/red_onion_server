const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middlewire
app.use(cors()) //for sharing data from different port number
app.use(express.json()); // for receiving data from body and parsing that data

//mongodb connection strings
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.fr5zi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async() =>{
  try{

    // connection status with mongodb
    await client.connect();
    console.log('db connected successfully');

    //creating db collections
    const foodCollection= client.db(`${process.env.DB_NAME}`).collection('foodCollection');
    const orderCollection= client.db(`${process.env.DB_NAME}`).collection('orderCollection');



   
     //********* creating apis ***********//

    //****************
    // GET APIs 
    //****************

    //api for getting food item with category
    app.get('/food-items/:category',async(req,res)=>{
      const category=req.params.category;
      const filter = {category:category}
      const result = await foodCollection.find(filter).toArray();
      res.send(result);
    });

    //api for geting individual food item details
    app.get('/food-details/:id',async(req,res)=>{
      const id=req.params.id;
      const filter = { _id: ObjectId(id) }
      const result = await foodCollection.findOne(filter);
      res.send(result);
    })

    //api for getting all food items
    app.get('/food-items',async(req,res)=>{
      const result= await foodCollection.find().toArray();
      res.send(result);
    })

    // api for getting my-order for individual orders
    app.get('/my-order/:email',async(req,res)=>{
      const email=req.params.email;
      const result=await orderCollection.find({email:email}).toArray();
      res.send(result);
    })

    //api for ordered items details
    app.get('/my-order-details/:id',async(req,res)=>{
      const id= req.params.id;
      console.log('id',id);
      const result= await orderCollection.findOne({_id:ObjectId(id)});
      res.send(result);
    })







    //****************
    // POST APIs 
    //****************


    //api for posting food items into database
    app.post('/add-food',async(req,res)=>{
      const data = req.body;
      const result= await foodCollection.insertOne(data)
      res.send(result);
    })

    //api for ordering foods
    app.post('/order-foods',async(req,res)=>{
      const data= req.body;
      const result = await orderCollection.insertOne(data);
      res.send(result);
    })
     


     //****************
    // DELETE APIs 
    //****************
    
    //api for delete order items
    app.delete('/my-order/:id',async(req,res)=>{
      const id=req.params.id;
      const result =await orderCollection.deleteOne({_id:ObjectId(id)});
      res.send(result);
    })



  }

  finally{

  }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Red onion server is running')
  })
  
  app.listen(port, () => {
    console.log(`Red onion server is listening on port ${port}`)
  })