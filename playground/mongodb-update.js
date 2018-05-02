const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) return console.log('Could not connect to db');

    console.log('Connected to mongo server');

    const db = client.db('TodoApp');

    db.collection('Todos').findOneAndUpdate(
        {_id: new ObjectID("5ae86fb8e0f5ca5961276807")},
        {$set: {completed: true}},
        {returnOriginal: false}
    ).then(response => console.log(response));
    
    client.close();
});