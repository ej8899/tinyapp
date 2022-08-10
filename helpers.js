//
//  LHL - TinyApp! - helpers.js
//  add helper functions for express_server.js
//

const { request, application } = require("express");

//
// additional global variables
//
const conColorCyan = "\x1b[36m", conColorRed = '\x1b[31m', conColorGreen = '\x1b[92m',
  conColorGrey = '\x1b[90m', conColorReset = "\x1b[0m", conColorMagenta = `\x1b[95m`,
  conColorOrange = "\u001b[38;5;208m", conColorYellow = '\x1b[93m';
const conColorBright = "\x1b[1m", conColorDim = "\x1b[2m", conColorReverse = "\x1b[7m";


//
// Search our users database by email address for match.  REturn fALSE if no match, or UID if a match
//
const findUserByEmail = function(emailAddy,database) {
  if (!emailAddy) {
    return false;
  }
  // search via emails
  for (let userSearch in database) {
    if (database[userSearch].email === emailAddy) {
      // console.log(`Hey, we found ${emailAddy} in the database as user ${userSearch}\n`);
      return userSearch;
    }
  }
  return false;
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
// urlExists(theURL)
// check supplied URL to see if it actually exists (response of < 400)
// return true if yes and ok, false if error code of 400 or >
//
const urlExists = function(theURL,callback) {
/* - ARGH - sync vs async headaches
  const request = require('request');
  let myerror = 'empty';
  request.get(theURL, (error, response, body) => {
    if (error) {
      myerror = false;
    } else {
      myerror = true;
    }
    return callback(myerror);
  });
//  return callback(myerror);
*/
};

console.log(urlExists("http://www.google.com",(error, result) => {
  return result;
}));


//
// tinyTrack() -- use for tiny URL link tracking -- all operations done within
// dbOperation is:
//  addnew  - create a new tracking database entry with tinyid in db (database)
//  delete  - delete this item from the db (tinyid)
//  inc     - increase totalClicks with tinyid
//  get     - pull the data and RETURN the count//
const tinyTrack = function(db,tinyid,dbOperation) {

  // force an 'addnew' to tracking db if it doesn't exist and that's not already why we're here
  if (dbOperation !== 'addnew') {
    if (!db[tinyid]) {
      tinyTrack(db,tinyid,'addnew');
    }
  }

  // INCREASE total clicks counter in db
  if (dbOperation === 'inc') {
    db[tinyid].totalClicks = db[tinyid].totalClicks + 1;
  }

  // GET total and return it
  if (dbOperation === 'get') {
    return (db[tinyid].totalClicks);
  }

  // ADD NEW tracking db entry
  if (dbOperation === 'addnew') {
    // initialize tracking database with new tiny URL info
    let trackingTemplate = {
      lid: tinyid,
      totalClicks: 0,
    };
    db[tinyid] = trackingTemplate;
  }
  console.log("TRACKING DB ENTRY: " + JSON.stringify(db));
};


module.exports = {
  findUserByEmail,
  cookiesButNoMilk,
  getOpSys,
  makeServerTitle,
  urlExists,
  tinyTrack
};