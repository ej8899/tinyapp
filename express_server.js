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
  myDateObject,
  findUserByEmail,
  cookiesButNoMilk,
  getOpSys,
  makeServerTitle,
  urlExists,
  tinyTrack,
  clickTrack
} = require('./helpers.js');

const fs = require('fs');                           // file services
const bcrypt = require("bcryptjs");                 // password encryption
const express = require("express");                 // express.js render engine
const cookieSession = require('cookie-session');    // cookies management - encrypted - see cookieName() for details
const methodOverride = require('method-override');  // express method override for CRUD
const app = express();
const PORT = 8080; // default port 8080
// const path = require('path');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));                 // override with POST having ?_method=DELETE
app.use(cookieSession({
  name: 'tinyapp',
  keys: ['this is a secret tinyapp key']
})); // SECURE COOKIES


//
// GLOBAL general variables necessary to CORE functionality
//
let uid = ""; // for cookie tracking across all functionality


//
// GLOBAL DATABASE variables
//

// urlDatabase - this is a working database for logged in users only
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//  MAIN urlDatabase -- assigned with owner ID
const urlDatabaseMain = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca", // sample data
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca", // sample data
    userID: "aJ48lW",
  },
};

const usersDatabase = {
  // test user accounts will not work as we're using encrypted passwords now
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
  // sample data on the sample items
  "9sm5xK": {
    lid: "9sm5xK",
    totalClicks: 53,
  },
  "b2xVn2": {
    lid: "b2xVn2",
    totalClicks: 79,
  },
};

// analytics database: complete click LOG
const clickDatabase = {
  // structure example:
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
// consoleLog() replacement handler
// allows for -quiet mode toggles, -logfile for creating logfiles and DEBUG modes
// USAGE: consolelog(input text string, override, debug)
// where: 
// override is TRUE then disregard quiet mode
// debug is TRUE then allow for DEBUG info logging (debug is a TODO item for final function)
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
  
  let logDate = myDateObject.justDate();
  let logTime = myDateObject.justTime();
  if (createFile === "yes") {
    // NOTE TO CODE REVIEWER:  below line is REQUIRED to remove escape characters before sending to a file!
    // How can I avoid the ESLINT issue?
    let strippedText = inputText.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''); // clear escape codes
    strippedText = strippedText.replace(/(\r\n|\n|\r)/gm, ""); // clear newlines (we'll use our own for server log)
    const logfileText = '\r\n' + logDate + ' - ' + logTime + ' - ' + strippedText;

    const logfileMaxSize = 50000;
    fs.stat('tinyapp.log',(err,stats) => {
      if (err) {
        // TODO implement actual error checking
        // do nothing if error - hopefully just file not exist
      } else {
        if (stats.size > logfileMaxSize) {
          // TODO implement actual error checking
          // delete the log file:
          fs.unlink('tinyapp.log', function(err) {
            if (err) {
              // TODO - implement actual error checking
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
  console.log(conColor.dim + logTime + ' - ' + conColor.reset + inputText);  // all that above and we'll console.log the log entry
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
      consolelog(`"${conColor.green}nobody${conColor.red}" is trying to access the system!${conColor.reset}\n`);
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
// Count userid in inputObject then
// return an object with counts - used for analytics - unique click thrus
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


//
// urlsForUser(id)
// input user id field and read MAIN database and update urlDatabase to be ONLY the id's that match to current user.
//
const urlsForUser = function(id)  {
  if (!id) {
    id = uid;
  }
  consolelog("Building current user database...");

  // delete the existing user URL database
  for (const prop of Object.getOwnPropertyNames(urlDatabase)) {
    delete urlDatabase[prop];
  }

  // rebuild the user URL database with 'owned' tiny URLs
  for (let dbItem in urlDatabaseMain) {
    // match uid to maindb.id.uid - if so, populate urlDatabase
    // dbuid = urlDatabaseMain[db].replace("\"",'');
    if (urlDatabaseMain[dbItem].userID === uid) {
      urlDatabase[dbItem] = urlDatabaseMain[dbItem].longURL;
    }
  }
};

//
// hackCheck(linkID)
// returns true if security check works out, otherwise false if hack attempt
// pass main database tinyURL link id, pull user from record & compare to logged in user.
//
const hackCheck = function(linkID) {
  consolelog(`running hack check on link ${linkID} and user ${uid}`);
  if (uid === urlDatabaseMain[linkID].userID) {
    return true;
  } else {
    consolelog(`HACK ATTEMPT - user ${uid} tried to modify tiny URL owned by ${urlDatabaseMain[linkID].userID}`);
    return false;
  }
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
  consolelog(`domain root level access requested -- forcing to login page`);
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
    urlsForUser(uidData);                                       // assemble tiny URLS for this user
    if (Object.keys(urlDatabase).length === 0) {               // user has no TINY urls, jump them to CREATE page
      const templateVars = { urls: urlDatabase, user: uidData, message: "Get started by creating your very first Tiny URL!"};
      res.render("urls_new.ejs", templateVars);
    } else {
      const templateVars = { urls: urlDatabase, user: uidData, tracking: trackingDatabase};
      res.render("urls_index.ejs", templateVars);
    }
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
  if (uid === "nobody") {
    res.render("login.ejs", {loginPage: "yes"});
  } else {
    res.render("urls_new.ejs", templateVars);
  }
});


//
// DELETE an existing database entry
//
//app.post("/urls/:id/delete", (req, res) => {
app.delete("/urls/:id/delete", (req, res) => {
  if (cookieName(req) === "nobody") {
    return res.status(403).render("login.ejs");
  }
  if (hackCheck(req.params.id)) {
    consolelog(`${req.params.id} - ${conColor.green}It's been ${conColor.red}nuked, ${conColor.orange}deleted, ${conColor.yellow}wiped out, ${conColor.cyan}obliterated & ${conColor.magenta}eliminated,${conColor.green} boss!\n`);
    delete urlDatabaseMain[req.params.id];
  }
  return res.redirect('/urls/');
});


//
// UPDATE an existing database entry
//
// app.post("/urls/:id/update", (req, res) => {
app.put("/urls/:id/update", (req, res) => {
  if (cookieName(req) === "nobody") {
    return res.status(403).render("login.ejs");
  }

  consolelog("updating tiny url:" + req.params.id + " to " + req.body.longURL);

  // TODO - need to error check req.body.longURL before changing the database (is a valid/working URL?)
  if (urlExists(req.body.longURL) === false) {
    return res.redirect('/urls/');
  }
  
  if (hackCheck(req.params.id)) {
    urlDatabaseMain[req.params.id].longURL = req.body.longURL;
  }
  return res.redirect('/urls/');
});


//
// RENDER specific tiny URL page data (for review analytics or edit purposes)
//
app.get("/urls/:id", (req, res) => {
  if (cookieName(req) === "nobody") {
    return res.status(403).render("login.ejs");
  }
  if (hackCheck(req.params.id) === false) {
    // let's leave - this isn't the owner of this url
    return res.redirect('/urls/');
  }

  let uidData = usersDatabase[uid];
  // grab click through total count from trackingDatabase
  const totalCount = tinyTrack(trackingDatabase,req.params.id,"get");
  
  // need to parse our clickDatabase and rebuild for this tinyURL id ONLY
  let tempClicksDatabase = {};
  let templateClicks = {};
  let theusertype = '', graphArray = [], graphStats = {};

  
  for (let item in clickDatabase) {                         // loop thru click database
    if (clickDatabase[item].lid === req.params.id) {        // filter matching tiny url items
      if (clickDatabase[item].uid.length === 6) {           // is the user registered or not
        theusertype = '\u0020\u0020(Registered user)';
      } else {
        theusertype = '(Unregistered user)';
      }
      templateClicks = {                                    // build temp database of clicks for this tiny url id
        uid: clickDatabase[item].uid,
        dateStamp: clickDatabase[item].dateStamp,
        userType: theusertype,
      };
      tempClicksDatabase[makeID(8)] = templateClicks;

      // ASSEMBLE GRAPH DATA:
      let theHour = myDateObject.hours(clickDatabase[item].dateStamp);
      if (!graphStats[theHour]) {
        graphStats[theHour] = 1;
      } else {
        graphStats[theHour] += 1;
      }
    }
  }
  let moreStats = countUIDS(tempClicksDatabase);          // count unique clicks
  let clickUniques = Object.keys(moreStats).length;

  // CONVERT GRAPH DATA for client side JS graph generator:
  let newgraphObj = {}, fixeditem = '';
  for (let item in graphStats) {
    fixeditem = item.slice(-5);
    newgraphObj[fixeditem] = graphStats[item];
    graphArray.push(newgraphObj);
  }
  
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: uidData, totalCount, logs:tempClicksDatabase, uniques:clickUniques, moreStats:moreStats, graphStats:graphStats};
  res.render("urls_show.ejs", templateVars);
});


//
// CREATE a NEW tiny URL database Entry
//
app.post("/urls", (req, res) => {
  if (cookieName(req) === "nobody") {
    return res.status(403).render("login.ejs");
  }
  consolelog();
  const newTinyURL = makeID();
  if (req.body.longURL) {
    // TODO - need to error check req.body.longURL before changing the database!
    urlDatabase[newTinyURL] = req.body.longURL; // DEPRECATED
    let dbRecord = {
      longURL: req.body.longURL,
      userID: uid,
    };
    urlDatabaseMain[newTinyURL] = dbRecord;

    tinyTrack(trackingDatabase,newTinyURL,"addnew");
    
    consolelog(`${conColor.magenta}New tiny URLs to play with! ${newTinyURL}${conColor.reset}`);
    return res.redirect('/urls/' + newTinyURL);
  } else {
    consolelog(conColor.red + "User forgot data in new URL page.  Resetting!" + conColor.reset);
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
    const longURL = urlDatabaseMain[id].longURL;
    consolelog(`${conColor.orange}Redirected to ${conColor.green}${longURL}${conColor.reset}`);
    tinyTrack(trackingDatabase,id,'inc'); // increase total click count on this tiny URL

    let tempuid;
    if (uid === "" || uid === "nobody") {
      tempuid = makeID(8);                // create a temp user ID for even unregistered users
      cookieName(req,"set",tempuid);      // set a cookie for unregistered users too!
    } else {
      tempuid = uid;
    }
    clickTrack(clickDatabase, id, tempuid, 'add');
    res.redirect(longURL);
  } else {
    consolelog(`${conColor.yellow}oops -  ${conColor.red}undefined${conColor.yellow} isn't a valid destination${conColor.reset}\n`);
    return res.status(404).render("url_notfound.ejs");
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
    password: hashedPassword,
  };


  // CHECK to ensure user entered an email address for account name - boot back to register if not and give message
  if (!req.body.email) {
    consolelog("\nUser forgot to enter their email address!");
    const templateVars = { message: "You forgot to enter your email address!", loginPage: "yes"};
    return res.render('newuser.ejs',templateVars);
  }

  // Does the account already exist?? search via emails!
  let tempUID = findUserByEmail(req.body.email,usersDatabase);
  if (tempUID) {
    consolelog("User is already in the user database.  Maybe forgot password?");
    const templateVars = { message: "You're already registered as a user! Sign in instead!", loginPage: "yes"};
    return res.render('login.ejs', templateVars);
  }

  // CHECK to ensure user supplied a password - boot them back to register page if not & give message
  if (!req.body.password) {
    consolelog("\nUser forgot to enter a password for their account!");
    const templateVars = { message: "You forgot to enter a password for your account!", loginPage: "yes"};
    return res.render('newuser.ejs',templateVars);
  }
  
  // add the user to the usersDatabase
  usersDatabase[uid] = userAccountObject;
  consolelog(usersDatabase[uid].email + ' - new user is joining the TinyApp family!'); // DEBUG

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
