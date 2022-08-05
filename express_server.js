//
// LHL Project - TinyApp
// https://flex-web.compass.lighthouselabs.ca/workbooks/flex-m03w6/activities/529?journey_step=36&workbook=9
// https://flex-web.compass.lighthouselabs.ca/projects/tiny-app
// 2022-08-03+
//


//
// REQUIRES & INCLUDES
//
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
// const path = require('path');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//
// SET and DEFINE GLOBAL VARIABLES
//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersDatabase = {
  oIVdiS: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const trackingDatabase = {
  tinyurl: "dateClicked",
}

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

let userName = "Default", uid = "";


//
// SETUP HELPER FUNCTIONS:
//

//
// create some server title ascii art
//
const makeServerTitle = function() {
  let m = conColorMagenta + conColorBright, c = conColorCyan + conColorDim, o = conColorOrange + conColorBright;
  console.log(m);
  console.log(` _    _                  ${c}_                 ${conColorReset}`);
  console.log(`${m}| |_ (_) _ __   _   _   ${c}/_\\   _ __   _ __  ${conColorReset}`);
  console.log(`${m}| __|| || '_ \\ | | | | ${c}//_\\\\ | '_ \\ | '_ \\ ${conColorReset}`);
  console.log(`${m}| |_ | || | | || |_| |${c}/  _  \\| |_) || |_) |${conColorReset}`);
  console.log(` ${m}\\__||_||_| |_| \\__, |${c}\\_/ \\_/| .__/ | .__/ ${conColorReset}`);
  console.log(` ${o}__             ${m}|___/        ${c}|_|    |_|    ${conColorReset}`);
  console.log(`${o}/ _\\  ___  _ __ __   __ ___  _ __          `);
  console.log(`\\ \\  / _ \\| '__|\\ \\ / // _ \\| '__|         `);
  console.log(`_\\ \\|  __/| |    \\ V /|  __/| |            `);
  console.log(`\\__/ \\___||_|     \\_/  \\___||_|            `);
  console.log(conColorReset);
};

const cookiesButNoMilk = function() {
  const quotesArray = [
    "C is for cookie that's good enough for me.",
    "Cookies... Om Nom Nom Nom!",
    "I'd give you a cookie, but I ate it.",
    "Me Love to Eat Cookies!",
    "Keep Calm & Eat Cookies",
    "Me not fussy.. just give me cookies.",
    "Me just met you, but you got cookie, so share it maybe?" ];
  let quoteNumber = Math.floor((Math.random() * quotesArray.length - 1) + 1);
  return (quotesArray[quoteNumber]);
};

//
// create a random ID -default 6 chars longer, otherwise specify # of chars to create
// return is the random ID
//
const makeID = function(numChars) {
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
// grab cookie username (or set default)
//
const cookieName = function(req) {
  /*
  userName = req.cookies.username;
  if (!userName) {
    userName = null;
  } else {
    console.log(conColorGreen + cookiesButNoMilk() + conColorReset);
  }*/
  uid = req.cookies.uid;
  if (!uid) {
    // uid = userRandomID;
    uid = "oIVdiS";
  }
  console.log(uid + " says " + conColorGreen + cookiesButNoMilk() + conColorReset);
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
  console.log(`${conColorDim}And yes... that even works for you ${opsys} ${conColorDim}users!${conColorReset}\n`);
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
// RENDER the main tiny URL index page (list all items)
//
app.get("/urls", (req, res) => {
  cookieName(req);
  uidData = usersDatabase[uid];
  console.log("usersDatabase:" + JSON.stringify(uidData) + " for " + uid);
  const templateVars = { urls: urlDatabase, username: userName, user: uidData};
  res.render("urls_index.ejs", templateVars);
});


//
// RENDER for a NEW tiny URL entry page
//
app.get("/urls/new", (req, res) => {  // NOTE ORDER is important
  cookieName(req);
  const templateVars = { urls: urlDatabase, username: userName};
  res.render("urls_new.ejs", templateVars);
});


//
// DELETE an existing database entry
//
app.post("/urls/:id/delete", (req, res) => {
  //console.log(req.body.longURL); // Log the POST request body to the console
  console.log();
  console.log(`${conColorGreen}It's been ${conColorRed}nuked, ${conColorOrange}deleted, ${conColorYellow}wiped out, ${conColorCyan}obliterated & ${conColorMagenta}eliminated,${conColorGreen} boss!\n`);
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
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(req.body.longURL);
  return res.redirect('/urls/');
});


//
// RENDER specific tiny URL page data
//
app.get("/urls/:id", (req, res) => {
  cookieName(req);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: userName};  // username: req.cookies["username"]
  // <%= urls[id] %>
  res.render("urls_show.ejs", templateVars);
});


//
// CREATE a NEW database Entry
//
app.post("/urls", (req, res) => {
  //console.log(req.body.longURL); // Log the POST request body to the console
  console.log();
  const newTinyURL = makeID();
  if (req.body.longURL) {
    urlDatabase[newTinyURL] = req.body.longURL;
    console.log(`${conColorMagenta}Oh look!  New tiny URLs to play with!${conColorReset}`);
    return res.redirect('/urls/' + newTinyURL);
  } else {
    console.log(conColorRed + "Looks like someone forgot something along the way!" + conColorReset);
    return res.redirect('/urls/');
  }
  // console.log(JSON.stringify(urlDatabase));
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});


//
// REDIRECT to the longURL
//
app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  
  if (id !== 'undefined') {
    const longURL = urlDatabase[id];
    console.log(`${conColorOrange}Don't be gone to ${conColorGreen}${longURL}${conColorOrange} for too long!\nWe'll miss you here on the ${conColorOrange}TinyApp${conColorGreen} Server!`);
    res.redirect(longURL);
  } else {
    console.log(`${conColorYellow}That's pretty funny!  Trying to venture off to planet ${conColorRed}undefined${conColorYellow} are you?!?${conColorReset}\n`);
    return res.redirect('/urls/');
  }
});


//
// REDIRECT to the REGISTER page
//
app.get("/register", (req, res) => {
  cookieName(req);
  const templateVars = { urls: urlDatabase, username: userName};
  console.log(`${conColorGreen}Ooh look!  A new friend has arrived!${conColorReset}`)
  res.render("newuser.ejs", templateVars);
});

//
// REDIRECT to the LOGIN page
//
app.get("/login", (req, res) => {
  cookieName(req);
  const templateVars = { urls: urlDatabase, username: userName};
  console.log(`${conColorGreen}get user signed in${conColorReset}`)
  res.render("login.ejs", templateVars);
});

//
// LOGOUT by clearing COOKIE username
//
app.get("/logout", (req, res) => {
  console.log();
  res.clearCookie('username');

  console.log(`${conColorOrange}Sniffle... Sniffle.. and here I thought we were becomming friends.${conColorYellow} :-(${conColorReset}`);
  return res.redirect('/login/');
});

//
// REGISTRATION handler
//
app.post("/register", (req,res) => {
  let uid = makeID();
  // set email, pass and uid into usersDatabase
  let userAccountObject = {
    id: uid,
    email: req.body.email,
    password: req.body.password,
  };
  usersDatabase[uid] = userAccountObject;
  console.log(usersDatabase[uid]); // DEBUG

  // set cookie w this uid
  res.cookie('uid', uid);

  // redirect to urls page
  return res.redirect('/urls/');
});


//
// LOGIN by setting COOKIE username // !TODO - need to process login form info - is password correct? and  account exists?
//
app.post("/login", (req, res) => {
  console.log();

  console.log(req.body.email);

  if (req.body.username) {
    console.log(`${conColorOrange}Well, well, welcome to TinyApp, "${conColorMagenta}${req.body.username}${conColorOrange}"!${conColorReset}`);
  } else {
    console.log(`${conColorYellow}Did you forget who you are?${conColorReset}`);
  }
  res.cookie('username', req.body.username);  // REMEMBER: the .username is the html FORM INPUT NAME!!
  return res.redirect('/urls/');
});


//
// LOGOUT by clearing COOKIE username
//
app.post("/logout", (req, res) => {
  console.log();
  res.clearCookie('username');

  console.log(`${conColorOrange}Sniffle... Sniffle.. and here I thought we were becomming friends.${conColorYellow} :-(${conColorReset}`);
  return res.redirect('/urls/');
});
