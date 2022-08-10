const { assert } = require('chai');

const { findUserByEmail,
  cookiesButNoMilk,
  getOpSys,
  makeServerTitle,
  urlExists,
} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert(user === expectedUserID, 'user from user@example.com is userRandomID');
  });

  it('should return a false with invalid email', function() {
    const user = findUserByEmail("user34@example.com", testUsers);
    const expectedUserID = false;
    // Write your assert statement here
    assert(user === expectedUserID, 'user that does not exist is false');
  });

});


describe('urlExists', function() {

  it('should return a true with valid url - google.com', function() {
    const result = urlExists("http://www.google.com");
    const expectedResult = true;
    assert(result === expectedResult, 'that URL does exist (google.com');
  });

  it('should return a false with invalid url - http://www.googlexfdsfdsfd.com', function() {
    const result = urlExists("http://www.googlexfdsfdsfd.com");
    const expectedResult = false;
    assert(result === expectedResult, 'that URL does exist (google.com');
  });
});