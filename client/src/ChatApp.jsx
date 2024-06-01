import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io.connect();

const Message = ({ user, text }) => (
  <div className="message">
    <strong>{user} :</strong>
    <span>{text}</span>
  </div>
);

const MessageList = ({ messages }) => (
  <div className='messages'>
    <h2> 채팅방 </h2>
    {messages.map((message, i) => (
      <Message key={i} user={message.user} text={message.text} />
    ))}
  </div>
);

const MessageForm = ({ user, onMessageSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = { user, text };
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

const ChangeNameForm = ({ onChangeName }) => {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onChangeName(newName);
    setNewName('');
  };

  return (
    <div className='change_name_form'>
      <h3> 아이디 변경 </h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder='변경할 아이디 입력'
          onChange={(e) => setNewName(e.target.value)}
          value={newName}
        />
      </form>
    </div>
  );
};

const UsersList = ({ users }) => (
  <div className='users'>
    <h3> 참여자들 </h3>
    <ul>
      {users.map((user, i) => (
        <li key={i}>{user}</li>
      ))}
    </ul>
  </div>
);

const RoomsList = ({ rooms, onSelectRoom, onCreateRoom }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowMessage(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!rooms.includes(searchTerm) && searchTerm.trim() !== '') {
      setShowMessage(true);
    } else {
      setShowMessage(false);
      onSelectRoom(searchTerm);
    }
  };

  const handleCreateRoomSubmit = (e) => {
    e.preventDefault();
    if (newRoomName.trim() !== '') {
      onCreateRoom(newRoomName);
      setNewRoomName('');
      setShowMessage(false);
    }
  };

  return (
    <div className='roomlist'>
      <h1> 방 목록 </h1>
      <form onSubmit={handleSearchSubmit}>
        <input
          placeholder='방 이름을 검색해 주세요.'
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </form>
      {showMessage && (
        <div className='message'>
          해당 방이 존재하지 않습니다. 방을 개설하시겠습니까?
          <form onSubmit={handleCreateRoomSubmit}>
            <button type="button" onClick={() => handleCreateRoom(true)}>예</button>
            <button type="button" onClick={() => handleCreateRoom(false)}>아니오</button>
          </form>
        </div>
      )}
      <ul>
        {rooms.map((room, i) => (
          <li key={i} onClick={() => onSelectRoom(room)}>
            {room}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChatApp = ({ name }) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [isLoggined, setIsLoggined] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('');

  useEffect(() => {
    setUser(name);

    // Fetch room list from the server
    axios.get('/rooms')
      .then(response => {
        setRooms(response.data.rooms);
      })
      .catch(error => {
        console.error('There was an error fetching the room list!', error);
      });

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
  }, []);

  const handleMessageSubmit = (message) => {
    setMessages((messages) => [...messages, message]);
    socket.emit('send:message', { ...message, room: currentRoom });
  };

  const handleChangeName = (newName) => {
    socket.emit('change:name', { name: newName }, (result) => {
      if (!result) {
        return alert('There was an error changing your name');
      }
      setUser(newName);
    });
  };

  const handleSelectRoom = (room) => {
    setCurrentRoom(room);
    // Fetch messages for the selected room
    axios.get(`/rooms/${room}/messages`)
      .then(response => {
        setMessages(response.data.messages);
      })
      .catch(error => {
        console.error(`There was an error fetching messages for room ${room}!`, error);
      });
  };

  const handleCreateRoom = (newRoomName) => {
    axios.post('/rooms', { room: newRoomName })
      .then(response => {
        if (response.status === 201) {
          setRooms((rooms) => [...rooms, newRoomName]);
          setCurrentRoom(newRoomName);
          setMessages([]);
        }
      })
      .catch(error => {
        console.error('There was an error creating the room!', error);
      });
  };

  return (
    <div>
      <div className='appbox'>
        <div className='searchroom'>
          <RoomsList rooms={rooms} onSelectRoom={handleSelectRoom} onCreateRoom={handleCreateRoom} />
        </div>
        <div className='center'>
          <UsersList users={users} />
          <ChangeNameForm onChangeName={handleChangeName} />
          <MessageList messages={messages} />
          <MessageForm onMessageSubmit={handleMessageSubmit} user={user} />
        </div>
      </div>
    </div>
  );
};

export default ChatApp;