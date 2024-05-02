// Функция для установки cookie

const SiteLocation = "http://localhost:3000";

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

async function getFirstUserIdFromName(username) {
  try {
    const response = await fetch(
      `${SiteLocation}/users/get_user_id_from_name/${username}`
    );
    const user_id_json = await response.json();
    if (user_id_json.length > 0) {
      return user_id_json[0].id;
    } else {
      throw new Error("User ID not found");
    }
  } catch (error) {
    console.log(error);
    return null; // or handle the error as needed
  }
}

async function checkIfPasswordIsCorrect(user_id, password) {
  try {
    const response = await fetch(
      `${SiteLocation}/danger_zone/users/get_is_user_password_correct/id/${user_id}/password/${password}`
    );
    const is_password_correct_json = await response.json();
    return is_password_correct_json.isCorrect;
  } catch (error) {
    console.log(error);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("submButtonEntry")
    .addEventListener("click", function (event) {
      let username = document.getElementById("username").value;
      let password = document.getElementById("password").value;

      // THIS WORKS
      getFirstUserIdFromName(username).then((user_id) => {
        if (user_id == null) {
          console.log(
            "TODO: Add implementation for kickcing user because he has no name"
          );
          return;
        }
        checkIfPasswordIsCorrect(user_id, username).then((isCorrect) => {
          if (!isCorrect) {
            alert("Неверный пароль!");
          } else {
            alert("Вы угадали пароль йей :)");
          }
        });
      });
    });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("submButtonRegistr")
    .addEventListener("click", function (event) {
      console.log("Tried to registrate!");

      // Получение значений полей формы
      let username = document.getElementById("username").value;
      let password = document.getElementById("password").value;

      let user_id = getUserIdFromName(username);
      // Значить пользователь уже существует с таким именем. Таких мы не регестрируем.
      if (user_id != null) {
        // TODO: Добавить функцию которая говорит пользователю что он говнарь попытался использовать уже созданный ник
        console.log("TODO: Add implementation");
        return;
      }

      // TODO: Add Insert

      return;
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
      // Если аккаунт не существует, устана��ливаем cookie и продолжаем отправку формы
      setCookie(username, "registered", 365); // Устанавливаем cookie на 365 дней
      // После успешной отправки формы перенаправляем пользователя
      window.location.href = "index.html";
    });
});
