import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const UsersList = ({ room }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users who are in the selected room
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/users?room=${room}`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();

    // Clean up function to unsubscribe from updates when component unmounts
    return () => {
      setUsers([]);
    };
  }, [room]);

  return (
    <div className='users'>
      <h3> 참여자들 </h3>
      <ul>
        {users.map((user, i) => (
          <li key={i}>{user.user_id}</li>
        ))}
      </ul>
    </div>
  );
};

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
    setNewRoomName(searchTerm);
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

  const handleCreateRoom = () => {
    if (newRoomName.trim() !== '') {
      axios.post('/create_room', { room: newRoomName })
        .then(response => {
          if (response.status === 201) {
            onCreateRoom(newRoomName);
            setNewRoomName('');
            setShowMessage(false);
          } else {
            console.error('Error creating room:', response.data);
          }
        })
        .catch(error => {
          console.error('Error creating room:', error);
        });
    } else {
      setShowMessage(true);
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
            <button type="button" onClick={handleCreateRoom}>예</button>
            <button type="button" onClick={() => setShowMessage(false)}>아니오</button> 
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
          <RoomsList
            rooms={rooms}
            onSelectRoom={handleSelectRoom}
            onCreateRoom={handleCreateRoom}
          />
        </div>
        <div className='center'>
          <UsersList room={currentRoomName} />
          <MessageList messages={messages} roomName={currentRoomName} />
          <MessageForm onMessageSubmit={handleMessageSubmit} user={user} />
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
