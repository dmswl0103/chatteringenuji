import React from "react";
import { useState } from "react";

import io from 'socket.io-client';
const socket = io.connect();

const SignUpForm = ({ isLogin }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [historyUser, setHistoryUser] = useState({});
  
    const handleSubmit = (e) => {
      e.preventDefault();
      const newUsers = { ...historyUser, [id]: password };
  
      if (historyUser[id]) {
        setMessage('이미 있는 아이디입니다.');
      } else {
        setMessage('회원 가입이 성공적으로 완료되었습니다');
        setHistoryUser(newUsers);
        handleSignUp();
      }
    };
  
    const handleSignUp = () => {
      console.log('handleSignUp');
      socket.emit('sign up', { username: id, password });
    };
  
    const handleLogin = (e) => {
      e.preventDefault();
      if (historyUser[id]) {
        if (historyUser[id] === password) {
          setMessage('로그인 되었습니다.');
          isLogin(id);

          
       

        } else {
          setMessage('비밀번호가 일치하지 않습니다.');
          
        }
      } else {
        setMessage('존재하지 않는 아이디입니다.');
      }
    };
  
    return (
      <div className='signup_form'>
        <h3>회원 가입</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              ID 입력:
              <input
                type="text"
                placeholder='ID 입력'
                onChange={(e) => setId(e.target.value)}
                value={id}
              />
            </label>
          </div>
          <div>
            <label>
              비밀번호 입력:
              <input
                type="password"
                placeholder='비밀번호 입력'
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </label>
          </div>
          <button type="submit">회원가입</button>
          <button type="button" onClick={handleLogin}>로그인</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    );
  };

  export default SignUpForm;