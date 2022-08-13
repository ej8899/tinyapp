//
//  LHL - TinyApp! - helpers.js
//  add helper functions for express_server.js
//

const { request, application } = require("express");


//
// additional global variables
//

//
// Global Variable Color List
// Colors object from https://github.com/ej8899/conColors
//
const conColor = { 
  cyan    : "\x1b[36m",
  red     : '\x1b[31m',
  green   : '\x1b[92m',
  green1  : '\x1b[32m',
  grey    : '\x1b[90m',
  reset   : "\x1b[0m",
  magenta : `\x1b[95m`,
  orange  : "\u001b[38;5;208m",
  yellow  : '\x1b[93m',
  blue    : '\x1b[34m',
  black   : '\x1b[30m',
  purple  : '\x1b[35m',
  brown   : '\x1b[33m',
  bright  : "\x1b[1m",
  dim     : "\x1b[2m",
  italics : "\x1b[3m",
  reverse : "\x1b[7m",
};

//
// myDateObject - date object to provide quick access to formatted date and times
// v1.0 2022-08-11
// grab the latest version of myDateObject here: https://github.com/ej8899/conColors
//
const myDateObject = {
  // return "right now" if nothing supplied, otherwise return object of supplied date info
  dateObject(aDate) { return (aDate ? new Date(aDate) : new Date()); },

  // padding of single digits to double digits
  datePad(i) { return (`0${i}`).slice(-2); },
  // check & set date & tim dividers: (not used as of yet)
  checkDateDiv(div) { if (!div) { return '-'; } else { return div; }},
  checkTimeDiv(div) { if (!div) { return ':'; } else { return div; }},

  // date functions
  date(aDate) { return (this.datePad(this.dateObject(aDate).getDate())); },
  month(aDate) { return (this.datePad(this.dateObject(aDate).getMonth() + 1)); },
  year(aDate) { return (this.dateObject(aDate).getFullYear()); },
  weekday(aDate) { return (this.dateObject(aDate).toLocaleString("en-US", { weekday: "long" })); },
  monthEnglish(aDate) { return (this.dateObject(aDate).toLocaleString("en-US", { month: "long" })); },

  // time functions
  hours(aDate) { return (this.datePad(this.dateObject(aDate).getHours())); },
  minutes(aDate) { return (this.datePad(this.dateObject(aDate).getMinutes())); },
  seconds(aDate) { return (this.datePad(this.dateObject(aDate).getSeconds())); },
  milliseconds(aDate) { return (this.dateObject(aDate).getTime()); },

  // combinations
  dateFull(d, aDate) { return (this.justDate(aDate) + ' ' + this.justHHMM(aDate)); },
  justAMPM(d, aDate) {
    if (!d) { d = ':'}
    let h = '', s = '';
    this.hours(aDate) > 13 ? (h = this.hours(aDate) - 12, s = 'pm') : (h = this.hours(aDate), s = 'am');
    return (`${h}${d}${this.minutes(aDate)}${s}`);
  },
  justHHMM(d, aDate) { if (!d) { d = ':'; } return (`${this.hours(aDate)}${d}${this.minutes(aDate)}`); },
  justDate(d, aDate) { if (!d) { d = '-'; } return (`${this.year(aDate)}${d}${this.month(aDate)}${d}${this.date(aDate)}`); },
  justTime(d, aDate) { if (!d) { d = ':'; } return (`${this.hours(aDate)}${d}${this.minutes(aDate)}${d}${this.seconds(aDate)}`); },
  fullEnglishDate(aDate) { return (`${this.weekday(aDate)}, ${this.monthEnglish(aDate)} ${this.date(aDate)}, ${this.year(aDate)}`) },
};

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
  opsys = conColor.bright + conColor.orange + opsys + conColor.reset;
  return opsys;
};

//
// create server title ascii art
//
const makeServerTitle = function() {
  let m = conColor.magenta + conColor.bright, c = conColor.cyan + conColor.dim, o = conColor.orange + conColor.bright;
  const consoleLine = '-'.repeat(43);
  console.log(`  ${m} _    _                  ${c}_                 ${conColor.reset}`);
  console.log(`  ${m}| |_ (_) _ __   _   _   ${c}/_\\   _ __   _ __  ${conColor.reset}`);
  console.log(`  ${m}| __|| || '_ \\ | | | | ${c}//_\\\\ | '_ \\ | '_ \\ ${conColor.reset}`);
  console.log(`  ${m}| |_ | || | | || |_| |${c}/  _  \\| |_) || |_) |${conColor.reset}`);
  console.log(`   ${m}\\__||_||_| |_| \\__, |${c}\\_/ \\_/| .__/ | .__/ ${conColor.reset}`);
  console.log(`   ${o}__             ${m}|___/        ${c}|_|    |_|    ${conColor.reset}`);
  console.log(`  ${o}/ _\\  ___  _ __ __   __ ___  _ __          `);
  console.log(`  \\ \\  / _ \\| '__|\\ \\ / // _ \\| '__|         `);
  console.log(`  _\\ \\|  __/| |    \\ V /|  __/| |            `);
  console.log(`  \\__/ \\___||_|     \\_/  \\___||_|            `);
  console.log(conColor.yellow +  conColor.dim + '  ' + consoleLine);
  console.log(conColor.reset);
};

//
// urlExists(theURL)
// check supplied URL to see if it actually exists (response of < 400)
// return true if yes and ok, false if error code of 400 or >
//
const urlExists = function(theURL,callback) {
  return true;
};



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

//
// clickTrack()
// this creates a LOG database of EVERY click of a tiny URL - with a tiny URL id, user ID, & datestamp.
//
const clickTrack = function(db, urlID, uid, action) {
  // add a log entry
  console.log("IN CLICK TRACK");
  if (action === 'add') {
    let rightNow = JSON.stringify(new Date());
    rightNow = rightNow.replace(/['"]+/g, '');
    console.log("RIGHTNOW: ", rightNow);

    let newClickTrack = {
      lid: urlID,
      uid: uid,
      dateStamp: rightNow,
    };
    db[rightNow] = newClickTrack;
    console.log("CLICK TRACK DB: " + JSON.stringify(db));
    console.log(JSON.stringify(newClickTrack));
  }
  console.log("CLICK TRACK DB: " + JSON.stringify(db));
};

module.exports = {
  conColor,
  myDateObject,
  findUserByEmail,
  cookiesButNoMilk,
  getOpSys,
  makeServerTitle,
  urlExists,
  tinyTrack,
  clickTrack,
};
