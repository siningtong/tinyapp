const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser())
const PORT = 8080;


app.set('view engine','ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};
//console.log(urlDatabase)

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
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
    urls: urlDatabase,
    username: req.cookies.username
  }
  //console.log(templateVars)
  // console.log(req.cookies)
  res.render('urls_index', templateVars)
})

app.get('/urls/new',(req,res)=>{
  let templateVars ={
    username: req.cookies.username
  }
  res.render("urls_new",templateVars);
})

// app.get('/register',(req,res)=>{
//   let templateVars ={
//     username: req.cookies.username
//   }
//   res.render("urls_registration",templateVars);
// })

app.post('/register',(req,res)=>{
  let randomUsername = generateRandomString();
  if(req.body.email==='' || req.body.password===''){
    res.status(400).send('Bad Request')
  }
  //else if(req.body.email === users[])
  users[randomUsername] = {
    id:randomUsername,
    email:req.body.email,
    password:req.body.password
  }
  console.log(users)
res.cookie('user_id ',randomUsername)
res.redirect('/urls')
});

app.post('/login',(req,res)=>{
  res.cookie('username',req.body.username);
  res.redirect('/urls');
})
app.post('/logout',(req,res)=>{
  res.clearCookie('username')
  res.redirect('/urls');
})
app.get('/urls/:shortURL',(req,res)=>{
  let templateVars = {
    shortURL: req.params.shortURL,//whatever the client put in shortURL will be stored in req.params.shortURL.server look for the according long url based on the shortURl.
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  }
  res.render('urls_show.ejs',templateVars)//pase templateVars to ejs,but ejs will just take the object that templateVars stands for. So in ejs, just use the key in the object,not templateVars.
})

app.post('/urls',(req,res)=>{
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL
  res.redirect(`/urls/${randomString}`)
})

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
    // console.log(longURL)
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete',(req,res)=>{
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls')
})

app.post('/urls/:shortURL',(req,res)=>{
  console.log(req.params.shortURL)
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect('/urls')
})









function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').substring(0,6)
  }














app.listen(PORT,()=>{
  console.log(`Example app listening on port ${PORT}!`)
});
