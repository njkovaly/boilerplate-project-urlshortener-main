require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

let mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// Basic Configuration
const port = process.env.PORT || 3000
app.use(cors())
app.use('/public', express.static(`${process.cwd()}/public`))

//db.runCommand({"listCollections": 1, filter: {name: "foo" }});

// Set up database
const UrlSchema = new mongoose.Schema({
  short: Number,
  original: String
});

let url = mongoose.model('Url', UrlSchema)

let responseObject = {}

app.post('/api/shorturl', (req, res) => {

  const getMax = url.aggregate([
    { $group: { _id: null, maxShort: { $max: "$short" } } }
  ])
  getMax.exec()
  .then(function(maximum) {
    let nextNum = 0    
    nextNum = (maximum[0].maxShort + 1)
    console.log(nextNum)
    url.create({short: nextNum, original: req.body.url})          
  })

//  res.json(nextNum, req.body)
})

app.get('/api/shorturl/:input', (req, res) => {
  let inputNum = req.params.input
  let result = url.findOne({short: inputNum})
  result.exec()
  .then (function(shortRec) {
    res.redirect('https://' + shortRec.original)   
  })
})

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`)
});

