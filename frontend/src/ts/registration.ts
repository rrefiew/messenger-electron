const SiteLocation = "http://localhost:3001";

async function insertNewUserIntoDatabase(
  new_user_username: string,
  new_user_password: string
) {
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

export async function getFirstUserIdFromName(username: string) {
  try {
    const response = await fetch(
      `${SiteLocation}/users/get_user_id_from_name/${username}`
    );
    if (response.status === 201) {
      let a = await response.json();
      console.log(a);
      return a;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null; // or handle the error as needed
  }
}

export async function checkIfPasswordIsCorrect(
  user_id: number,
  password: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${SiteLocation}/danger_zone/users/get_is_user_password_correct/id/${user_id}/password/${password}`
    );
    return response.ok;
  } catch (error) {
    console.log(error);
    return false;
  }
}

//export function HandleLogin(username: string, password: string): boolean {}

export async function HandleRegistration(username: string, password: string) {
  console.log("Tried to registrate!");

  // Получение значений полей формы
  if (username === "" || password === "") {
    return false;
  }
  try {
    // добавить проверку на существование пользователя
    try {
      getFirstUserIdFromName(username).catch();
      let userExists;
      userExists = !!(await getFirstUserIdFromName(username));
      console.log(userExists);
      if (userExists) {
        return false;
      }
    } catch (_e) {
      console.log(_e);
      return false;
    }

    console.log("userExists");

    let response = await insertNewUserIntoDatabase(username, password);
    if (!response) {
      return false;
    }

    try {
      window.localStorage.setItem(
        "userid",
        await getFirstUserIdFromName(username)
      );
      return true;
    } catch (_e) {
      console.log("Could not create localstorage! We cannot procceed");
      return false;
    }
  } catch (_e) {
    return false;
  }
}
