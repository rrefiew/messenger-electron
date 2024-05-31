import * as React from "react";
import { redirectDocument, redirect, Link } from "react-router-dom";
import { socket } from "./socket";
import Kot from "../html/kot.png";
import { useState } from "react";
import { UseAuthUser } from "./contexts";

import * as SharedTypes from "../../../shared_types/types";
import { useDialogue } from "./dialogue_context";

export class Dialogue {
  peer_id: number;
  name?: string;
  constructor(peer: number, name?: string) {
    this.peer_id = peer;
    this.name = name;
  }
}

const SiteLocation = "http://localhost:3001";

export async function sendMessage(
  message: SharedTypes.UserMessage
): Promise<boolean> {
  try {
    const response = await fetch(
      `${SiteLocation}/danger_zone/messages/send_message/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peer_id: message.peer_id,
          sender_id: message.sender_id,
          text: message.text,
        }),
      }
    );
  } catch (_e: any) {
    return false;
  }

  return true;
}

async function getLastMessages(
  user_id: number,
  dialogue: Dialogue,
  n: number
): Promise<SharedTypes.UserMessage[]> {
  let response = await fetch(
    `${SiteLocation}/danger_zone/messages/get_messages/sender_id/${user_id}/peer_id/${dialogue.peer_id}/number_of_messages/${n}`
  );
  console.log(response);
  if (response.ok) {
    let value: SharedTypes.UserMessage[] = await response.json();

    return value;
  } else {
    Promise.reject(new Error(`Something went wrong` + response));
  }
  return [];
}

function LoginForm() {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let { LogIn, SignIn, LogInWithSecret } = UseAuthUser();

  return (
    <form id="loginForm">
      <label htmlFor="username">Никнейм:</label>
      <input
        type="text"
        id="username"
        name="username"
        onChange={(username) => setUsername(username.target.value)}
        required
      />
      <br />
      <label htmlFor="password">Пароль:</label>
      <input
        type="password"
        id="password"
        name="password"
        required
        onChange={(password) => {
          setPassword(password.target.value);
        }}
      />
      <br />
      <br />
      <div className="entry_container">
        <input
          type="button"
          id="submButtonRegistr"
          value="Зарегистрироваться"
          onClick={async () => {
            await SignIn(username, password);
            await LogInWithSecret("0");
          }}
        />
        <p className="login button">
          Уже есть аккаунт?
          <input
            type="button"
            id="submButtonEntry"
            value="Войти"
            onClick={async () => await LogIn(username, password)}
          />
        </p>
      </div>
      <div className="loginFormKot">
        <img src={Kot} alt="Kot.png" />
      </div>
    </form>
  );
}

export function Register() {
  let { LogInWithSecret } = UseAuthUser();

  React.useEffect(() => {
    const a = async () => await LogInWithSecret("");
    a();
  }, []);

  return (
    <div className="loginFormContainer">
      <div className="loginFormTitle">
        <h1>Добро пожаловать в Nesil!</h1>
      </div>
      <div className="loginFormDescription">
        <h3>
          Пожалуйста, пройди регистрацию или войди в уже существующий аккаунт
        </h3>
      </div>
      <LoginForm></LoginForm>
    </div>
  );
}

export function ChatMessage({
  message_id,
  message_text,
  was_sent_by_us,
}: {
  message_id: number;
  message_text: string;
  was_sent_by_us: boolean;
}) {
  let us_class_name = () => {
    if (!was_sent_by_us) {
      return "message_otherus".toString();
    }
    return "message_us".toString();
  };
  return (
    <>
      <p className={us_class_name()}>{message_text}</p>
    </>
  );
}

export function DialogueRoom() {
  const userId = window.localStorage.getItem("userid");

  let { dialogue } = useDialogue();

  if (userId === null) {
    return (
      <div>
        <p>Please login!</p>
      </div>
    );
  }

  const [messages, setMessages] = React.useState<SharedTypes.UserMessage[]>([]);

  React.useEffect(() => {
    const fetchMessages = async () => {
      console.log("fetchmessages");
      if (dialogue !== null) {
        setMessages(await getLastMessages(+userId, dialogue, 10));
      }
    };

    const handler = (updatedData: any) => {
      console.log("socket on updated data fetch messages");
      fetchMessages();
    };

    socket.on("update", handler);
    fetchMessages();
    //fetchMessages(); // Call the async function
    return () => {
      socket.off("update", handler);
    };
  }, [userId, dialogue]); // Dependencies: re-run effect if these values change

  const us_class_name = (was_sent_by_us: boolean) => {
    if (!was_sent_by_us) {
      return "form_message_otherus".toString();
    }
    return "form_message_us".toString();
  };

  return (
    <>
      {messages &&
        messages.map((msg) => (
          //is_us: boolean = ;
          <div className={us_class_name(+userId === msg.sender_id)}>
            <ChatMessage
              key={msg.id}
              message_id={msg.id}
              message_text={msg.text}
              was_sent_by_us={+userId === msg.sender_id}
            ></ChatMessage>
          </div>
        ))}
    </>
  );
}
