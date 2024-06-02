'use strict';

/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
const bodyParser = require('body-parser');
const mysql = require('mysql');

var socketHandler = require('./routes/socket.js');
const socketIo = require('socket.io');

var app = express();
var server = http.createServer(app);  // 서버 생성
var io = socketIo(server);  // socketIo 인스턴스 생성

app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: '202301513user',
  password: '202301513pw',
  database: 'chatdb'

});

connection.connect((err) => {
  if (err) console.log(err);
  else console.log('Connected to the database');
});

/* Configuration */
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.set('port', 3000);

if (process.env.NODE_ENV === 'development') {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

/* Express Routes */
app.post('/register', (req, res) => {
  const { id, pw } = req.body;
  console.log(req.body);

  connection.query('INSERT INTO signup (id, pw) VALUES (?, ?)', [id, pw], (err) => {
    if (err) {
      console.error('Error inserting into signup:', err);
      res.status(500).send('Database error');
    } else {
      res.status(201).send('User registered successfully');
    }
  });
});

app.post('/signup', (req, res) => {
  const { id, pw } = req.body;

  connection.query('SELECT * FROM signup WHERE id = ? AND pw = ?', [id, pw], (err, results) => {
    if (err) {
      console.error('Error querying signup:', err);
      res.status(500).send('Database error');
    } else if (results.length > 0) {
      res.status(200).send('Signup successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});

app.post('/create_room', (req, res) => {
  const { room, user_id } = req.body;

  // 방 이름이 이미 존재하는지 확인
  connection.query('SELECT * FROM chatroom WHERE room = ?', [room], (err, results) => {
    if (err) {
      console.error('Error checking room:', err);
      res.status(500).send('Database error');
    } else if (results.length > 0) {
      // 방 이름이 이미 존재할 경우
      res.status(400).send('Room already exists');
    } else {
      // 새로운 방 생성
      connection.query("INSERT INTO chatroom (room, users) VALUES (?, ?)", [room, JSON.stringify([user_id])], (err) => {
        if (err) {
          console.error('Error creating room:', err);
          res.status(500).send('Database error');
        } else {
          // 성공적으로 방을 생성한 경우
          res.status(201).send('Room created successfully');
        }
      });
    }
  });
});

app.get('/get_rooms', (req, res) => {
  connection.query('SELECT room FROM chatroom', (err, results) => {
    if (err) {
      console.error('Error getting rooms:', err);
      res.status(500).send('Database error');
    } else {
      res.status(200).json(results.map(row => row.room));
    }
  });
});

app.get('/get_messages', (req, res) => {
  const { room } = req.query;

  connection.query('SELECT user_id, message, timestamp FROM chat WHERE room = ?', [room], (err, results) => {
    if (err) {
      console.error('Error getting messages:', err);
      res.status(500).send('Database error');
    } else {
      res.status(200).json(results);
    }
  });
});

app.post('/send_message', (req, res) => {
  const { timestamp,user_id, room, message } = req.body;
  console.log('timestamp!!:', timestamp);

  connection.query('INSERT INTO chat (timestamp, user_id, room, message) VALUES (?, ?, ?, ?)', [timestamp, user_id, room, message], (err) => {
    if (err) {
      console.error('Error sending message:', err);
      res.status(500).send('Database error');
    } else {
      res.status(201).send('Message sent successfully');
    }
  });
});

/* Socket.io Communication */
io.on('connection', (socket) => {
  socketHandler(socket, connection);  // 소켓과 데이터베이스 연결 객체를 전달
});

/* Start server */
server.listen(app.get('port'), () => {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;