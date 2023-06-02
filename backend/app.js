const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const cors = require("cors"); // cors 패키지 import

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: true,
  })
);
// MQTT 라이브러리 및 브로커 설정
const mqtt = require("mqtt");
const brokerUrl = "mqtt://localhost:1883";
const topic = "mobile/mayrang/sensing"; // 구독할 MQTT 토픽

// MQTT 클라이언트 생성
const client = mqtt.connect(brokerUrl);
client.on("error", (error) => {
  console.log("Can't connect" + error);
});
// MQTT 연결 이벤트 처리
client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe(topic);
});

// MQTT 메시지 수신 이벤트 처리
client.on("message", (topic, message) => {
  console.log("Received MQTT message:", message.toString());
  io.emit("mqtt-message", message.toString()); // WebSocket으로 클라이언트에게 메시지 전송
});

// Express 라우트
app.get("/", (req, res) => {
  res.send("성공");
});

// WebSocket 연결 이벤트 처리
io.on("connection", () => {
  console.log("A user connected");
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
