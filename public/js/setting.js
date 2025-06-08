document.addEventListener("DOMContentLoaded", async () => {
  const login = localStorage.getItem("userLogin");
  const loginField = document.getElementById("login");
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const settingsForm = document.getElementById("settings-form");
  const settingsMessage = document.getElementById("settings-message");

  if (!login) {
    window.location.href = "Formauto.html"; // не авторизован
    return;
  }

  // Получить текущие данные пользователя
  try {
    const res = await fetch(`/user?login=${login}`);
    const user = await res.json();

    if (res.ok && user) {
      loginField.value = user.login;
      emailField.value = user.email || "";
    } else {
      settingsMessage.textContent = "❌ Не удалось загрузить данные пользователя.";
    }
  } catch (err) {
    console.error(err);
    settingsMessage.textContent = "❌ Ошибка загрузки данных.";
  }

  // Обновление пароля
  settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = passwordField.value;

    if (!newPassword) {
      settingsMessage.textContent = "Введите новый пароль или оставьте поле пустым.";
      settingsMessage.style.color = "orange";
      return;
    }

    try {
      const res = await fetch("/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, password: newPassword })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        settingsMessage.textContent = "✅ Пароль обновлен!";
        settingsMessage.style.color = "green";
        settingsForm.reset();
      } else {
        settingsMessage.textContent = "❌ " + result.message;
        settingsMessage.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      settingsMessage.textContent = "❌ Ошибка при обновлении пароля.";
      settingsMessage.style.color = "red";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const settingsForm = document.getElementById("settings-form");
  const settingsMessage = document.getElementById("settings-message");

  const loginInput = document.getElementById("login");
  const emailInput = document.getElementById("email");

  // Подставим текущий логин
  const currentLogin = localStorage.getItem("userLogin");
  if (currentLogin) {
    loginInput.value = currentLogin;
  }

  // Загрузка текущего email с сервера
  fetch(`/get-user?login=${currentLogin}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.email) emailInput.value = data.email;
    });

  settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      currentLogin: currentLogin,
      newLogin: loginInput.value,
      email: emailInput.value,
      password: document.getElementById("password").value,
    };

    try {
      const res = await fetch("/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        settingsMessage.textContent = "✅ Профиль обновлён!";
        settingsMessage.style.color = "green";

        // Если логин изменён, обновим localStorage
        if (data.newLogin !== currentLogin) {
          localStorage.setItem("userLogin", data.newLogin);
        }
      } else {
        settingsMessage.textContent = "❌ " + result.message;
        settingsMessage.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      settingsMessage.textContent = "❌ Ошибка сервера.";
      settingsMessage.style.color = "red";
    }
  });
});
