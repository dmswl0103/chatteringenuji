
// 방목록 소켓에서 받아서 띄우는 거 

/* 로그인 소켓에서 처리 
filter 걸러서 방 개설하기 버튼 
방 바꾸면 소켓에서 그 방에 채팅 기록 가져오기 
*/
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

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

const RoomsList = ({ rooms, onSelectRoom }) => (
  <div className='roomlist'> 
    <h1> 방 목록 </h1>
      <form>
      <input
        placeholder='검색할 방 이름 입력'
      />
    </form>
    <ul>
      {rooms.map((room, i) => (
        <li key={i} onClick={() => onSelectRoom(room)}>
          {room}
        </li>
      ))}
    </ul>
  </div>
);


const ChatApp = ({ name }) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [isLoggined, setIsLoggined] = useState(false);
  const [rooms, setRooms] = useState([]);

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
  }, []);

  const handleMessageSubmit = (message) => {
    setMessages((messages) => [...messages, message]);
    socket.emit('send:message', message);
  };

  const handleChangeName = (newName) => {
    socket.emit('change:name', { name: newName }, (result) => {
      if (!result) {
        return alert('There was an error changing your name');
      }
      setUser(newName);
    });
  };

  return (
    <div>
      <div className='appbox'>
        <div className='searchroom'>
          <RoomsList rooms={rooms}/>
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