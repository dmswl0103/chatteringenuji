import React, { useState, useEffect } from 'react';
import axios from 'axios';

import io from 'socket.io-client';
const socket = io.connect();

const RoomList = ({ onSelectRoom, onCreateRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    axios.get('/get_rooms')
      .then(response => {
        setRooms(response.data);
      })
      .catch(error => {
        console.error('Error fetching rooms:', error);
      });
  }, []);

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
            setRooms(prevRooms => [...prevRooms, newRoomName]);
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

  socket.on('room:created',()=>{
    axios.get('/get_rooms')
      .then(response => {
        setRooms(response.data);
      })
      .catch(error => {
        console.error('Error fetching rooms:', error);
      });
  });

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

export default RoomList;
