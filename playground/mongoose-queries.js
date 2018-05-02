const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

var id = "5ae9c9ecd204c1408d3e1be1";

Todo.find({
    _id: id
}).then((todos) => {
    console.log('Todos: ', todos);
});

Todo.findOne({
    completed: false
}).then((todo) => {
    console.log('Todo: ', todo);
});

Todo.findById(id).then((todo) => {
    console.log('Todo By ID: ', todo);
});