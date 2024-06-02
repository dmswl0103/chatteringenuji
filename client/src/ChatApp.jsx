import React, { useState, useEffect } from 'react';
import RoomList from "./RoomList"; 
import UserList from "./UserList";
import axios from 'axios';
import io from 'socket.io-client';
const socket = io.connect();

const Message = ({ user, text ,time, logginedUser}) => {
  console.log(time);  // time을 출력
  return (
      <div>
          {user == logginedUser ? (
              <div className="MyMessage">
                  <strong>{user} </strong>
                  <span>{text} </span>
      
                  <span style={{color: 'gray', fontSize: 'small'}}>{time}</span>
              </div>
          ) : (
              <div className="message">
                  <strong>{user} </strong>
                  <span>{text} </span>
               
                  <span style={{color: 'gray', fontSize: 'small'}}>{time}</span>
              </div>
          )}
      </div>
  );
};


const MessageList = ({ messages, roomName, logginedUser }) => {
  console.log(messages);  // messages를 출력

  return (
    <div className='messages'>
      <h2>{roomName}</h2>
      {messages.map((message, i) => (
        <Message key={i} user={message.user_id} text={message.message} time={message.timestamp} logginedUser={logginedUser} />
      ))}
    </div>
  );
};


const MessageForm = ({ user, onMessageSubmit, currentRoom }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = { user_id: user, message: text, room: currentRoom, timestamp: new Date().toLocaleString() };
    onMessageSubmit(message);
    setText('');
  };

  return (
    <div className='message_form'>
      <form onSubmit={handleSubmit}>
        <input
          placeholder='메시지 입력'
          className='textinput'
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

const ChatApp = ({ name }) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [rooms, setRooms] = useState([]);
  const [currentRoomName, setCurrentRoomName] = useState('');

  useEffect(() => {
    setUser(name);

    socket.on('init', (data) => {
      setUsers(data.users);
      setUser(data.name);
    });

    socket.on('send:message', (message) => {
      setMessages((messages) => [...messages, message]);
    });

    socket.on('user:join', (user) => {
      setUsers((users) => [...users, user]);
    });

    socket.on('user:left', (user) => {
      setUsers((users) => users.filter((u) => u !== user));
    });

    socket.on('change:name', ({ oldName, newName }) => {
      setUsers((users) => users.map((user) => (user === oldName ? newName : user)));
    });

    socket.on('signUp:success', () => {
      setIsLoggined(true);
    });

    socket.emit('request:rooms', (response) => {
      if (response.success) {
        setRooms(response.rooms);
      } else {
        console.error('Error fetching rooms:', response.message);
      }
    });

  }, []);

  useEffect(() => {
    console.log('!!!messages', messages);
}, [messages]);

  const handleMessageSubmit = (message) => {
    console.log('@@@@@message',message);
    setMessages((messages) => [...messages, message]);

    axios.post('/send_message', message)
      .then(response => {
        if (response.status !== 201) {
          console.error('Error sending message:', response.data);
        }
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  };

  const handleCreateRoom = (newRoomName) => {
    setRooms((rooms) => [...rooms, newRoomName]);
  };

  const handleSelectRoom = (room) => {
    setCurrentRoomName(room);

    // Load messages for the selected room
    axios.get('/get_messages', { params: { room } })
      .then(response => {
        setMessages(response.data);
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
      });
  };

  return (
    <div>
      <div className='appbox'>
        <div className='searchroom'>
          <RoomList
            onSelectRoom={handleSelectRoom}
            onCreateRoom={handleCreateRoom}
          />
        </div>
        <div className='center'>
          <UserList users={users} />
          <MessageList messages={messages} roomName={currentRoomName} logginedUser = {name}/>
          <MessageForm onMessageSubmit={handleMessageSubmit} user={user} currentRoom={currentRoomName} />
        </div>
      </div>
    </div>
  );
};

export default ChatApp;