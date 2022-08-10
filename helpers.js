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
  makeServerTitle,
}