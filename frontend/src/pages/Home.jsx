import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import io from "socket.io-client";

const socket = io("http://localhost:8000");
let isUpdateAllowed = true; // 업데이트 허용 여부를 나타내는 변수
//let lastUpdateTimestamp = new Date().getTime();
export default function Home() {
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [sensorLogs, setSensorLogs] = useState([]);
  useEffect(() => {
    socket.on("mqtt-message", handleMessage);
  }, []);

  const handleMessage = (message) => {
    const setting = JSON.parse(localStorage.getItem("setting"));

    console.log(message);
    const parseMessage = JSON.parse(message);
    console.log("test", isUpdateAllowed);
    if (parseMessage["value"]) {
      return;
    }
    if (parseMessage["temperature"] && parseMessage["humidity"]) {
      setHumidity(parseMessage["humidity"]);
      setTemperature(parseMessage["temperature"]);
      if (
        parseInt(parseMessage["temperature"]) < parseInt(setting["temperatureMin"]) ||
        parseInt(parseMessage["temperature"]) > parseInt(setting["temperatureMax"])
      ) {
        if (isUpdateAllowed) {
          console.log("allow", isUpdateAllowed);
          setSensorLogs((prev) => [
            ...prev,
            {
              temperature: parseMessage["temperature"],
              humidity: parseMessage["humidity"],
              time: new Date().toString(),
            },
          ]);
          socket.emit("send-message", JSON.stringify({ value: "temperature" }));
          // 업데이트가 발생한 후 1분 동안은 업데이트를 허용하지 않음
          isUpdateAllowed = false;
          setTimeout(() => {
            isUpdateAllowed = true;
          }, 60000);
        }
      } else if (
        parseInt(parseMessage["humidity"]) < parseInt(setting["humidityMin"]) ||
        parseInt(parseMessage["humidity"]) > parseInt(setting["humidityMax"])
      ) {
        if (isUpdateAllowed) {
          setSensorLogs((prev) => [
            ...prev,
            {
              temperature: parseMessage["temperature"],
              humidity: parseMessage["humidity"],
              time: new Date().toString(),
            },
          ]);
          socket.emit("send-message", JSON.stringify({ value: "humidity" }));
          // 업데이트가 발생한 후 1분 동안은 업데이트를 허용하지 않음
          isUpdateAllowed = false;
          setTimeout(() => {
            isUpdateAllowed = true;
          }, 60000);
        }
      }
    } else {
      console.log("no", message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-96">
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-2 gap-4 mb-6 h-2/5">
            <div className="bg-white shadow-md rounded-md p-6">
              <div className="text-center">
                <svg
                  className="w-6 h-6 inline-block mb-2 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm0 1a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm10-1a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm-1.208 3.874l-1.5-3A3.978 3.978 0 0 0 12 8c0-2.206-1.794-4-4-4S4 5.794 4 8c0 .93.317 1.781.843 2.474l-1.5 3A1 1 0 0 0 4.207 15H15.79a1 1 0 0 0 .707-1.628z"
                    clipRule="evenodd"
                  />
                </svg>
                <h2 className="text-xl font-medium">온도</h2>
                <span className="text-3xl font-bold">{temperature}°C</span>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-md p-6">
              <div className="text-center">
                <svg
                  className="w-6 h-6 inline-block mb-2 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm0 1a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm10-1a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm-1.208 3.874l-1.5-3A3.978 3.978 0 0 0 12 8c0-2.206-1.794-4-4-4S4 5.794 4 8c0 .93.317 1.781.843 2.474l-1.5 3A1 1 0 0 0 4.207 15H15.79a1 1 0 0 0 .707-1.628z"
                    clipRule="evenodd"
                  />
                </svg>
                <h2 className="text-xl font-medium">습도</h2>
                <span className="text-3xl font-bold">{humidity}%</span>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-md p-6 overflow-scroll h-[600px]">
            <h2 className="text-xl font-semibold mb-4">이상 온습도 기록</h2>
            <table className="w-full table-auto ">
              <thead>
                <tr>
                  <th className="border px-3 py-2">온도</th>
                  <th className="border px-3 py-2">습도</th>
                  <th className="border px-3 py-2">시간</th>
                </tr>
              </thead>
              <tbody>
                {sensorLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="border px-3 py-2">{log.temperature}°C</td>
                    <td className="border px-3 py-2">{log.humidity}%</td>
                    <td className="border px-4 py-2">{dayjs(log.time).format("YYYY-MM-DD HH:mm")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <a href="/setting" className="self-end p-2 mt-2 bg-green-300 rounded font-semibold ">
            온습도 설정
          </a>
        </div>
      </div>
    </div>
  );
}
