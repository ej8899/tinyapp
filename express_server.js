//
// LHL Project - TinyApp
// https://flex-web.compass.lighthouselabs.ca/workbooks/flex-m03w6/activities/529?journey_step=36&workbook=9
// https://flex-web.compass.lighthouselabs.ca/projects/tiny-app
// 2022-08-03 -> 2022-08-05
//


//
// REQUIRES & INCLUDES
//
const { conColor,
  findUserByEmail,
  cookiesButNoMilk,
  getOpSys,
  makeServerTitle,
  urlExists,
  tinyTrack,
  clickTrack
} = require('./helpers.js');

const fs = require('fs');                         // file services
const bcrypt = require("bcryptjs");               // encryption
const express = require("express");               // express.js render engine
const cookieSession = require('cookie-session');  // cookies management - secure - see cookieName() for details

const app = express();
const PORT = 8080; // default port 8080
// const path = require('path');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'tinyapp',
  keys: ['this is a secret tinyapp key']
})); // SECURE COOKIES



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

// analytics database: individual linkID and totalClicks
const trackingDatabase = {
  // linkID and clickDate
  // linkID:,
  "9sm5xK": {
    lid: "9sm5xK",
    totalClicks: 53,
  },
  "b2xVn2": {
    lid: "b2xVn2",
    totalClicks: 79,
  },
};

// analytics database: click LOG
const clickDatabase = {
  // dateStamp: {
  //   lid: 12345,
  //   uid: 23456,
  //   dateStamp: 12345,
  // }
};



//
// SETUP ADDITIONAL HELPER FUNCTIONS:
//  also see helpers.js for more
//


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
  // helper for date function to 0 pad
  const IntTwoChars = (i) => {
    return (`0${i}`).slice(-2);
  };

  if (createFile === "yes") {
    const dateObject = new Date();
    let date = IntTwoChars(dateObject.getDate());
    let month = IntTwoChars(dateObject.getMonth() + 1);
    let year = dateObject.getFullYear();
    let hours = IntTwoChars(dateObject.getHours());
    let minutes = IntTwoChars(dateObject.getMinutes());
    let seconds = IntTwoChars(dateObject.getSeconds());
    let strippedText = inputText.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''); // clear escape codes
    strippedText = strippedText.replace(/(\r\n|\n|\r)/gm, ""); // clear newlines (we'll use our own for server log)
    const logfileText = '\r\n' + year + '-' + month + '-' + date + ' - ' + hours + ':' + minutes + ':' + seconds + ' - ' + strippedText;
    const logfileMaxSize = 50000;
    fs.stat('tinyapp.log',(err,stats) => {
      if (err) { 
        // do nothing if error - hopefully just file not exist
      } else {
        if (stats.size > logfileMaxSize) {
          // console.error(err)
          // delete the log file
          fs.unlink('tinyapp.log', function(err) {
            if (err) {
              // console.error(err);
              // do nothing - hopefully just file not exist
            } else {
              console.log("File removed:", 'tinyapp.log');
            }
          });
        }
      }
    });
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
// COOKIE function - cookieName (req, operation, cookieData);
// USAGE: operation is clear, set, read
//        cookieData is the data to set in cookie
//        req is express.js request object
// return is NULL for set or clear, or uid (user id) - a uid of "nobody" may be returned in some failed authentication situations
//
/* SETUP WITH:
const cookieSession = require('cookie-session');  // cookies management - secure
app.use(cookieSession({
  name: 'tinyapp',
  keys: ['this is a secret tinyapp key']
})); // SECURE COOKIES
reference: https://github.com/expressjs/cookie-session
*/
const cookieName = function(req,operation,cookieData) {
  // DELETE any set cookies
  if (operation === 'clear') {
    req.session = null;
    return;
  }

  // SET any cookie info
  if (operation === 'set' && cookieData) {
    req.session.euid = cookieData;
    consolelog(`nom nom nom... we've got NEW cookies`);
    return;
  }

  // READ any cookies - also DEFAULT operation if not set
  if (operation === 'read' || !operation) {
    uid = req.session.euid; // this is via SECURE COOKIES
    if (!uid) {
      uid = "nobody"; // use "nobody" as a monitoring system for bad logins
      consolelog(`\n$"${conColor.green}nobody${conColor.red}" is trying to access the system!${conColor.reset}\n`);
      return uid;
    }
    consolelog(uid + " says " + conColor.green + cookiesButNoMilk() + conColor.reset);
    return uid;
  }
  consolelog("BAD cookie data in cookieName()");
};

//
// SECURITY function - validateUser
// lookup userID in database and compare password to suppliedPassword
// returns the userID if validated, otherwise return null
//
const validateUser = function(userID, suppliedPassword) {
  // if (usersDatabase[userID].password === suppliedPassword) { // old w/o bcrypt
  if (bcrypt.compareSync(suppliedPassword,usersDatabase[userID].password)) { // bcrypt.compareSync returns true or false
    consolelog(userID + ` entered ${conColor.red}correct password!${conColor.reset}`);
    return userID;
  } else {
    consolelog(userID + ` Password didn't match!  ${conColor.green}Hopefully it's not a hacker at our door!${conColor.reset}`);
    return null;
  }
};

//
//  check userDatabase for userID - return TRUE if found, FALSE if not
//
const isActualUser = function(userID) {
  for (let users in usersDatabase) {
    if (usersDatabase[users]["id"] === userID) {
      return true;
    }
  }
  return false;
};

//
//
//
const countUIDS = function(inputObject) {
  let returnObject = {}, tempObject = {};

  for (let item in inputObject) {
    let tuid = inputObject[item].uid;
    if (!returnObject[tuid]) { // if it's new, start count at 1
      tempObject = {
        count: 1,
      };
      returnObject[tuid] = tempObject;
    } else {
      returnObject[tuid].count += 1; // inc the count since it exists already
    }
  }
  return (returnObject);
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
  console.log(`  ${conColor.green}TinyApp server is now listening on port ${conColor.orange}${PORT}${conColor.green}!${conColor.reset}`);
  if (process.argv[2] === '-quiet') {
    consolelog(`  ${conColor.orange}${conColor.dim}(( Server is running in silent mode. ))${conColor.reset}`,true);
  }
  consolelog(`  ${conColor.dim}(Don't forget to gently, but firmly press ${conColor.green}ctrl-c${conColor.reset}${conColor.dim} when you need to exit the server!)${conColor.reset}`);
  consolelog(`  ${conColor.dim}And yes... that even works for you ${getOpSys()} ${conColor.dim}users!${conColor.reset}\n`);
  consolelog(`  Oh, and use ${conColor.yellow}express_server.js ${conColor.magenta}-quiet${conColor.reset} to run the server in silent mode!\n`);
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
    const templateVars = { urls: urlDatabase, user: uidData, tracking: trackingDatabase};
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
  consolelog(`\n${req.params.id} - ${conColor.green}It's been ${conColor.red}nuked, ${conColor.orange}deleted, ${conColor.yellow}wiped out, ${conColor.cyan}obliterated & ${conColor.magenta}eliminated,${conColor.green} boss!\n`);
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
  const totalCount = tinyTrack(trackingDatabase,req.params.id,"get");
  
  // need to parse our clickDatabase and rebuild for this tinyURL id ONLY
  let tempClicksDatabase = {};
  let templateClicks = {};
  let theusertype = '', graphArray = [], graphDataItem = {}, graphStats = {};

  for (let item in clickDatabase) {                       // loop thru click database
    if (clickDatabase[item].lid === req.params.id) {      // filter matching tiny url items
      if (clickDatabase[item].uid.length === 6) {          // is the user registered or not
        theusertype = '\u0020\u0020(Registered user)';
      } else {
        theusertype = '(Unregistered user)';
      }
      templateClicks = {                                  // build temp database of clicks for this tiny url id
        uid: clickDatabase[item].uid,
        dateStamp: clickDatabase[item].dateStamp,
        userType: theusertype,
      };
      tempClicksDatabase[makeID(8)] = templateClicks;

      // ASSEMBLE GRAPH DATA:
      let clickDate = new Date(clickDatabase[item].dateStamp);
      let theHour = clickDate.getHours();
      let thehourString = (`0${theHour}`).slice(-2);
      if (!graphStats[thehourString]) {
        graphStats[thehourString] = 1;
      } else {
        graphStats[thehourString] += 1;
      }
      //console.log("FULLDATE:",clickDatabase[])
      //console.log("HOUR INT:",theHour);
      //console.log("HOUR STRING:", thehourString);
      console.log("GRAPH STATS: ",graphStats);
    }
  }
  let moreStats = countUIDS(tempClicksDatabase);
  let clickUniques = Object.keys(moreStats).length;

  // CONVERT GRAPH DATA:
  let newgraphObj = {};
  for (let item in graphStats) {
    console.log("GRAPHSTATS.item",graphStats[item]); // thisis the count
    console.log("ITEM:",item);
    newgraphObj[item] = graphStats[item];

    graphArray.push(newgraphObj);
  }
  
  console.log("GRAPH ARRAY:",graphArray);

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: uidData, totalCount, logs:tempClicksDatabase, uniques:clickUniques, moreStats:moreStats, graphStats:graphStats};
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

    tinyTrack(trackingDatabase,newTinyURL,"addnew");
    
    consolelog(`${conColor.magenta}Oh look!  New tiny URLs to play with!${conColor.reset}`);
    return res.redirect('/urls/' + newTinyURL);
  } else {
    consolelog(conColor.red + "Looks like someone forgot something along the way!" + conColor.reset);
    return res.redirect('/urls/');
  }
});


//
// REDIRECT to the longURL
//
app.get("/u/:id", (req, res) => {
  cookieName(req);

  let id = req.params.id;
  if (id !== 'undefined') {
    const longURL = urlDatabase[id];
    consolelog(`${conColor.orange}Redirected to ${conColor.green}${longURL}${conColor.reset}`);
    tinyTrack(trackingDatabase,id,'inc'); // increase total click count on this tiny URL

    let tempuid;
    if (uid === "" || uid === "nobody") {
      tempuid = makeID(8);
      cookieName(req,"set",tempuid); // set a cookie for unregistered users too!
    } else {
      tempuid = uid;
    }
    clickTrack(clickDatabase, id, tempuid, 'add');  // !TODO - change makeID(18) to ACTUAL user id if exists
    res.redirect(longURL);
  } else {
    consolelog(`${conColor.yellow}oops -  ${conColor.red}undefined${conColor.yellow} isn't a valid destination${conColor.reset}\n`);
    return res.status(404).render("url_notfound.ejs");
    // return res.redirect('/urls/');
  }
});


//
// REDIRECT to the REGISTER page
//
app.get("/register", (req, res) => {
  if (isActualUser(cookieName(req))) { // uid is set if cookie set, but lets ensure uid is correct to our DB
    consolelog("ACTIVE user found register page, we'll just jump to main page instead!");
    return res.redirect('/urls/');
  }
  const templateVars = { urls: urlDatabase, loginPage: "yes"};
  consolelog(`${conColor.green}New user visiting the login page.${conColor.reset}`);
  res.render("newuser.ejs", templateVars);
});

//
// REDIRECT to the LOGIN page
//
app.get("/login", (req, res) => {
  if (isActualUser(cookieName(req))) { // uid is set if cookie set, but lets ensure uid is correct to our DB
    consolelog(`ACTIVE user found login page, we'll jump to main page instead!`);
    return res.redirect('/urls/');
  }
  const templateVars = { urls: urlDatabase, loginPage: "yes"};
  consolelog(`${conColor.green}This user needs to get ${conColor.cyan}signed in ${conColor.green} before they can do anything!${conColor.reset}`);

  cookieName(req,"clear");
  res.render("login.ejs", templateVars);
});

//
// LOGOUT by clearing COOKIE uid
//
app.get("/logout", (req, res) => {
  consolelog();
  cookieName(req,"clear");
  consolelog(`${uid}${conColor.orange} Has logged out.${conColor.reset}`);
  const templateVars = { loginPage: "yes"};
  return res.render('login.ejs', templateVars);
});

//
// REGISTRATION handler
//
app.post("/register", (req,res) => {
  let uid = makeID();
  // set email, pass and uid into userDatabase 'structure'
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  let userAccountObject = {
    id: uid,
    email: req.body.email,
    // password: req.body.password,
    password: hashedPassword,
  };

  //
  // DEBUG - this is for login testing only to 'remind' testers of the passwords
  //
  consolelog(conColor.green + "\nLet's have a look at that user database, shall we?!? \n" + conColor.yellow + JSON.stringify(usersDatabase) + conColor.reset + '\n'); // DEBUG

  // CHECK to ensure user entered an email address for account name - boot back to register if not and give message
  if (!req.body.email) {
    consolelog("\nUser forgot to enter their email address!");
    const templateVars = { message: "You forgot to enter your email address!", loginPage: "yes"};
    return res.render('newuser.ejs',templateVars);
  }

  // Does the account already exist?? search via emails!
  let tempUID = findUserByEmail(req.body.email,usersDatabase);
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
  cookieName(req,"set",uid);
  // redirect to urls page
  return res.redirect('/urls/');
});


//
// LOGIN by setting COOKIE uid
//
app.post("/login", (req, res) => {
  cookieName(req,"set","");
  consolelog();
  if (req.body.email) {
    consolelog(`${conColor.magenta}${req.body.email}${conColor.orange} - welcome to TinyApp!${conColor.reset}`);
  } else {
    consolelog(`${conColor.yellow}User forgot to enter email on login.${conColor.reset}`);
  }

  // check to see if user exists
  let tempUID = findUserByEmail(req.body.email,usersDatabase);

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
    // successfully logged in:
    cookieName(req,"set",tempUID);

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
  cookieName(res,"clear");
  //cookieName(req,"set","");
  consolelog(`${uid}${conColor.orange}is logged out.${conColor.reset}`);
  res.render("login.ejs", { loginPage: "yes"});
});


/*
module.exports = {
  clickDatabase
};
*/