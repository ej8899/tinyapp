


//
// REQUIRES & INCLUDES
//
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const path = require('path');

app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));
var cookieParser = require('cookie-parser')


//
// SET and DEFINE GLOBAL VARIABLES
//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const conColorCyan = "\x1b[36m", conColorRed = '\x1b[91m', conColorGreen = '\x1b[92m', 
      conColorGrey = '\x1b[90m', conColorReset = "\x1b[0m", conColorMagenta = `\x1b[95m`,
      conColorOrange = "\u001b[38;5;208m", conColorYellow = '\x1b[93m';
const conColorBright = "\x1b[1m", conColorDim = "\x1b[2m", conColorReverse = "\x1b[7m";

let opsys = process.platform;
if (opsys === "darwin") {
  opsys = "MacOS";
} else if (opsys === "win32" || opsys === "win64") {
  opsys = "Windows";
} else if (opsys === "linux") {
  opsys = "Linux";
}
opsys = conColorBright + conColorOrange + opsys + conColorReset;


//
// SETUP HELPER FUNCTIONS:
//

//
// create some server title ascii art
//
const makeServerTitle = function () {
  let m = conColorMagenta + conColorBright, c = conColorCyan + conColorDim, o = conColorOrange + conColorBright;
  console.log(m)
  console.log(` _    _                  ${c}_                 ${conColorReset}`);
  console.log(`${m}| |_ (_) _ __   _   _   ${c}/_\\   _ __   _ __  ${conColorReset}`);
  console.log(`${m}| __|| || '_ \\ | | | | ${c}//_\\\\ | '_ \\ | '_ \\ ${conColorReset}`);
  console.log(`${m}| |_ | || | | || |_| |${c}/  _  \\| |_) || |_) |${conColorReset}`);
  console.log(` ${m}\\__||_||_| |_| \\__, |${c}\\_/ \\_/| .__/ | .__/ ${conColorReset}`);
  console.log(` ${o}__             ${m}|___/        ${c}|_|    |_|    ${conColorReset}`);
  console.log(`${o}/ \_\\  ___  _ __ __   __ ___  _ __          `);
  console.log(`\\ \\  / _ \\| '__|\\ \\ / // _ \\| '__|         `);
  console.log(`_\\ \\|  __/| |    \\ V /|  __/| |            `);
  console.log(`\\__/ \\___||_|     \\_/  \\___||_|            `);
  console.log(conColorReset);

}

//
// create a random ID -default 6 chars longer, otherwise specify # of chars to create
// return is the random ID
//
const makeID = function (numChars) {
  let yourCode = "";
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  if (!numChars) {
    numChars = 6; // set a default to 6 characters of a random ID
  }
  for (let i = 0; i < numChars; i++) {
    yourCode += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return yourCode;
};


//
// PROGRAM START
//
makeServerTitle();

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`${conColorGreen}TinyApp server is now listening on port ${conColorOrange}${PORT}${conColorGreen}!${conColorReset}`);
  console.log(`${conColorDim}(Don't forget to gently, but firmly press ${conColorGreen}ctrl-c${conColorReset}${conColorDim} when you need to exit the server!)${conColorReset}`);
  console.log(`${conColorDim}Yes, that's even works for you ${opsys} ${conColorDim}users!${conColorReset}\n`);
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
  console.log(`${conColorGreen}It's been ${conColorRed}nuked, ${conColorOrange}deleted, ${conColorYellow}wiped out, ${conColorCyan}obliterated & ${conColorMagenta}eliminated,${conColorGreen} boss!`);
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};  // username: req.cookies["username"]
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
  // console.log(JSON.stringify(urlDatabase));
  console.log(`${conColorMagenta}Hey, happy to have you here, but you do realize this is a ${conColorCyan}WEB${conColorMagenta} app, right?\nYou should be paying attention to your web browser!${conColorReset}`)
  return res.redirect('/urls/'+newTinyURL);
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});


//
// REDIRECT to the longURL
//
app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  const longURL = urlDatabase[id];
  console.log(`${conColorOrange}Don't be gone to ${conColorGreen}${longURL}${conColorOrange} for too long!\nWe'll miss you here on the ${conColorOrange}TinyApp${conColorGreen} Server!`);
  res.redirect(longURL);
});


//
// LOGIN by setting COOKIE username
//
app.post("/login", (req, res) => {
  console.log();
  if(req.body.username) {
    console.log(`${conColorOrange}Well, well, welcome to TinyApp, "${conColorMagenta}${req.body.username}${conColorOrange}"!${conColorReset}`);
  } else {
    console.log(`${conColorYellow}Did you forget who you are?${conColorReset}`);
  }
  res.cookie('username', req.body.username);  // REMEMBER: the .username is the html FORM INPUT NAME!!
  return res.redirect('/urls/');
});



