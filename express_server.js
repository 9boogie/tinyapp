// npm install express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
// npm install body-parser (For POST route)
const bodyParser = require("body-parser");
// npm install cookie-parser
const cookieParser = require('cookie-parser');


app.use(bodyParser.urlencoded({extended: true}));
// npm install --save-dev nodemon ("start": "./node_modules/.bin/nodemon -L express_server.js" to make npm start)
app.use(cookieParser());
//npm install ejs (Call the ejs)
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Global scope for user data
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "admin@example.com", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "test@example.com", 
    password: "test"
  }
}

// Function for generate 6 digits of random characters and
const generatedRandomString = function() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += letters[(Math.floor(Math.random() * letters.length))];
  }
  return result;
};

//Home
app.get("/urls", (req,res) => {
  /*
  if(req.cookies){
    console.log(req.cookies["username"]);
  } else{
    console.log("the cookie was not there");
  }*/
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_index", templateVars);
});

//Route to new adding page
app.get("/urls/new", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"]
   };
  res.render("urls_new", templateVars);
});

//Display shorURL version with long URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

//Add new url on Home
app.post("/urls", (req, res) => {
  const newShortURL = generatedRandomString();
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = newLongURL;
  let templateVars = { shortURL: newShortURL, longURL: urlDatabase[newShortURL], username: req.cookies["username"] };
  res.redirect(`/urls/${newShortURL}`);
});

//Link to longURL using shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect('/urls');
})

//Edit long URL
app.post("/urls/:id", (req, res) => {
  const newURL = req.body['newURL'];
  const shortURL = req.params.id;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
})

//Route for login
app.post("/login", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id].email;
  //need to write a cookie (key, value)
  res.cookie("username",user);
  res.redirect('/urls');
})

//Route for logout
app.post("/logout", (req, res) => {
  //const username = req.cookies["username"]
  res.clearCookie("user_id");
  res.redirect('/urls');
})

//register page
app.get("/register", (req, res) => {
  res.render('register');
})

//Register user information
app.post("/register", (req, res) => {
  const newID = generatedRandomString();
  const newUser = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  };

  users[newID] = newUser;
  res.cookie("user_id", newID);
  console.log(users);

  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});