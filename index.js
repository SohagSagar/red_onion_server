const { MongoClient, ServerApiVersion } = require('mongodb');
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



   
     //********* creating apis ***********//


    //****************
    // POST APIs 
    //****************


    //api for posting food items into database
    app.post('/add-food',async(req,res)=>{
      const data = req.body;

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