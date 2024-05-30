// import React, { useState, useEffect } from 'react';
// import ReactDOM from 'react-dom';
// import io from 'socket.io-client';

// const socket = io.connect();

// const UsersList = ({ users }) => (
//   <div className='users'>
//     <h3> 참여자들 </h3>
//     <ul>
//       {users.map((user, i) => (
//         <li key={i}>{user}</li>
//       ))}
//     </ul>
//   </div>
// );

// const Message = ({ user, text }) => (
//   <div className="message">
//     <strong>{user} :</strong>
//     <span>{text}</span>
//   </div>
// );

// const MessageList = ({ messages }) => (
//   <div className='messages'>
//     <h2> 채팅방 </h2>
//     {messages.map((message, i) => (
//       <Message key={i} user={message.user} text={message.text} />
//     ))}
//   </div>
// );

// const MessageForm = ({ user, onMessageSubmit }) => {
//   const [text, setText] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const message = { user, text };
//     onMessageSubmit(message);
//     setText('');
//   };

//   return (
//     <div className='message_form'>
//       <form onSubmit={handleSubmit}>
//         <input
//           placeholder='메시지 입력'
//           className='textinput'
//           onChange={(e) => setText(e.target.value)}
//           value={text}
//         />
//         <h3></h3>
//       </form>
//     </div>
//   );
// };

// const ChangeNameForm = ({ onChangeName }) => {
//   const [newName, setNewName] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onChangeName(newName);
//     setNewName('');
//   };

//   return (
//     <div className='change_name_form'>
//       <h3> 아이디 변경 </h3>
//       <form onSubmit={handleSubmit}>
//         <input
//           placeholder='변경할 아이디 입력'
//           onChange={(e) => setNewName(e.target.value)}
//           value={newName}
//         />
//       </form>
//     </div>
//   );
// };

// const ChatApp = () => {
//   const [users, setUsers] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [user, setUser] = useState('');
//   const [isLoggined, setIsLoggined] = useState(false);

//   useEffect(() => {
//     socket.on('init', (data) => {
//       setUsers(data.users);
//       setUser(data.name);
//     });
//     socket.on('send:message', (message) => {
//       setMessages((messages) => [...messages, message]);
//     });
//     socket.on('user:join', (user) => {
//       setUsers((users) => [...users, user]);
//     });
//     socket.on('user:left', (user) => {
//       setUsers((users) => users.filter((u) => u !== user));
//     });
//     socket.on('change:name', ({ oldName, newName }) => {
//       setUsers((users) => users.map((user) => (user === oldName ? newName : user)));
//     });
//     socket.on('signUp:success', () => {
//       setIsLoggined(true);
//     });
//   }, []);

//   const handleMessageSubmit = (message) => {
//     setMessages((messages) => [...messages, message]);
//     socket.emit('send:message', message);
//   };

//   const handleChangeName = (newName) => {
//     socket.emit('change:name', { name: newName }, (result) => {
//       if (!result) {
//         return alert('There was an error changing your name');
//       }
//       setUser(newName);
//     });
//   };

//   if (!isLoggined) {
//     return null;
//   }

//   return (
//     <div>
//       <div className='center'>
//         <UsersList users={users} />
//         <ChangeNameForm onChangeName={handleChangeName} />
//         <MessageList messages={messages} />
//         <MessageForm onMessageSubmit={handleMessageSubmit} user={user} />
//       </div>
//     </div>
//   );
// };

// const SignUpForm = () => {
//   const [id, setId] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [historyUser, setHistoryUser] = useState({});

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const newUsers = { ...historyUser, [id]: password };

//     if (historyUser[id]) {
//       setMessage('이미 있는 아이디입니다.');
//     } else {
//       setMessage('회원 가입이 성공적으로 완료되었습니다');
//       setHistoryUser(newUsers);
//       handleSignUp();
//     }
//   };

//   const handleSignUpSuccess = () => {
//     console.log('회원 가입 성공');
//     setMessage('회원 가입이 성공적으로 완료되었습니다.');
//     ReactDOM.render(<ChatApp />, document.getElementById('app'));
//   };

//   const handleSignUp = () => {
//     console.log('handleSignUp');
//     socket.emit('sign up', { username: id, password });
//   };

//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (historyUser[id]) {
//       if (historyUser[id] === password) {
//         setMessage('로그인 되었습니다.');
//         ReactDOM.render(<ChatApp />, document.getElementById('app'));
//       } else {
//         setMessage('비밀번호가 일치하지 않습니다.');
//       }
//     } else {
//       setMessage('존재하지 않는 아이디입니다.');
//     }
//   };

//   return (
//     <div className='signup_form'>
//       <h3>회원 가입</h3>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>
//             ID 입력:
//             <input
//               type="text"
//               placeholder='ID 입력'
//               onChange={(e) => setId(e.target.value)}
//               value={id}
//             />
//           </label>
//         </div>
//         <div>
//           <label>
//             비밀번호 입력:
//             <input
//               type="password"
//               placeholder='비밀번호 입력'
//               onChange={(e) => setPassword(e.target.value)}
//               value={password}
//             />
//           </label>
//         </div>
//         <button type="submit">회원가입</button>
//         <button type="button" onClick={handleLogin}>로그인</button>
//       </form>
//       {message && <p>{message}</p>}
//     </div>
//   );
// };

// socket.on('signUp:success', function() {
//   handleSignUpSuccess();
// });

// ReactDOM.render(<SignUpForm />, document.getElementById('app'));



import React, { useState } from "react";
import SignUpForm from "./SignUpForm";
import ChatApp from "./ChatApp";

const ChatRoom = () => {    
  const [isLoggined, setIsLoggined] = useState(false);
  const [userName, setUserName] = useState(false);

  const handleLogin = (userName) => {
      setIsLoggined(true);    
      setUserName(userName)
  }

  return (
        <div>
          {isLoggined ? (
            <ChatApp name={userName} />
          ):(
            <SignUpForm isLogin={handleLogin} />
          )}          
        </div>
    );

};

export default ChatRoom;