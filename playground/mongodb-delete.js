const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) return console.log('Could not connect to db');

    console.log('Connected to mongo server');

    const db = client.db('TodoApp');

    db.collection('Todos').deleteMany({text: 'Something else to do'}).then(result => {
        console.log(result.result.n);
    }).catch(err => console.log(err));

    db.collection('Todos').deleteOne({text: 'Next up to do'}).then(result => {
        console.log(result.result.n);
    }).catch(err => console.log(err));

    db.collection('Todos').findOneAndDelete({completed: true}).then(result => {
        console.log(result);
    }).catch(err => console.log(err));
    client.close();
});