//
//  LHL - TinyApp! - helpers.js
//  add helper functions for express_server.js
//


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
      console.log(`Hey, we found ${emailAddy} in the database as user ${userSearch}\n`);
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

module.exports = {
  findUserByEmail,
  cookiesButNoMilk,
  getOpSys,
  makeServerTitle,
}