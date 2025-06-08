document.addEventListener("DOMContentLoaded", () => {
  // === РЕГИСТРАЦИЯ ===
  const registerForm = document.getElementById("register-form");
  const registerMessage = document.getElementById("register-message");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(registerForm);
      const data = new URLSearchParams(formData);

      try {
        const res = await fetch("/register", {
          method: "POST",
          body: data,
        });

        const text = await res.text();

        if (res.ok) {
          registerMessage.textContent = "✅ Регистрация прошла успешно!";
          registerMessage.style.color = "green";
          registerForm.reset();
        } else {
          registerMessage.textContent = "❌ Ошибка при регистрации: " + text;
          registerMessage.style.color = "red";
        }
      } catch (err) {
        console.error(err);
        registerMessage.textContent = "❌ Ошибка при отправке данных.";
        registerMessage.style.color = "red";
      }
    });
  }

  // === АВТОРИЗАЦИЯ ===
  const loginForm = document.getElementById("login-form");
  const loginMessage = document.getElementById("login-message");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const data = new URLSearchParams(formData);

      try {
        const res = await fetch("/login", {
          method: "POST",
          body: data,
        });

        const result = await res.json();

        if (res.ok && result.success) {
          localStorage.setItem("userLogin", result.login);
          window.location.href = "profile.html";
        } else {
          loginMessage.textContent =
            "❌ " + (result.message || "Ошибка при входе");
          loginMessage.style.color = "red";
        }
      } catch (err) {
        console.error(err);
        loginMessage.textContent = "❌ Ошибка сервера при авторизации.";
        loginMessage.style.color = "red";
      }
    });
  }

  // === ПОДСТАВИТЬ ЛОГИН И КНОПКУ ===
  const profileTitle = document.querySelector(".profile-title");
  const authBtn = document.getElementById("auth-btn");
  const user = localStorage.getItem("userLogin");

  if (profileTitle && user) {
    profileTitle.textContent = user;
  }

  if (authBtn) {
    if (user) {
      authBtn.textContent = "Выйти";
      authBtn.addEventListener("click", () => {
        localStorage.removeItem("userLogin");
        window.location.href = "Formauto.html";
      });
    } else {
      authBtn.textContent = "Войти";
      authBtn.addEventListener("click", () => {
        window.location.href = "Formauto.html";
      });
    }
  }
});
