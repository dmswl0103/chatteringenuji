import React from "react";
import ReactDOM from "react-dom/client";
import ChatApp from "./src/ChatApp";
import SignUpForm from "./src/SignUpForm";
import ChatRoom from "./src/ChatRoom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChatRoom />
  </React.StrictMode>
);