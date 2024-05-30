import * as SharedTypes from "../../../shared_types/types";
import * as React from "react";
import { redirectDocument, redirect, Link } from "react-router-dom";
import { socket } from "./socket";
import Kot from "../html/kot.png";
import { useState } from "react";
import { HandleRegistration, HandleLogin } from "./registration";
import { UseAuthUser } from "./contexts";

export class Dialogue {
  peer_id: number;
  name?: string;
  constructor(peer: number, name?: string) {
    this.peer_id = peer;
    this.name = name;
  }
}

const SiteLocation = "http://localhost:3001";

export let current_dialogue: Dialogue | null = null;

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

export function setNewDialogue(dialogue: Dialogue) {
  if (!dialogue.name) {
    return;
  }

  try {
    const b = async () => {
      let response = await fetch(
        `${SiteLocation}/users/get_user_id_from_name/${dialogue.name}`
      );

      dialogue.peer_id = +(await response.json());
      return dialogue;
    };

    b().then((aa) => {
      current_dialogue = aa;
    });
  } catch (_e: any) {
    console.log(_e);
    return;
  }
}

export function handleNameOnEnterClickedPressedWtf(dialogue: Dialogue) {
  setNewDialogue(dialogue);

  socket.emit("update", "hey :D");
}

export function handleOnClickSendingMessage(dialogue: Dialogue, text: string) {
  if (text.length === 0) {
    return;
  }
  if (current_dialogue === null) {
    return;
  }

  setNewDialogue(dialogue);

  if (current_dialogue.peer_id === -1) {
    return;
  }
  const a = async () => {
    const userId = window.localStorage.getItem("userid");
    if (userId === null) {
      return;
    }

    if (current_dialogue === null) {
      return;
    }

    await sendMessage({
      id: 0,
      sender_id: +userId,
      peer_id: current_dialogue.peer_id,
      text: text,
    });
  };

  a();
}

function LoginForm() {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let { LogIn } = UseAuthUser();

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
          onClick={async () => await HandleRegistration(username, password)}
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
  if (userId === null) {
    return (
      <div>
        <p>Please login!</p>
      </div>
    );
  }

  if (current_dialogue === null) {
    return <>Please select a dialogue</>;
  }

  const [messages, setMessages] = React.useState<SharedTypes.UserMessage[]>([]);

  React.useEffect(() => {
    const fetchMessages = async () => {
      console.log("fetchmessages");
      if (current_dialogue !== null) {
        setMessages(await getLastMessages(+userId, current_dialogue, 10));
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
  }, [userId, current_dialogue]); // Dependencies: re-run effect if these values change

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
