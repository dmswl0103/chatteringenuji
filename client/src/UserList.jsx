import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // 서버 주소를 입력하세요

const UserList = ({ room, onSelectUser }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (room) {
            socket.emit('join:room', room);

            socket.on('room:users', (users) => {
                setUsers(users);
            });

            // Clean up function to unsubscribe from updates when component unmounts
            return () => {
                socket.off('room:users');
                setUsers([]);
            };
        }
    }, [room]);

    return (
        <div className='users'>
            <h3>  </h3>
            <ul>
                {users.map((user, i) => (
                    <li key={i} onClick={() => onSelectUser(user)}>
                        {user} {/* user_id를 출력 */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;