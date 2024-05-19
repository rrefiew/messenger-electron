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

async function insertNewUserIntoDatabase(new_user_username, new_user_password) {
  try {
    const response = await fetch(
      `${SiteLocation}/danger_zone/users/insert_new_user_into_database/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: new_user_username,
          password: new_user_password,
        }),
      }
    );
    return response.ok;
  } catch (error) {
    console.log(error);
    return null;
  }
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

    return response;
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
      if (username === "" || password === "") {
        return;
      }
      // THIS WORKS
      getFirstUserIdFromName(username).then((user_id) => {
        if (user_id == null) {
          console.log(
            "TODO: Add implementation for kickcing user because he has no name"
          );
          return;
        }
        checkIfPasswordIsCorrect(user_id, password).then((isCorrect) => {
          if (!isCorrect) {
            console.log("Neverniy parol");
          } else {
            window.location.href = "index.html";
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
      if (username === "" || password === "") {
        return;
      }

      // добавить проверку на существование пользователя
      insertNewUserIntoDatabase(username, password).then((response) => {
        console.log("New user created " + response);
        if (response) {
          window.location.href = "index.html";
        }
      });

      // TODO: Add Insert
      return;
      let user = getCookie(`${username}`);

      // Проверка наличия cookie с именем пользователя
      if (user != "") {
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
