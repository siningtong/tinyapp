const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine','ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req,res)=>{
  res.send('Hello');
})

app.get('/urls.json',(req,res)=>{
  res.json(urlDatabase)
})

app.get('/hello',(req,res)=>{
  res.send('<html><body>hello <b>World<b></body></html>\n')
});

app.get('/urls',(req,res)=>{
  let templateVars = {
    urls: urlDatabase
  }
  res.render('urls_index', {urls: urlDatabase})
})

app.get('/urls/new',(req,res)=>{
  res.render("urls_new");
})

app.get('/urls/:shortURL',(req,res)=>{
  console.log(req)
  let templateVars = {
    shortURL: req.params.shortURL,//whatever the client put in shortURL will be stored in req.params.shortURL.server look for the according long url based on the shortURl.
    longURL: urlDatabase[req.params.shortURL]
  }
  res.render('urls_show.ejs',templateVars)//pase templateVars to ejs,but ejs will just take the object that templateVars stands for. So in ejs, just use the key in the object,not templateVars.
})

app.post('/urls',(req,res)=>{
  console.log(req.body)
  res.send('ok')
})

function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').substring(0,6)
  }

  console.log(generateRandomString())













app.listen(PORT,()=>{
  console.log(`Example app listening on port ${PORT}!`)
});
