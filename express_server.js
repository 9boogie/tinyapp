// npm install express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
// npm install body-parser (For POST route)
const bodyParser = require("body-parser");
// npm install cookie-parser (replaced by cookie session)
//const cookieParser = require('cookie-parser');
// npm install -E bcrypt@2.0.0
const bcrypt = require('bcrypt');
// npm install cookie-session
const cookieSession = require('cookie-session');
//helper function
const { getUserByEmail } = require('./helpers');


app.use(bodyParser.urlencoded({extended: true}));
// npm install --save-dev nodemon ("start": "./node_modules/.bin/nodemon -L express_server.js" to make npm start)
//app.use(cookieParser());
//npm install ejs (Call the ejs)
app.set("view engine", "ejs");
// use of cookie session
app.use(cookieSession({
  name: 'session',
  keys: ['key1', "key2"]
}));

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "aJ48lW" },
  "b6UTxQ": { longURL: "https://www.tsn.ca", userId: "18JYyj" }
};

//Global scope for user data
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "admin@amail.com",
    password: "1234"
  },
  "18JYyj": {
    id: "18JYyj",
    email: "test@mail.com",
    password: "test"
  }
};

// Function for generate 6 digits of random characters and
const generatedRandomString = function() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += letters[(Math.floor(Math.random() * letters.length))];
  }
  return result;
};

const urlsForUser = function(id) {
  const result = {};
  for (const short in urlDatabase) {
    if (urlDatabase[short].userId === id) {
      result[short] = urlDatabase[short].longURL;
    }
  }
  return users[id]['userUrls'] = result;
};

const loginCheck = function(id) {
  for (const userId in users) {
    const user = users[userId];
    if (user.id === id) {
      return true;
    }
  }
  return false;
};

//Home
app.get("/urls", (req,res) => {
  const userId = req.session.user_id;
  if (loginCheck(userId)) {
    urlsForUser(userId);
    const userUrls = users[userId]['userUrls'];
    let templateVars = {
      urls: userUrls,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("noUser", templateVars);
  }
});

//New url Page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (loginCheck(userId)) {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("noUser", templateVars);
  }
});

//Display shorURL version with long URL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shorURL = req.params.shortURL;
  console.log('test',userId);
  if (!loginCheck(userId)) {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("noUser", templateVars);
  } else if (urlDatabase[shorURL] && urlDatabase[shorURL].userId === userId) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("noShortURL", templateVars);
  }
});

//Add new url on Home
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const newShortURL = generatedRandomString();
  const newLongURL = req.body.longURL;
  const userUrls = users[userId]['userUrls'];
  urlDatabase[newShortURL] = { longURL: newLongURL, userId: userId};
  //let templateVars = { shortURL: newShortURL, longURL: userUrls[newShortURL], user: users[req.session.user_id] };
  res.redirect(`/urls/${newShortURL}`);
});

//Link to longURL using shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  if (loginCheck(userId)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
  }
  res.redirect('/urls');
});

//Edit long URL
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const newURL = req.body['newURL'];
  const shortURL = req.params.id;
  urlDatabase[shortURL] = { longURL: newURL, userId: userId};
  res.redirect('/urls');
});

//Login Process
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const foundUser = getUserByEmail(email, users);
  if (!email || !password) {
    return res.status(403).send('email and password cannot be blank');
  }

  if (foundUser === undefined) {
    return res.status(403).send('no user with that email found');
  }

  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("Incorrect password!");
  }
  req.session.user_id = foundUser.id;
  urlsForUser(foundUser.id);
  res.redirect('/urls');
});

//Logout Process
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//Login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('login', templateVars);
});

//register page
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('register', templateVars);
});

//Register user information
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 2);
  if (!email || !password) {
    return res.status(400).send("Email & password can't be null");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("This email is already registered!");
  }
  const newID = generatedRandomString();
  const newUser = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  };
  users[newID] = newUser;
  req.session.user_id = newID;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});