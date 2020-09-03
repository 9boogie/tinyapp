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

const emailCheck = function(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

//Home
app.get("/urls", (req,res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_index", templateVars);
});

//Route to new adding page
app.get("/urls/new", (req, res) => {
  let templateVars = { 
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_new", templateVars);
});

//Display shorURL version with long URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

//Add new url on Home
app.post("/urls", (req, res) => {
  const newShortURL = generatedRandomString();
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = newLongURL;
  let templateVars = { shortURL: newShortURL, longURL: urlDatabase[newShortURL], user: users[req.cookies["user_id"]] };
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

//Login Process
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const foundUser = emailCheck(email);
  if (!email || !password) {
    return res.status(403).send('email and password cannot be blank');
  }

  if (foundUser === null) {
    return res.status(403).send('no user with that email found');
  }

  if (foundUser.password !== password) {
    return res.status(403).send("Incorrect password!");
  }

  res.cookie("user_id",foundUser.id);
  res.redirect('/urls');
});

//Logout Process
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

//Login page
app.get("/login", (req, res) => {
  let templateVars = { 
    user: users[req.cookies["user_id"]]
   };
  res.render('login', templateVars);
});

//register page
app.get("/register", (req, res) => {
  let templateVars = { 
    user: users[req.cookies["user_id"]]
   };
  res.render('register', templateVars);
});

//Register user information
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email & password can't be null");
  }

  if (emailCheck(email)) {
    return res.status(400).send("This email is already registered!");
  }
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
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});