import * as React from "react";
import {
  DialogueRoom,
  Dialogue,
  Register,
  sendMessage,
  VerticalLine,
  Chats,
} from "../ts/frontend";

import Logo from "./logo.png";
import BannerLeft from "./banner_left.png";
import { useEffect, useState } from "react";
import { AuthProvider, UseAuthUser } from "../ts/contexts";
import { useDialogue, DialogueProvider } from "../ts/dialogue_context";
import { socket } from "../ts/socket";
//<input type="button" value="Отправить" className="btn-danger" />

export function MessForm() {
  return (
    <div className="form_form">
      <div className="form_message">
        <DialogueRoom />
      </div>
    </div>
  );
}

export function ChatForm() {
  return (
    <form id="chatForm">
      <div className="form_form"></div>
    </form>
  );
}

export function QueryUser() {
  let { SelectDialogue } = useDialogue();
  const [peerName, setPeerName] = useState("");
  return (
    <div className="queryUser">
      <textarea
        name="message"
        id="message"
        className="form-control"
        placeholder="Введите пользователя"
        onChange={(event) => {
          setPeerName(event.target.value);
        }}
      ></textarea>
      <br />
      <br />
      <br />
      <input
        type="button" // Changed from "button" to "submit" for form submission
        value="Отправить"
        className="btn-danger"
        onClick={async () => {
          SelectDialogue(peerName);
          socket.emit("update", "hey :D");
        }}
      />
    </div>
  );
}

export function SendMessage() {
  let { dialogue } = useDialogue();
  const [message, setMessage] = React.useState("");

  async function handleOnClickSendingMessage(dialogue: Dialogue, text: string) {
    if (text.length === 0) {
      return;
    }

    if (dialogue.name === undefined) return;

    //SelectDialogue(dialogue.name);

    if (dialogue.peer_id === -1) {
      return;
    }

    console.log("wrote something?", dialogue, text);
    const userId = window.localStorage.getItem("userid");
    if (userId === null) {
      return;
    }

    if (dialogue === null) {
      return;
    }

    await sendMessage({
      id: 0,
      sender_id: +userId,
      peer_id: dialogue.peer_id,
      text: text,
    });
  }

  const handleInput = (event: any) => {
    setMessage(event.target.value);
  };

  return (
    <div className="send_message">
      <textarea
        name="message"
        id="message"
        className="form-control"
        placeholder="Введите сообщение"
        onChange={handleInput}
        value={message}
      ></textarea>
      <br />
      <br />
      <br />
      <input
        type="button" // Changed from "button" to "submit" for form submission
        value="Отправить"
        className="btn-danger"
        onClick={async () => {
          setMessage("");
          if (dialogue !== null) {
            await handleOnClickSendingMessage(dialogue, message);
          }
        }}
      />
    </div>
  );
}

function AB() {
  let { LogOut } = UseAuthUser();
  let { isDialogueActive } = useDialogue();

  return (
    <>
      <div className="header_container">
        <img src={Logo} alt="Logo" />
        <div className="return_to_registration">
          <a
            onClick={async () => {
              await LogOut();
            }}
          >
            <p>Выйти</p>
          </a>
        </div>
      </div>

      <div className="main">
        <div className="chat_form_container">
          <div className="chat_form_description">
            <h2>Чаты</h2>
            <h3>Сообщения</h3>
          </div>
          <Chats />
          <VerticalLine />
          {isDialogueActive ? (
            <>
              <SendMessage />
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}

export function RegisterOrMain() {
  let { isLoggedIn } = UseAuthUser();

  return isLoggedIn ? (
    <DialogueProvider>
      <AB />
    </DialogueProvider>
  ) : (
    <Register />
  );
}

export default function MyApp() {
  return (
    <AuthProvider>
      <RegisterOrMain />
    </AuthProvider>
  );
}
