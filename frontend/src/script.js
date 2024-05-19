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
    if (response.status === 201) {
      return await response.json();
    } else {
      return null;
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
    .addEventListener("click", async function (event) {
      let username = document.getElementById("username").value;
      let password = document.getElementById("password").value;
      if (username === "" || password === "") {
        return;
      }
      // THIS WORKS
      getFirstUserIdFromName(username).then(async (user_id) => {
        if (user_id == null) {
          console.log(
            "TODO: Add implementation for kickcing user because he has no name"
          );
          return;
        }
        let isPasswordCorrect = await checkIfPasswordIsCorrect(
          user_id,
          password
        );

        try {
          window.localStorage.setItem(
            "userid",
            await getFirstUserIdFromName(username)
          );
        } catch (_e) {
          console.log("Could not create localstorage! We cannot procceed");
          return;
        }
      });

      if (!isCorrect) {
        console.log("Neverniy parol");
      } else {
        window.location.href = "index.html";
      }
    });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("submButtonRegistr")
    .addEventListener("click", async function (event) {
      console.log("Tried to registrate!");

      // Получение значений полей формы
      let username = document.getElementById("username").value;
      let password = document.getElementById("password").value;
      if (username === "" || password === "") {
        return;
      }

      // добавить проверку на существование пользователя
      try {
        let userExists;
        userExists = !!(await getFirstUserIdFromName(username));
        console.log(userExists);
        if (userExists) {
          return;
        }
      } catch (_e) {
        console.log(_e);
        return;
      }

      console.log("userExists");
      let response = await insertNewUserIntoDatabase(username, password);

      if (!response) {
        return;
      }

      try {
        window.localStorage.setItem(
          "userid",
          await getFirstUserIdFromName(username)
        );
      } catch (_e) {
        console.log("Could not create localstorage! We cannot procceed");
        return;
      }

      window.location.href = "index.html";
    });
});
