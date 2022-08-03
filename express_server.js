const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const path = require('path');

app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const makeID = function (numChars) {
  var yourCode = "";
  var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  if(!numChars) {
    numChars = 6;
  }
  for (var i = 0; i < numChars; i++) {
    yourCode += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return yourCode;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});


//
// RENDER the main tiny URL page (list all items)
//
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index.ejs", templateVars);
});

//
// RENDER for a NEW tiny URL entry
//
app.get("/urls/new", (req, res) => {  // NOTE ORDER is important
  res.render("urls_new.ejs");
});

//
// DELETE an existing database entry
//
app.post("/urls/:id/delete", (req, res) => {
  //console.log(req.body.longURL); // Log the POST request body to the console
  console.log();
  console.log("IN DELETE w ID:" + req.params.id);
  delete urlDatabase[req.params.id];
  return res.redirect('/urls/');
  // urlDatabase[newTinyURL] = req.body.longURL;
  // console.log(JSON.stringify(urlDatabase));
  // return res.redirect('/urls/'+newTinyURL);
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

//
// UPDATE an existing database entry
//
app.post("/urls/:id/update", (req, res) => {
  //console.log(req.body.longURL); // Log the POST request body to the console
  console.log();
  console.log("IN EDIT w ID:" + req.params.id);
  urlDatabase[req.params.id] = req.body.longURL
  console.log(req.body.longURL);
  return res.redirect('/urls/');
});

//
// RENDER specific tiny URL page data
//
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }; 
  // <%= urls[id] %>
  res.render("urls_show.ejs", templateVars);
});

//
// CREATE a NEW database Entry
//
app.post("/urls", (req, res) => {
  //console.log(req.body.longURL); // Log the POST request body to the console
  console.log();
  // console.log(makeID(6));
  const newTinyURL = makeID();
  urlDatabase[newTinyURL] = req.body.longURL;
  console.log(JSON.stringify(urlDatabase));
  return res.redirect('/urls/'+newTinyURL);
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

//
// REDIRECT to the longURL
//
app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  const longURL = urlDatabase[id];
  console.log('|' + longURL + '|');
  res.redirect(longURL);
});




