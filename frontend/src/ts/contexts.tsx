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

interface UserProps {
  User: User | null;
  isLoggedIn: boolean;
  LogIn: (username: string, password: string) => Promise<number>;
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
    setLoggedInUser({ id: 0, username: username, password: password });
    setIsLoggedIn(true);
    console.log("LoggedInUser", User);
    return 1;
  }
  async function LogOut() {
    console.log("LogOut");
    setLoggedInUser(null);
    setIsLoggedIn(false);
    return false;
  }
  async function SignIn(username: string, password: string) {
    console.log("SignIn");
    return 3;
  }

  return (
    <UserPropsContext.Provider
      value={{ User, isLoggedIn, LogIn, LogOut, SignIn }}
    >
      {children}
    </UserPropsContext.Provider>
  );
});

export function UseAuthUser() {
  return useContext(UserPropsContext);
}
