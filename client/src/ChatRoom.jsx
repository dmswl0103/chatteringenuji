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