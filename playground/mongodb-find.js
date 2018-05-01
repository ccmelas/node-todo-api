const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if(err) return console.log('Unable to connect to mongodb server');

    console.log('Connected successfully');
    const db = client.db('TodoApp');

    db.collection('Todos').find({_id: new ObjectID('5ae66c79f2cddbf8f58a61af')}).toArray().then((docs) => {
        console.log('Todos');
        console.log(JSON.stringify(docs, undefined, 2));
    }).catch(err => {
        console.log('Unable to fetch todos ', err);
    });

    client.close();
});