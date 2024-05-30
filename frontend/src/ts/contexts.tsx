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

interface UserProps {
  User: User | null;
  isLoggedIn: boolean;
  LogIn: (username: string, password: string) => Promise<number>;
  LogOut: (username: string, password: string) => Promise<boolean>;
  SignIn: (username: string, password: string) => Promise<number>;
}
//@ts-ignore
export const UserPropsContext = createContext<UserProps>({
  User: null,
  isLoggedIn: false,
});

interface UserAuthProvider {
  children: ReactNode;
}

export const AuthProvider: FC<UserAuthProvider> = memo(({ children }) => {
  const [User, setLoggedInUser] = useState<User | null>(null);
  const isLoggedIn = true;

  async function LogIn(username: string, password: string) {
    console.log("LogIn");
    return 1;
  }
  async function LogOut(username: string, password: string) {
    console.log("LogOut");
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
