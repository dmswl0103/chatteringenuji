var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  var getGuestName = function () {
    var name,
        nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  var get = function () {
    var res = [];
    for (var user in names) {
      res.push(user);
    }
    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());


module.exports = function (socket, connection) {
  var name = userNames.getGuestName();

  // 새 사용자에게 이름과 사용자 목록을 전송
  socket.emit('init', {
    name: name,
    users: userNames.get()
  });

  // 다른 클라이언트에게 새 사용자가 가입했음을 알림
  socket.broadcast.emit('user:join', {
    name: name
  });

  // 사용자의 메시지를 다른 사용자에게 브로드캐스트
  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.text
    });
  });

  // 사용자의 이름 변경을 검증하고 성공 시 브로드캐스트
  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);
      name = data.name;

      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  socket.on('sign up', function (data, callback) {
    const { username, password } = data;
    connection.query('INSERT INTO signup (user_id, pw) VALUES (?, ?)', [username, password], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') { // 중복된 사용자가 있을 경우
          callback({ success: false, message: '이미 존재하는 사용자입니다.' });
        } else {
          console.error('Error inserting into signup:', err);
          callback({ success: false, message: 'Database error' });
        }
      } else {
        callback({ success: true });
      }
    });
  });

  // 로그인 정보 처리
  socket.on('login', function (data, callback) {
    const { username, password } = data;
    connection.query('SELECT * FROM signup WHERE user_id = ? AND pw = ?', [username, password], (err, results) => {
      if (err) {
        console.error('Error querying login:', err);
        callback({ success: false, message: 'Database error' });
      } else if (results.length > 0) {
        callback({ success: true });
      } else {
        callback({ success: false, message: '유효하지 않은 정보입니다.' });
      }
    });
  });
  


  // 방 목록을 요청받아 전송
  socket.on('request:rooms', (callback) => {
    connection.query('SELECT room FROM chatroom', (err, results) => {
      if (err) {
        console.error('Error fetching rooms:', err);
        callback({ success: false, message: 'Database error' });
      } else {
        const rooms = results.map(result => result.room);
        callback({ success: true, rooms });
      }
    });
  });

  // 방 생성 요청을 처리
  socket.on('create:room', (data, callback) => {
    const { roomName } = data;
    connection.query('INSERT INTO chatroom (room) VALUES (?)', [roomName], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          callback({ success: false, message: '이미 존재하는 방입니다.' });
        } else {
          console.error('Error inserting into rooms:', err);
          callback({ success: false, message: 'Database error' });
        }
      } else {
        callback({ success: true });
      }
    });
  });

  // 특정 방의 메시지 요청을 처리
  socket.on('request:messages', (data, callback) => {
    const { roomName } = data;
    connection.query('SELECT user_id, message FROM chat WHERE room = ?', [roomName], (err, results) => {
      if (err) {
        console.error('Error fetching messages:', err);
        callback({ success: false, message: 'Database error' });
      } else {
        const messages = results.map(result => ({ user: result.user_id, text: result.message }));
        callback({ success: true, messages });
      }
    });
  });

  // 메시지를 방에 추가
  socket.on('send:message', (data) => {
    const { user, text, room } = data;
    connection.query('INSERT INTO chat (user_id, message, room) VALUES (?, ?, ?)', [user, text, room], (err) => {
      if (err) {
        console.error('Error inserting into messages:', err);
      } else {
        io.to(room).emit('send:message', { user, text });
      }
    });
  });

  // 방에 참가
  socket.on('join:room', (room) => {
    socket.join(room);
  });


  // 사용자가 떠날 때 정리하고 다른 사용자에게 알림
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
};