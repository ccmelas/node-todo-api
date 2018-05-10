var expect = require('expect');
var request = require('supertest');
const { ObjectID } = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should do create a new todo', (done) => {
        var text = 'Test todo text';
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({text})
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) return done(err);

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(err => done(err));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch(err => done(err));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return a 404 if todo not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return a 400 if id is invalid', (done) => {
        request(app)
            .get(`/todos/12345`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end((err, res) => {
                if (err) return done(err);

                Todo.find().then(_todos => {
                    expect(_todos.length).toBe(todos.length - 1);
                    return Todo.findById(todos[0]._id.toHexString()); 
                })
                .then((todo) => {
                    expect(todo).toNotExist();
                    done();
                })
                .catch(err => done(err));
            });
    });

    it('should not remove another user\'s todo', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);

                Todo.find().then(_todos => {
                    expect(_todos.length).toBe(todos.length);
                    return Todo.findById(todos[0]._id.toHexString()); 
                })
                .then((todo) => {
                    expect(todo).toExist();
                    done();
                })
                .catch(err => done(err));
            });
    });

    it('should return a 404 if todo not found', (done) => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return a 400 if id is invalid', (done) => {
        request(app)
            .delete(`/todos/12345`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var id = todos[0]._id.toHexString();
        var update = {text: 'Updated Text', completed: true};
        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send(update)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(update.text);
                expect(res.body.todo.completed).toBe(update.completed);
                expect(res.body.todo.completedAt).toExist();
            })
            .end((err, res) => {
                if (err) return done(err);

                Todo.findById(id).then(todo => {
                    expect(todo.text).toBe(update.text);
                    expect(todo.completed).toBe(update.completed);
                    expect(todo.completedAt).toExist().toBeA('number');
                    done();
                }).catch(err => done(err));
            });

    });

    it('should not update another user\'s todo', (done) => {
        var id = todos[0]._id.toHexString();
        var update = {text: 'Updated Text', completed: true};
        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send(update)
            .expect(404)
            .end(done);
    });

    it('should clear completed at when todo is not completed', (done) => {
        var id = todos[1]._id.toHexString();
        var update = {text: 'Updated Text', completed: false};

        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send(update)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(update.text);
                expect(res.body.todo.completed).toBe(update.completed);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end((err, res) => {
                if (err) return done(err);

                Todo.findById(id).then(todo => {
                    expect(todo.text).toBe(update.text);
                    expect(todo.completed).toBe(update.completed);
                    expect(todo.completedAt).toNotExist();
                    done();
                }).catch(err => done(err));
            });
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com';
        var password = '123abcs';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if(err) return done(err);

                User.findOne({email}).then(user => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch(e => done(e));

            });
    });

    it('should return validation errors if request is invalid', (done) => {
        request(app)
            .post('/users')
            .send({email: 'abc', password: '123'})
            .expect(400)
            .end(done);
    });

    it('should not create a user if email in user', (done) => {
        request(app)
            .post('/users')
            .send({email: users[0].email, password: '123abc34'})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        var index = 0;
        var testUser = users[index];
        request(app)
            .post('/users/login')
            .send({email: testUser.email, password: testUser.password})
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(testUser.email);
                expect(res.body._id).toBe(testUser._id.toHexString());
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if(err) return done(err);

                User.findById(testUser._id).then(user => {
                    expect(user).toExist();
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch(e => done(e));
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({email: 'email', password: 'pass'})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end(done);
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        var user = users[0];
        request(app)
            .delete('/users/me/token')
            .set('x-auth', user.tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                User.findById(user._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(e => done(e));
            });
    });
}); 