const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser())
const PORT = 8080;


app.set('view engine','ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};



const users = {
  "uaJ48lW": {
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
  // if(req.cookies.user_id===undefined){
  //   res.send('Please login first!')
  //   return
  // }
  //console.log(req.cookies.user_id)
  // get userid from cookie
  const userId = req.cookies.user_id // 'userRandomID'
  // get user from object
  if(!users[userId]){
    res.redirect('/login')
  }

  const userData= users[userId]
  console.log('users:', users);
  console.log('userID', userId);
  console.log('cookies', req.cookies);

  // add user to template vars
  let templateVars = {
    urlDatabase: urlDatabase,
    urls: urlsForUser(userId),
    user:userId,
    userData:userData
  }
  console.log(templateVars)
  //cookie_id is same to the username in the users object. Get the information from the database(users object) and pass it to the view
  //console.log(templateVars)
  // console.log(req.cookies)
  res.render('urls_index', templateVars)
})

app.get('/urls/new', (req,res)=>{
  if(req.cookies.user_id===undefined){
    res.redirect('/login')
    return
  }
  const userId = req.cookies.user_id;
  const userData= users[userId]
  let templateVars ={
    user:userId,
    userData:userData
  }
  
  res.render("urls_new",templateVars);
})

app.get('/register',(req,res)=>{
  const userId = req.cookies.user_id;
  const userData= users[userId]
  let templateVars ={
    user:userId,
    userData:userData//need to pass a username beacuse the header needs a username. If we dont pass it a username,even an empty string,the username in header will be undefined.
  }
  res.render("urls_registration",templateVars);
})

app.post('/register',(req,res)=>{
  let randomUsername = generateRandomString();
  if(req.body.email==='' || req.body.password===''){
     res.status(400).send('Bad Request')
     return
  }
  else if(checkEmails(req.body.email)){
     res.status(400).send('Bad Request')
     return
  };
  
  users[randomUsername] = {
    id:randomUsername,
    email:req.body.email,
    password:req.body.password
  }
res.cookie('user_id ',randomUsername)
res.redirect('/urls')
});

app.get('/login',(req,res)=>{
  const userId = req.cookies.user_id;
  const userData= users[userId]
  let templateVars = {
    urls: urlDatabase,
    user:userId,
    userData:userData
  }
  res.render('urls_login.ejs',templateVars)
})// cause we need to use header in the page, and header require a user value,so in order to use the header ,we have to give ti the user value,or it will show undefined

app.post('/login',(req,res)=>{
  const userEmail = req.body.email; 
  const user = checkEmails(userEmail); //1) return user object matching with email, 2) return false
  if(!user){
    res.status(403).send('Bad Request')
    return
  } //throw 403 request
  else if (user.password !== req.body.password){
    res.status(403).send('Bad Request')
     return
  } //throw 403 request
  else {
    res.cookie('user_id',user.id); //<< where the problem is
  res.redirect('/urls');
  }
  // if(checkEmails(req.body.email)===false){
    
  // }
  // else if(checkEmails(req.body.email) && checkPassword(req.body.password)===false){
  //   res.status(403).send('Bad Request')
  //    return
  // }
  
})
app.post('/logout',(req,res)=>{
  res.clearCookie('user_id')
  res.redirect('/urls');
})

app.get('/urls/:shortURL',(req,res)=>{
  const userId = req.cookies.user_id;
  const userData= users[userId]
  let templateVars = {
    shortURL: req.params.shortURL,//whatever the client put in shortURL will be stored in req.params.shortURL.server look for the according long url based on the shortURl.
    longURL: urlDatabase[req.params.shortURL],
    user:userId,
    userData:userData
  }
  //console.log(req.cookies.user_id)
  res.render('urls_show.ejs',templateVars)//pass templateVars to ejs,but ejs will just take the object that templateVars stands for. So in ejs, just use the key in the object,not templateVars.
})

app.post('/urls',(req,res)=>{
  //console.log(urlDatabase)
  let randomString = generateRandomString();
  urlDatabase[randomString]={
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  }
  //console.log(urlDatabase)
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

  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect('/urls')
})

//
/**
 * getUserByEmail
 *  return user obj that matches with email
 */
// users:  
//   userRandomID: 
//   { id: 'userRandomID',
//     email: 'user@example.com',
//     password: 'purple-monkey-dinosaur' },
//  user2RandomID: 
//   { id: 'user2RandomID',
//     email: 'user2@example.com',
//     password: 'dishwasher-funk' } }
//   jjjwer:
//   {
//      id: jjjwer
//   }
// }





function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').substring(0,6)
  }

function checkEmails (input){
  for(let element in users){
    if (users[element].email === input){
      return users[element]
    }
  }
  return false
}
// function checkPassword (input){
//   for(let element in users){
//     if (users[element].password === input){
//       return true
//     }
//   }
//   return false
// }

function urlsForUser(id){
  let urlArray = [];
  for(let key in urlDatabase){
    if(urlDatabase[key]['userID']===id){
      urlArray.push(key)
    }
  }
  return urlArray
}










app.listen(PORT,()=>{
  console.log(`Example app listening on port ${PORT}!`)
});


/**
 * 1) url_show
 * 2) after you create a new url, if you click My URL, there is an error
 * 
 */