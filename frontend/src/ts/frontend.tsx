import * as React from "react";
import { redirectDocument, redirect, Link } from "react-router-dom";
import { socket } from "./socket";
import Kot from "../html/kot.png";
import { useRef, useState } from "react";
import { UseAuthUser } from "./contexts";

import * as SharedTypes from "../../../shared_types/types";
import { useDialogue } from "./dialogue_context";
import { MessForm } from "../html/App";

export class Dialogue {
  peer_id: number;
  name?: string;
  constructor(peer: number, name?: string) {
    this.peer_id = peer;
    this.name = name;
  }
}

const SiteLocation = "https://quagunesop.beget.app";

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

async function getLastPreviews(
  userId: number
): Promise<SharedTypes.ChatPreview[]> {
  if (userId === -1)
    return Promise.reject(
      new Error("Something went wrong! User was not logged in")
    );
  let response = await fetch(
    `${SiteLocation}/danger_zone/messages/query_last_messages_sent_to_user/${userId}`
  );
  if (response.ok) {
    try {
      return await response.json();
    } catch (_e) {
      Promise.reject(new Error("Something went wrong" + response));
    }
  } else {
    Promise.reject(new Error("Something went wrong" + response));
  }
  return Promise.reject(
    new Error("Something went wrong! Could not fetch at getLastPreviews")
  );
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
          //Change this maybe?
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

export function VerticalLine() {
  return <div className="line_vertical"></div>;
}

export function Chat({
  nickname,
  lastMessage,
  peerId,
  onClick,
  isActive,
}: {
  nickname: string;
  lastMessage?: string;
  peerId?: number;
  onClick?: () => Promise<void>;
  isActive?: boolean;
}) {
  const { User } = UseAuthUser();
  const { SelectDialogue } = useDialogue();
  React.useEffect(() => {}, [lastMessage]);
  let style: any = {};
  if (peerId && User) {
    style = peerId === User.id ? { color: "black" } : { color: "#5F9EA0" };
  }
  return (
    <div
      className={isActive ? "chatBoxbuttonClicked" : "chatBox"}
      style={{ cursor: "pointer" }}
      onClick={async () => {
        if (onClick) {
          await onClick();
        }
        SelectDialogue(nickname);
        socket.emit("update", "wow");
      }}
    >
      <p className={!isActive ? "chatNick" : "chatNickBC"}>{nickname}</p>
      <p
        className={!isActive ? "chatLastmess" : "chatLastmessBC"}
        style={style}
      >
        {lastMessage ?? "..."}
      </p>
    </div>
  );
}

export function NickSearch() {
  const { SelectDialogue } = useDialogue();
  //const [dialogue, setDialogue] = React.useState<Dialogue | null>(null);
  const [peerName, setPeerName] = React.useState<string>("");
  let isActive = useRef(false);

  return (
    <div className="nickSearch" style={{ zIndex: 1 }}>
      <textarea
        name="nick"
        id="nick"
        className="nickSearch_container"
        placeholder="Введите никнейм"
        onChange={(event) => setPeerName(event.target.value)}
        onFocus={() => {
          isActive.current = true;
        }}
        onBlur={() => {
          isActive.current = false;
        }}
      ></textarea>
      <br />
      <br />
      <br />
      <input
        type="button"
        value="Подтвердить"
        className="btn_nick"
        onClick={async () => {
          console.log(`the name was: ${peerName}`);
          await SelectDialogue(peerName);
          socket.emit("update", "hey :D");
        }}
      />
    </div>
  );
}

export function Chats() {
  const { User } = UseAuthUser();
  const [previews, setPreviews] = useState<SharedTypes.ChatPreview[]>();
  const [activeChatPeer, setActiveChatPeer] = useState(-1);
  const [activeChatSender, setActiveChatSender] = useState(-1);
  React.useEffect(() => {
    const handler = (updatedData: any) => {
      console.log("socket on updated data fetch messages");
      getLastPreviews(User ? User.id : -1).then((value) => setPreviews(value));
    };
    socket.on("update", handler);
    getLastPreviews(User ? User.id : -1).then((value) => setPreviews(value));
    //fetchMessages(); // Call the async function
    return () => {
      socket.off("update", handler);
    };
  }, []);

  return (
    <div className="Chats">
      <form id="messForm">
        <div className="chatForm">
          {previews &&
            previews.map((preview) =>
              preview.message.peer_id !== preview.message.sender_id ? (
                <Chat
                  nickname={preview.peerName}
                  peerId={preview.message.peer_id}
                  lastMessage={preview.message.text}
                  isActive={
                    (activeChatPeer === preview.message.peer_id ||
                      activeChatPeer === preview.message.sender_id) &&
                    (activeChatSender === preview.message.sender_id ||
                      activeChatSender === preview.message.peer_id)
                  }
                  onClick={async () => {
                    setActiveChatPeer(preview.message.peer_id);
                    setActiveChatSender(preview.message.sender_id);
                  }}
                />
              ) : (
                <></>
              )
            )}
        </div>
        <MessForm />
      </form>
      <NickSearch />
    </div>
  );
}
