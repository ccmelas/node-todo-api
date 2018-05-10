const {SHA256} = require('crypto-js');     
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var data = {
    id: 10
};

var password = '123456!';
bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    });
});

var hashedPassword = '$2a$10$MGWAC3IcMQvRfhyZInpR5eH5EqZ6bWUYpfbUZdlJ.5h96vvs70gw2';
bcrypt.compare(password, hashedPassword, (err, result) => {
    console.log(result);
});

// var token = jwt.sign(data, '123abc');
// console.log(token);

// var decoded = jwt.verify(token, '123abc');
// console.log(decoded);
// var message = 'I am user number 3';
// var hash = SHA256(message).toString();
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);