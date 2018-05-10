const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

var {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
    {
        _id: userOneId,
        email: 'melas.devsq@olotusquare.co',
        password: 'userOnePass',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, 'abc123').toString()
            }
        ]
    },
    {
        _id: userTwoId,
        email: 'chiemelachinedum@gmail.com',
        password: 'userTwoPass',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({_id: userTwoId.toHexString(), access: 'auth'}, 'abc123').toString()
            }
        ]
    }
]
const todos = [
    {
        _id: new ObjectID(),
        text: 'Test Todo 1',
        _creator: userOneId
    },
    {
        _id: new ObjectID(),
        text: 'Test Todo 2',
        completed: true,
        completedAt: 333,
        _creator: userTwoId
    }
];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());  
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    })
    .then(() => done())
    //.catch((e) => done());
}
module.exports = { todos, populateTodos, users, populateUsers };