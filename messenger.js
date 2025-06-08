document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("chat-form");
  const messageInput = document.getElementById("message-text");
  const messagesContainer = document.getElementById("messages");

  const greeting = document.querySelector(".greeting").innerText;

  const username = localStorage.getItem("userLogin") || "Пользователь";

  const greetingWithName = `
${greeting}
Ты должен обращаться к пользователю по имени: ${username}.
Ты должен не только говорить, но и описывать свои действия, как будто ты живой персонаж. 
Например: "*достаёт топор*", "*смеётся громко*", "*пристально смотрит на собеседника*".
Используй стиль, соответствующий твоей роли.
`;
  let history = [{ role: "system", content: greetingWithName }];

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    const userMessageElement = createMessageElement(
      userMessage,
      "user-message",
      history.length
    );
    messagesContainer.appendChild(userMessageElement);
    scrollToBottom();

    messageInput.value = "";
    history.push({ role: "user", content: userMessage });

    try {
      const response = await fetch(
        "http://localhost:8081/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: history,
          }),
        }
      );

      const data = await response.json();
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const botReply = data.choices[0].message.content;
        history.push({ role: "assistant", content: botReply });

        const botMessageElement = createMessageElement(
          botReply,
          "bot-message",
          history.length
        );
        messagesContainer.appendChild(botMessageElement);
        scrollToBottom();
      } else {
        throw new Error(data.error?.message || "Некорректный ответ от API.");
      }
    } catch (error) {
      console.error("Ошибка:", error.message);
      const errorMessageElement = createMessageElement(
        "Ошибка: " + error.message,
        "bot-message"
      );
      messagesContainer.appendChild(errorMessageElement);
      scrollToBottom();
    }
  });

  function createMessageElement(text, className, index) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", className);
    messageElement.innerText = text;

    // Показывать кнопки только для сообщений пользователя
    if (className === "user-message") {
      const controls = document.createElement("span");
      controls.style.marginLeft = "10px";

      const editBtn = document.createElement("button");
      editBtn.innerText = "✏️";
      editBtn.onclick = () => editMessage(index, messageElement);

      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "🗑️";
      deleteBtn.onclick = () => deleteMessage(index);

      controls.appendChild(editBtn);
      controls.appendChild(deleteBtn);
      messageElement.appendChild(controls);
    }

    return messageElement;
  }

  function editMessage(index, messageElement) {
    const oldText = history[index].content;
    const newText = prompt("Измените сообщение:", oldText);
    if (newText && newText !== oldText) {
      history[index].content = newText;
      messageElement.innerText = newText;

      // Обрезаем историю и DOM
      history = history.slice(0, index + 1);
      clearMessagesFromIndex(index + 1);

      // Повторная отправка и отображение ответа
      replayChatFrom(index);
    }
  }

  function deleteMessage(index) {
    history = history.slice(0, index);
    clearMessagesFromIndex(index - 1);
    replayChatFrom(index - 1);
  }
  function clearMessagesFromIndex(index) {
    const messages = messagesContainer.querySelectorAll(".message");
    messages.forEach((msgEl, i) => {
      if (i >= index) {
        msgEl.remove();
      }
    });
  }

  async function replayChatFrom(startIndex) {
    for (let i = startIndex + 1; i < history.length; i++) {
      const msg = history[i];
      const msgElement = createMessageElement(
        msg.content,
        msg.role === "user" ? "user-message" : "bot-message",
        i
      );
      messagesContainer.appendChild(msgElement);
    }

    if (history[history.length - 1].role === "user") {
      // Отправить заново и получить новый ответ
      try {
        const response = await fetch(
          "http://localhost:8081/v1/chat/completions",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: history,
            }),
          }
        );

        const data = await response.json();
        const botReply = data.choices[0].message.content;
        history.push({ role: "assistant", content: botReply });

        const botMessageElement = createMessageElement(
          botReply,
          "bot-message",
          history.length
        );
        messagesContainer.appendChild(botMessageElement);
        scrollToBottom();
      } catch (error) {
        console.error("Ошибка при пересоздании:", error.message);
      }
    }
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
