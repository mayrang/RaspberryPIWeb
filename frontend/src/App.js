import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8000");

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("mqtt-message", (message) => {
      console.log(message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  return (
    <div>
      <h1>MQTT Messages</h1>
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
}

export default App;
