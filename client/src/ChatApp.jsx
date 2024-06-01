import React, { useState, useEffect } from 'react';
import RoomList from "./RoomList"; 
import UserList from "./UserList";
import io from 'socket.io-client';
const socket = io.connect();

const Message = ({ user, text }) => (

  <div className="message">
    <strong>{user} :</strong>
    <span>{text}</span>
  </div>
);

const MessageList = ({ messages, roomName }) => (
  <div className='messages'>
    <h2> {roomName} </h2>
    {messages.map((message, i) => (
      <Message key={i} user={message.user} text={message.text} />
    ))}
  </div>
);

const MessageForm = ({ user, onMessageSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = { user, text, room: user.currentRoom };
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
        <h3></h3>
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

  const handleMessageSubmit = (message) => {
    setMessages((messages) => [...messages, message]);
    socket.emit('send:message', message);
  };

  const handleCreateRoom = (newRoomName) => {
    setRooms((rooms) => [...rooms, newRoomName]);
  };

  const handleSelectRoom = (room) => {
    setCurrentRoomName(room);
    // Load messages for the selected room
    socket.emit('request:messages', { room }, (response) => {
      if (response.success) {
        setMessages(response.messages);
      } else {
        console.error('Error fetching messages:', response.message);
      }
    });
  };

  return (
    <div>
      <div className='appbox'>
        <div className='searchroom'>
          <RoomList
            rooms={rooms}
            onSelectRoom={handleSelectRoom}
            onCreateRoom={handleCreateRoom}
          />
        </div>
        <div className='center'>
          <UserList users={users} />
          <MessageList messages={messages} roomName={currentRoomName} />
          <MessageForm onMessageSubmit={handleMessageSubmit} user={user} />
        </div>
      </div>
    </div>
  );
};

export default ChatApp;