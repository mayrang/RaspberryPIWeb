import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:8000");
export default function Setting() {
  const [temperatureMin, setTemperatureMin] = useState(0);
  const [temperatureMax, setTemperatureMax] = useState(0);
  const [humidityMin, setHumidityMin] = useState(0);
  const [humidityMax, setHumidityMax] = useState(0);
  const [temperatureAlarm, setTemperatureAlarm] = useState("");
  const [humidityAlarm, setHumidityAlarm] = useState("");
  const navigate = useNavigate();
  const handleSaveSettings = () => {
    if (isNaN(temperatureMin) || isNaN(temperatureMax) || isNaN(humidityMin) || isNaN(humidityMax)) {
      alert("온습도에는 숫자만 입력할 수 있습니다.");
      return;
    } else if (parseInt(temperatureMin) > parseInt(temperatureMax)) {
      alert("온습도 범위가 올바르지 않습니다.");
      return;
    } else if (parseInt(humidityMin) > parseInt(humidityMax) || humidityMin < 0 || humidityMax > 100) {
      alert("습도 범위가 올바르지 않습니다.");
      return;
    }
    localStorage.setItem("setting", JSON.stringify({ temperatureMin, temperatureMax, humidityMax, humidityMin }));
    socket.emit("send-message", JSON.stringify({ temperatureAlarm, humidityAlarm }));
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-96 bg-white shadow-md rounded-md p-6">
        <h2 className="text-xl font-medium mb-4">이상 온습도 설정</h2>
        <div className="space-y-4">
          <div className="">
            <div className="my-2">
              <label className="text-gray-600 ">온도 범위</label>
              <div className="flex items-center mt-2">
                <input
                  type="number"
                  className="border border-gray-300 rounded-md p-2 w-1/2"
                  value={temperatureMin}
                  onChange={(e) => setTemperatureMin(e.target.value)}
                />
                <span className="mx-2">~</span>
                <input
                  type="number"
                  className="border border-gray-300 rounded-md p-2 w-1/2"
                  value={temperatureMax}
                  onChange={(e) => setTemperatureMax(e.target.value)}
                />
              </div>
            </div>
            <div className="my-2">
              <label className="text-gray-600">습도 범위</label>
              <div className="flex items-center mt-2">
                <input
                  type="number"
                  className="border border-gray-300 rounded-md p-2 w-1/2"
                  value={humidityMin}
                  onChange={(e) => setHumidityMin(e.target.value)}
                />
                <span className="mx-2">~</span>
                <input
                  type="number"
                  className="border border-gray-300 rounded-md p-2 w-1/2"
                  value={humidityMax}
                  onChange={(e) => setHumidityMax(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <label className="text-gray-600">온도 알림음</label>
            <select
              className="border border-gray-300 rounded-md p-2 w-1/2"
              value={temperatureAlarm}
              onChange={(e) => setTemperatureAlarm(e.target.value)}
            >
              <option value="">없음</option>
              <option value="alarm1">알림음 1</option>
              <option value="alarm2">알림음 2</option>
              <option value="alarm3">알림음 3</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="text-gray-600">습도 알림음</label>
            <select
              className="border border-gray-300 rounded-md p-2 w-1/2"
              value={humidityAlarm}
              onChange={(e) => setHumidityAlarm(e.target.value)}
            >
              <option value="">없음</option>
              <option value="alarm1">알림음 1</option>
              <option value="alarm2">알림음 2</option>
              <option value="alarm3">알림음 3</option>
            </select>
          </div>
          <button
            className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600"
            onClick={handleSaveSettings}
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
}
