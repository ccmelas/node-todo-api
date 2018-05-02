var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose'); 
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({text: req.body.text});

    todo.save()
        .then(_doc => res.status(200).send(_doc))
        .catch(_e => res.status(400).send(_e))
});

app.get('/todos', (req, res) => {
    Todo.find().then(todos => res.send({todos}))
    .catch(_e => res.status(400).send(_e));
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id))
        return res.status(400).send({message: "Invalid ID"});
    
    Todo
        .findById(id)
        .then(todo => {
            if (!todo) return res.status(404).send({message: "Todo Not Found"});
            res.send({todo})
        })
        .catch(e => res.status(400).send({}));
    
});

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};