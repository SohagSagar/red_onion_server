const express = require('express')
const app = express()
const port = process.env.PORT || 5000;






app.get('/', (req, res) => {
    res.send('Red onion server is running')
  })
  
  app.listen(port, () => {
    console.log(`Red onion server is listening on port ${port}`)
  })