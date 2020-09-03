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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "aJ48lW" },
  "b6UTxQ": { longURL: "https://www.tsn.ca", userId: "18JYyj" }
};

//Global scope for user data
const users = { 
  "aJ48lW": {
    id: "uaJ48lW", 
    email: "admin@amail.com", 
    password: "1234"
  },
  "18JYyj": {
    id: "18JYyj", 
    email: "test@mail.com", 
    password: "test"
  }
};

const userUrls = {};

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
};

const urlsForUser = function(id) {
  for (const short in urlDatabase) {
    if(urlDatabase[short].userId === id) {
      userUrls[short] = urlDatabase[short].longURL;
    }
  }
};

//Home
app.get("/urls", (req,res) => {
  if (req.cookies['user_id']) {
    urlsForUser(req.cookies['user_id']);
    let templateVars = { 
      urls: userUrls,
      user: users[req.cookies["user_id"]]
     };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = {
      user: users[req.cookies["user_id"]]
     };
    res.render("noUser", templateVars);
  }
});

//New url Page
app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id'] === undefined) {
    return res.redirect("/urls");
  }

  let templateVars = { 
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_new", templateVars);
});

//Display shorURL version with long URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: userUrls[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

//Add new url on Home
app.post("/urls", (req, res) => {
  const newShortURL = generatedRandomString();
  const newLongURL = req.body.longURL;
  console.log(userUrls);
  console.log(newShortURL);
  userUrls[newShortURL] = newLongURL;
  let templateVars = { shortURL: newShortURL, longURL: userUrls[newShortURL], user: users[req.cookies["user_id"]] };
  res.redirect(`/urls/${newShortURL}`);
});

//Link to longURL using shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = userUrls[req.params.shortURL];
  res.redirect(longURL);
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete userUrls[shortURL];

  res.redirect('/urls');
})

//Edit long URL
app.post("/urls/:id", (req, res) => {
  const newURL = req.body['newURL'];
  const shortURL = req.params.id;
  userUrls[shortURL] = newURL;
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
  urlsForUser(foundUser.id);
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
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});