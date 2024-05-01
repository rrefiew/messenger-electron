// Функция для установки cookie
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("submButtonRegistr")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Предотвращаем стандартную отправку формы
      console.log("Tried to registrate!");
      // Получение значений полей формы
      let username = document.getElementById("username").value;
      let password = document.getElementById("password").value;
      let user = getCookie(`${username}`);

      if (username === "" || password === "") {
        alert("Пожалуйста, заполните все поля.");
        return; // Прекращаем выполнение функции, если поля пустые
      }
      // Проверка наличия cookie с именем пользователя
      else if (user != "") {
        alert("Welcome again " + user);
      } else {
        user = `${username}`;
        if (user != "" && user != null) {
          setCookie("username", user, 30); // Исправлено время жизни cookie
        }
      }
      // Если аккаунт не существует, устанавливаем cookie и продолжаем отправку формы
      setCookie(username, "registered", 365); // Устанавливаем cookie на 365 дней
      // После успешной отправки формы перенаправляем пользователя
      window.location.href = "index.html";
    });
});
