import React, { useState } from "react";
import io from 'socket.io-client';

const socket = io.connect();

const SignUpForm = ({ isLogin }) => {
    const [user_id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [message, setMessage] = useState('');
    const [historyUser, setHistoryUser] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        const newUsers = { ...historyUser, [user_id]: pw };

        if (historyUser[user_id]) {
            setMessage('이미 있는 아이디입니다.');
        } else {
            setMessage('회원 가입이 성공적으로 완료되었습니다');
            setHistoryUser(newUsers);
            handleSignUp();
        }
    };

    const handleSignUp = () => {
        socket.emit('sign up', { username: user_id, password: pw }, (response) => {
            if (response.success) {
                handleLogin();
            } else {
                setMessage(response.message);
            }
        });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const userInput = { username: user_id, password: pw };
        socket.emit('login', userInput, (response) => {
            if (response.success) {
                setMessage('로그인 되었습니다.');
                isLogin(user_id);
            } else {
                setMessage(response.message);
            }
        });
    };

    return (
        <div className='signup_form'>
            <img src="./images/INU.png" alt="Signup Image" className='signup_image' />
            <h3>회원 가입</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        ID 입력:
                        <input
                            type="text"
                            placeholder='ID 입력'
                            onChange={(e) => setId(e.target.value)}
                            value={user_id}
                            className='textinput'
                        />
                    </label>
                </div>
                <div>
                    <label>
                        비밀번호 입력:
                        <input
                            type="password"
                            placeholder='비밀번호 입력'
                            onChange={(e) => setPw(e.target.value)}
                            value={pw}
                            className='textinput'
                        />
                    </label>
                </div>
                <button type="submit">회원가입</button>
                <button type="button" onClick={handleLogin}>로그인</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default SignUpForm;
