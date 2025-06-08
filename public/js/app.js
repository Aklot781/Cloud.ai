const express = require("express");
const cors = require("cors");
const app = express();

// Настройка CORS
app.use(cors()); // Это разрешит все источники

// Обработка POST-запроса на /chat
app.post("/chat", (req, res) => {
  //код обработки запроса
  res.send("Response from chat endpoint"); // Пример ответа
});

// Запуск сервера на порту 8081
app.listen(8081, () => {
  console.log("Сервер запущен на порту 8081");
});
