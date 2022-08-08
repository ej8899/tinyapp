//
// LHL Project - TinyApp
// https://flex-web.compass.lighthouselabs.ca/workbooks/flex-m03w6/activities/529?journey_step=36&workbook=9
// https://flex-web.compass.lighthouselabs.ca/projects/tiny-app
// 2022-08-03 -> 2022-08-05
//


//
// REQUIRES & INCLUDES
//
const fs = require('fs');
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
// GLOBAL variables necessary to CORE functionality
//

let uid = ""; // for cookie tracking across all functionality

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersDatabase = {
  userRandomID: {
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

// FUTURE USE:
const trackingDatabase = {
  // linkID and clickDate
};


//
// additional global variables
//
const conColorCyan = "\x1b[36m", conColorRed = '\x1b[31m', conColorGreen = '\x1b[92m',
  conColorGrey = '\x1b[90m', conColorReset = "\x1b[0m", conColorMagenta = `\x1b[95m`,
  conColorOrange = "\u001b[38;5;208m", conColorYellow = '\x1b[93m';
const conColorBright = "\x1b[1m", conColorDim = "\x1b[2m", conColorReverse = "\x1b[7m";


//
// SETUP HELPER FUNCTIONS:
//

//
// create server title ascii art
//
const makeServerTitle = function() {
  let m = conColorMagenta + conColorBright, c = conColorCyan + conColorDim, o = conColorOrange + conColorBright;
  const consoleLine = '-'.repeat(43);
  console.log(`\n\n  ${m} _    _                  ${c}_                 ${conColorReset}`);
  console.log(`  ${m}| |_ (_) _ __   _   _   ${c}/_\\   _ __   _ __  ${conColorReset}`);
  console.log(`  ${m}| __|| || '_ \\ | | | | ${c}//_\\\\ | '_ \\ | '_ \\ ${conColorReset}`);
  console.log(`  ${m}| |_ | || | | || |_| |${c}/  _  \\| |_) || |_) |${conColorReset}`);
  console.log(`   ${m}\\__||_||_| |_| \\__, |${c}\\_/ \\_/| .__/ | .__/ ${conColorReset}`);
  console.log(`   ${o}__             ${m}|___/        ${c}|_|    |_|    ${conColorReset}`);
  console.log(`  ${o}/ _\\  ___  _ __ __   __ ___  _ __          `);
  console.log(`  \\ \\  / _ \\| '__|\\ \\ / // _ \\| '__|         `);
  console.log(`  _\\ \\|  __/| |    \\ V /|  __/| |            `);
  console.log(`  \\__/ \\___||_|     \\_/  \\___||_|            `);
  console.log(conColorYellow +  conColorDim + '  ' + consoleLine);
  console.log(conColorReset);
};

//
// random foolishness for the cookies function
//
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
// read operating system we're using and response with sever message accordingly
// not required for CORE functionality, but a learning opportunity
//
const getOpSys = function() {
  let opsys = process.platform;
  if (opsys === "darwin") {
    opsys = "MacOS";
  } else if (opsys === "win32" || opsys === "win64") {
    opsys = "Windows";
  } else if (opsys === "linux") {
    opsys = "Linux";
  }
  opsys = conColorBright + conColorOrange + opsys + conColorReset;
  return opsys;
};

//
// consoleLog() replacement handler for quiet mode
// USAGE: consolelog(input text string, override)
// where if override is TRUE then disregard quiet mode
// returns nothing when done
// - if argv is -logfile, then create a server log file with date stamps
// - if argv is -quiet, then only log if override is TRUE
const consolelog = function(inputText,override) {
  let createFile = "no"; // default to no log file
  for (let x = 0; x < process.argv.length; x ++) {
    if (process.argv[x] === '-quiet' && override !== true) {
      return;
    }
    if (process.argv[x] === '-logfile') {
      createFile = "yes";
    }
  }
  
  if (!inputText) { // no input text is to generate a blank line
    console.log(' ');
    return;
  }
  const IntTwoChars = (i) => { // helper for dateObject
    return (`0${i}`).slice(-2);
  };

  if (createFile === "yes") {
    // !TODO monitor for max log file size and clear it when full
    const dateObject = new Date();
    let date = IntTwoChars(dateObject.getDate());
    let month = IntTwoChars(dateObject.getMonth() + 1);
    let year = dateObject.getFullYear();
    let hours = IntTwoChars(dateObject.getHours());
    let minutes = IntTwoChars(dateObject.getMinutes());
    let seconds = IntTwoChars(dateObject.getSeconds());
    let strippedText = inputText.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''); // clear escape codes
    strippedText = strippedText.replace(/(\r\n|\n|\r)/gm, ""); // clear newlines (we'll use our own for server log)
    const logfileText = '\r\n' + year + '-' + month + '-' + date + ' -' + hours + ':' + minutes + ':' + seconds + ' - ' + strippedText;
    fs.appendFile('tinyapp.log', logfileText, function(err) {
      if (err) throw err;
    });
  }
  console.log(inputText);  // all that above and we'll console.log the log entry
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
// Search our users database by email address for match.  REturn fALSE if no match, or UID if a match
//
const findUserByEmail = function(emailAddy) {
  if (!emailAddy) {
    return false;
  }
  // search via emails
  for (let userSearch in usersDatabase) {
    if (usersDatabase[userSearch].email === emailAddy) {
      consolelog(`Hey, we found ${emailAddy} in the database as user ${userSearch}\n`);
      return userSearch;
    }
  }
  return false;
};

//
// SECURITY function - cookieName (pull cookie info)
// grab cookie uid (or set default)
//
const cookieName = function(req) {
  uid = req.cookies.uid;
  if (!uid) {
    uid = "nobody"; // use "nobody" as a monitoring system for bad logins
    consolelog(`\n$"${conColorGreen}nobody${conColorRed}" is trying to access the system!${conColorReset}\n`);
    return uid;
  }
  consolelog(uid + " says " + conColorGreen + cookiesButNoMilk() + conColorReset);
  return uid;
};

//
// SECURITY function - validateUser
// lookup userID in database and compare password to suppliedPassword
// returns the userID if validated, otherwise return null
//
const validateUser = function(userID, suppliedPassword) {
  if (usersDatabase[userID].password === suppliedPassword) {
    consolelog(`Oh yeah!  They guessed the ${conColorRed}correct password!${conColorReset}`);
    return userID;
  } else {
    consolelog(`OOh.. password didn't match!  ${conColorGreen}Hopefully it's not a hacker at our door!${conColorReset}`);
    return null;
  }
};

//
// !TODO - check for valid (working/responding) URL - (FUTURE)
//
const urlExists = function(theURL) {
  //
  // !TODO - just ping the server and see if we get a response <400 - otherwise fail as a working URL
  //
  return true;
};


/***
 *     _______  _______  _______  ______    _______
 *    |       ||       ||   _   ||    _ |  |       |
 *    |  _____||_     _||  |_|  ||   | ||  |_     _|
 *    | |_____   |   |  |       ||   |_||_   |   |
 *    |_____  |  |   |  |       ||    __  |  |   |
 *     _____| |  |   |  |   _   ||   |  | |  |   |
 *    |_______|  |___|  |__| |__||___|  |_|  |___|
 */
makeServerTitle();


//
// setup the listener
//
app.listen(PORT, () => {
  console.log(`  ${conColorGreen}TinyApp server is now listening on port ${conColorOrange}${PORT}${conColorGreen}!${conColorReset}`);
  if (process.argv[2] === '-quiet') {
    consolelog(`  ${conColorOrange}${conColorDim}(( Server is running in silent mode. ))${conColorReset}`,true);
  }
  consolelog(`  ${conColorDim}(Don't forget to gently, but firmly press ${conColorGreen}ctrl-c${conColorReset}${conColorDim} when you need to exit the server!)${conColorReset}`);
  consolelog(`  ${conColorDim}And yes... that even works for you ${getOpSys()} ${conColorDim}users!${conColorReset}\n`);
  consolelog(`  Oh, and use ${conColorYellow}express_server.js ${conColorMagenta}-quiet${conColorReset} to run the server in silent mode!\n`);
});

//
// deal with any 'root/index' access to the locahost/domain
//
app.get("/", (req, res) => {
  consolelog(`forcing to login page from root level access`);
  res.render("login.ejs");
});

//
// RENDER the main tiny URL index page (list all items)
//
app.get("/urls", (req, res) => {
  cookieName(req);
  let uidData = usersDatabase[uid];
  if (!uidData) {
    // need to login
    res.render("login.ejs", {loginPage: "yes"});
  } else {
    consolelog(uid + ": in the user database is: " + JSON.stringify(uidData));
    const templateVars = { urls: urlDatabase, user: uidData};
    res.render("urls_index.ejs", templateVars);
  }
});

//
// RENDER for a NEW tiny URL entry page
//
app.get("/urls/new", (req, res) => {  // NOTE: ORDER is important for nested /urls/ processing
  if (cookieName(req) === "nobody") {
    return res.status(403).render("login.ejs");
  }
  let uidData = usersDatabase[uid];
  const templateVars = { urls: urlDatabase, user: uidData};
  // IF no UID set then show the login page
  //consolelog(uidData);
  if (uid === "nobody") {
    res.render("login.ejs", {loginPage: "yes"});
  } else {
    res.render("urls_new.ejs", templateVars);
  }
});


//
// DELETE an existing database entry
//
app.post("/urls/:id/delete", (req, res) => {
  if (cookieName(req) === "nobody") {
    return res.status(403).render("login.ejs");
  }
  consolelog(`\n${req.params.id} - ${conColorGreen}It's been ${conColorRed}nuked, ${conColorOrange}deleted, ${conColorYellow}wiped out, ${conColorCyan}obliterated & ${conColorMagenta}eliminated,${conColorGreen} boss!\n`);
  delete urlDatabase[req.params.id];
  return res.redirect('/urls/');
});


//
// UPDATE an existing database entry
//
app.post("/urls/:id/update", (req, res) => {
  //console.log(req.body.longURL); // Log the POST request body to the console
  if (cookieName(req) === "nobody") {
    return res.status(403).render("login.ejs");
  }
  consolelog("\nupdate tiny url:" + req.params.id + " to " + req.body.longURL);
  // !TODO - need to error check req.body.longURL before changing the database!
  urlDatabase[req.params.id] = req.body.longURL;
  return res.redirect('/urls/');
});


//
// RENDER specific tiny URL page data (for review or edit purposes)
//
app.get("/urls/:id", (req, res) => {
  if (cookieName(req) === "nobody") {
    return res.status(403).render("login.ejs");
  }
  let uidData = usersDatabase[uid];

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: uidData};
  // <%= urls[id] %>
  res.render("urls_show.ejs", templateVars);
});


//
// CREATE a NEW database Entry
//
app.post("/urls", (req, res) => {
  if (cookieName(req) === "nobody") {
    return res.status(403).render("login.ejs");
  }
  consolelog();
  const newTinyURL = makeID();
  if (req.body.longURL) {
    // !TODO - need to error check req.body.longURL before changing the database!
    urlDatabase[newTinyURL] = req.body.longURL;
    consolelog(`${conColorMagenta}Oh look!  New tiny URLs to play with!${conColorReset}`);
    return res.redirect('/urls/' + newTinyURL);
  } else {
    consolelog(conColorRed + "Looks like someone forgot something along the way!" + conColorReset);
    return res.redirect('/urls/');
  }
});


//
// REDIRECT to the longURL
//
app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  // !todo - check urls DB for id - if not there, show error
  if (id !== 'undefined') {
    const longURL = urlDatabase[id];
    consolelog(`${conColorOrange}Redirected to ${conColorGreen}${longURL}${conColorReset}`);
    res.redirect(longURL);
  } else {
    consolelog(`${conColorYellow}oops -  ${conColorRed}undefined${conColorYellow} isn't a valid destination${conColorReset}\n`);
    return res.render("url_notfound.ejs");
    // return res.redirect('/urls/');
  }
});


//
// REDIRECT to the REGISTER page
//
app.get("/register", (req, res) => {
  cookieName(req);
  const templateVars = { urls: urlDatabase, loginPage: "yes"};
  consolelog(`${conColorGreen}New user visiting the login page.${conColorReset}`);
  res.render("newuser.ejs", templateVars);
});

//
// REDIRECT to the LOGIN page
//
app.get("/login", (req, res) => {
  cookieName(req);
  const templateVars = { urls: urlDatabase, loginPage: "yes"};
  consolelog(`${conColorGreen}This user needs to get ${conColorCyan}signed in ${conColorGreen} before they can do anything!${conColorReset}`);

  // CLEAR existing cookies
  res.clearCookie('uid');
  res.render("login.ejs", templateVars);
});

//
// LOGOUT by clearing COOKIE uid
//
app.get("/logout", (req, res) => {
  consolelog();
  res.clearCookie('uid');
  consolelog(`${uid}${conColorOrange} Has logged out.${conColorReset}`);
  const templateVars = { loginPage: "yes"};
  return res.render('login.ejs', templateVars);
});

//
// REGISTRATION handler
//
app.post("/register", (req,res) => {
  let uid = makeID();
  // set email, pass and uid into userDatabase 'structure'
  let userAccountObject = {
    id: uid,
    email: req.body.email,
    password: req.body.password,
  };

  //
  // DEBUG - this is for login testing only to 'remind' testers of the passwords
  //
  consolelog(conColorGreen + "\nLet's have a look at that user database, shall we?!? \n" + conColorYellow + JSON.stringify(usersDatabase) + conColorReset + '\n'); // DEBUG

  // CHECK to ensure user entered an email address for account name - boot back to register if not and give message
  if (!req.body.email) {
    consolelog("\nUser forgot to enter their email address!");
    const templateVars = { message: "You forgot to enter your email address!", loginPage: "yes"};
    return res.render('newuser.ejs',templateVars);
  }

  // Does the account already exist?? search via emails!
  let tempUID = findUserByEmail(req.body.email);
  if (tempUID) {
    consolelog("\nUser is already in the user database.\nForgot your password? It's " + usersDatabase[tempUID].password);
    const templateVars = { message: "You're already registered as a user! Sign in instead!", loginPage: "yes"};
    return res.render('login.ejs', templateVars);
  }

  // CHECK to ensure they've supplied a password - boot them back to register page if not & give message
  if (!req.body.password) {
    consolelog("\nUser forgot to enter a password for their account!");
    const templateVars = { message: "You forgot to enter a password for your account!", loginPage: "yes"};
    return res.render('newuser.ejs',templateVars);
  }
  
  // add the user to the usersDatabase
  usersDatabase[uid] = userAccountObject;
  consolelog(usersDatabase[uid] + ' - new user is joining the TinyApp family!'); // DEBUG

  // consider the user logged in at this point - they've created an account successfully.
  // set cookie for current user ID
  res.cookie('uid', uid);
  // redirect to urls page
  return res.redirect('/urls/');
});


//
// LOGIN by setting COOKIE uid
//
app.post("/login", (req, res) => {
  res.clearCookie('uid');
  consolelog();
  if (req.body.email) {
    consolelog(`${conColorMagenta}${req.body.email}${conColorOrange} - welcome to TinyApp!${conColorReset}`);
  } else {
    consolelog(`${conColorYellow}User forgot to enter email on login.${conColorReset}`);
  }

  // check to see if user exists
  let tempUID = findUserByEmail(req.body.email);

  if (tempUID) { // users EXISTS and is password validated:
    // check to see if password is valid
    tempUID = validateUser(tempUID, req.body.password);
    if (!tempUID) {
      consolelog(tempUID + "watch for hack attempts - (wrong password)");
      // jump to LOGIN page & show why failed to user (failed password)
      const templateVars = { message: "Your password is wrong!  Please check & try again!", loginPage: "yes"};
      res.status(403).render("login.ejs", templateVars);
      return;
    }
    // set cookie to uid
    res.cookie('uid',tempUID);
    return res.redirect('/urls/');
  } else {
    consolelog(uid + ": We didn't find you in our user database!");
    // jump to LOGIN page & show why failed to user (failed email address)
    const templateVars = { message: "Your email address wasn't found in our user database!", loginPage: "yes"};
    res.status(403).render("login.ejs", templateVars);
    return;
  }
});


//
// LOGOUT by clearing COOKIE uid
//
app.post("/logout", (req, res) => {
  consolelog();
  res.clearCookie('uid');
  consolelog(`${uid}${conColorOrange}is logged out.${conColorReset}`);
  res.render("login.ejs", { loginPage: "yes"});
});
