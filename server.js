const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3000;

// Подключение к PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cloudai",
  password: "1234",
  port: 5432,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
// Статические файлы: css, img и т.д.
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// Отображение HTML (если ты хочешь отдать конкретный файл)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Formauto.html"));
});

// Обработка формы регистрации
app.post("/register", async (req, res) => {
  const { login, pass, email } = req.body;

  try {
    await pool.query(
      "INSERT INTO users (login, password, email) VALUES ($1, $2, $3)",
      [login, pass, email]
    );
    res.send("ok");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при регистрации");
  }
});

//  Обработка формы авторизации
app.post("/login", async (req, res) => {
  const { login, pass } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE login = $1 AND password = $2",
      [login, pass]
    );

    if (result.rows.length > 0) {
      // Если пользователь найден — отправим логин
      res.json({ success: true, login: result.rows[0].login });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Неверный логин или пароль" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при авторизации");
  }
});

// Получить данные пользователя
app.get("/user", async (req, res) => {
  const { login } = req.query;

  try {
    const result = await pool.query(
      "SELECT login, email FROM users WHERE login = $1",
      [login]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Обновление пароля пользователя
app.post("/update-password", async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ success: false, message: "Недостаточно данных" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE login = $2",
      [password, login]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Пользователь не найден" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// Получить текущий email по логину
app.get("/get-user", async (req, res) => {
  const { login } = req.query;
  try {
    const result = await pool.query("SELECT email FROM users WHERE login = $1", [login]);
    if (result.rows.length > 0) {
      res.json({ email: result.rows[0].email });
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка на сервере" });
  }
});

// Обновить профиль
app.post("/update-profile", async (req, res) => {
  const { currentLogin, newLogin, email, password } = req.body;

  try {
    // Проверка на существующий логин (если изменяется)
    if (currentLogin !== newLogin) {
      const check = await pool.query("SELECT * FROM users WHERE login = $1", [newLogin]);
      if (check.rows.length > 0) {
        return res.status(400).json({ success: false, message: "Такой логин уже занят" });
      }
    }

    // Обновление
    if (password) {
      await pool.query(
        "UPDATE users SET login = $1, email = $2, password = $3 WHERE login = $4",
        [newLogin, email, password, currentLogin]
      );
    } else {
      await pool.query(
        "UPDATE users SET login = $1, email = $2 WHERE login = $3",
        [newLogin, email, currentLogin]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Ошибка при обновлении профиля" });
  }
});

//Прокси-запрос на Python FastAPI
app.post("/chat", async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:8081/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Ошибка при проксировании:", error);
    res.status(500).json({ error: "Ошибка при обращении к Python-серверу" });
  }
});

app.listen(port, () => {
  console.log(`Node.js сервер работает на http://localhost:${port}`);
});
