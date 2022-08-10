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

module.exports = {
  findUserByEmail,
}