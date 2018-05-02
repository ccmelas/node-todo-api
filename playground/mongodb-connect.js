const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if(err) return console.log('Unable to connect to mongodb server');

    console.log('Connected successfully');
    const db = client.db('TodoApp');

    db.collection('Todos').insertOne({
        text: 'Another Next up to do',
        completed: false
    }, (err, result) => {
        if(err) return console.log('Insert Failed');

        console.log('Success: ', result.ops);
    });

    db.collection('Users').insertOne({
        name: 'Chiemela Chinedum',
        age: 24,
        location: 'Port Harcourt, Rivers State'
    }, (err, result) => {
        if(err) return console.log('Insert Failed');

        console.log('Success: ', result.ops[0]._id.getTimestamp());
    });

    client.close();
});