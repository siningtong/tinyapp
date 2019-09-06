const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['asdf']
}));
const bcrypt = require('bcrypt');
const PORT = 8080;
const getUserByEmail = require('./helpers.js');
app.set('view engine','ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
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

app.get('/', (req,res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});

app.get('/urls.json',(req,res) => {
  res.json(urlDatabase);
});

app.get('/hello',(req,res) => {
  res.send('<html><body>Hello<b>World<b></body></html>\n');
});

app.get('/urls',(req,res) => {
  // get userid from cookie
  const userId = req.session.user_id;
  if (!users[userId]) {
    return res.redirect('/login');
  }
  const userData = users[userId];
  let templateVars = {
    urlDatabase: urlDatabase,
    urls: urlsForUser(userId),
    user:userId,
    userData:userData
  };
  //cookie_id is same to the username in the users object. Get the information from the database(users object) and pass it to the view
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req,res) => {
  if (req.session.user_id === undefined) {
    res.redirect('/login');
    return;
  }
  const userId = req.session.user_id;
  const userData = users[userId];
  let templateVars = {
    user:userId,
    userData:userData
  };
  res.render("urls_new", templateVars);
});

app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const userData = users[userId];
  let templateVars = {
    user:userId,
    userData:userData//need to pass a username beacuse the header needs a username. If we dont pass it a username,even an empty string,the username in header will be undefined.
  };
  res.render("urls_registration", templateVars);
});

app.post('/register', (req, res) => {
  let randomUsername = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('<html><body><b>Bad Request!<b></body></html>');
    return;
  } else if (getUserByEmail(req.body.email,users)) {
     res.status(400).send('<html><body><b>Bad Request!<b></body></html>');
     return;
  };
  const password = req.body.password;//change password to be hashed
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[randomUsername] = {
    id:randomUsername,
    email:req.body.email,
    password:hashedPassword
  };
req.session.user_id = randomUsername;
res.redirect('/urls');
});

app.get('/login',(req,res) => {
  const userId = req.session.user_id;
  const userData = users[userId];
  let templateVars = {
    urls: urlDatabase,
    user:userId,
    userData:userData
  }
  res.render('urls_login.ejs', templateVars);
})// cause we need to use header in the page, and header require a user value,so in order to use the header ,we have to give ti the user value,or it will show undefined

app.post('/login', (req, res) => {
  const userEmail = req.body.email; 
  const user = getUserByEmail(userEmail, users);
  if (user === false){
    res.status(403).send('<html><body><b>Bad Request!<b></body></html>');
    return;
  } 
  else if (bcrypt.compareSync(req.body.password, user.password) === false) {
    res.status(403).send('<html><body><b>Bad Request!<b></body></html>');
     return;
  } 
  else {
    req.session.user_id = user.id; //req.session.cookiename  = value
    res.redirect('/urls');
  }
})

app.post('/logout', (req,res) => {
  req.session = null;
  res.redirect('/urls');
})

app.get('/urls/:shortURL', (req, res) => {
  if(!urlDatabase[req.params.shortURL] ||  req.session.user_id !== urlDatabase[req.params.shortURL].userID){
    res.send('<html><body><b>This URL does not belong to you<b></body></html>');
    return;
  }    
  const userId = req.session.user_id;
  const userData = users[userId];
  let templateVars = {
    shortURL: req.params.shortURL,//whatever the client put in shortURL will be stored in req.params.shortURL.server look for the according long url based on the shortURl.
    longURL: urlDatabase[req.params.shortURL].longURL,
    user:userId,
    userData:userData
  }
  res.render('urls_show.ejs', templateVars);//pass templateVars to ejs,but ejs will just take the object that templateVars stands for. So in ejs, just use the key in the object,not templateVars.
})

app.get('/u/:id',(req,res) => {
  if (!urlDatabase[req.params.id]) {
    res.send('<html><body><b>Not Exist!<b></body></html>');
    return;
  }
  res.status(301).redirect("http://" + urlDatabase[req.params.id].longURL);
  return;
})

app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${randomString}`);
})

app.post('/urls/:shortURL', (req, res) => {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
    return;
  })

app.post('/urls/:shortURL/delete', (req, res) => {
  //console.log(urlDatabase)
  //console.log(req.params)
   if (req.session.user_id === urlDatabase[req.params.shortURL].userID){
    delete urlDatabase[req.params.shortURL];
   
   }
  return res.redirect('/urls');
})

function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').substring(0,6);
  }

function urlsForUser(id){
  let urlArray = [];
  for(let key in urlDatabase){
    if(urlDatabase[key]['userID'] === id){
      urlArray.push(key);
    };
  };
  return urlArray;
}

app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}!`)
});
