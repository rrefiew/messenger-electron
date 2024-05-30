import {
  createContext,
  FC,
  memo,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { User } from "../../../shared_types/types";
import { setSyntheticTrailingComments } from "typescript";
import {
  checkIfPasswordIsCorrect,
  getFirstUserIdFromName,
  insertNewUserIntoDatabase,
} from "./registration";

interface UserProps {
  User: User | null;
  isLoggedIn: boolean;
  LogIn: (username: string, password: string) => Promise<number>;
  LogInWithSecret: (secret: string) => Promise<boolean>;
  LogOut: () => Promise<boolean>;
  SignIn: (username: string, password: string) => Promise<number>;
}
export const UserPropsContext = createContext<UserProps>({} as UserProps);

interface UserAuthProvider {
  children: ReactNode;
}

export const AuthProvider: FC<UserAuthProvider> = memo(({ children }) => {
  const [User, setLoggedInUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  async function LogIn(username: string, password: string) {
    if (username === "" || password === "") {
      return null;
    }
    // THIS WORKS
    let user_id = await getFirstUserIdFromName(username);
    if (user_id == null) {
      console.log(
        "TODO: Add implementation for kickcing user because he has no name"
      );
    }
    console.log(
      await checkIfPasswordIsCorrect(user_id, password),
      user_id,
      password
    );
    if (!(await checkIfPasswordIsCorrect(user_id, password))) {
      console.log("Neverniy parol");
      return null;
    }

    try {
      window.localStorage.setItem("userid", user_id);
    } catch (_e) {
      console.log("Could not create localstorage! We cannot procceed");
      return null;
    }

    setLoggedInUser({ id: 0, username: username, password: password });
    setIsLoggedIn(true);
    console.log("LoggedInUser", User);
    return user_id;
  }
  async function LogOut() {
    console.log("LogOut");
    window.localStorage.clear();
    setLoggedInUser(null);
    setIsLoggedIn(false);
    return false;
  }

  async function LogInWithSecret(secret: string) {
    let secret_user_id = window.localStorage.getItem("userid");
    if (!secret_user_id) return false;
    console.log(secret_user_id);
    setIsLoggedIn(true);
    setLoggedInUser({ id: +secret_user_id, username: "", password: "" });
    return true;
    if (secret == secret_user_id) {
    }
    return false;
  }

  async function SignIn(username: string, password: string) {
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
        return window.localStorage.getitem("userid");
      } catch (_e) {
        console.log("Could not create localstorage! We cannot procceed");
        return null;
      }
    } catch (_e) {
      return null;
    }
  }

  return (
    <UserPropsContext.Provider
      value={{ User, isLoggedIn, LogIn, LogInWithSecret, LogOut, SignIn }}
    >
      {children}
    </UserPropsContext.Provider>
  );
});

export function UseAuthUser() {
  return useContext(UserPropsContext);
}
