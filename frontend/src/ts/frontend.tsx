import * as SharedTypes from "../../../shared_types/types";
import * as React from "react";
import { socket } from "./socket";

export class Dialogue {
  peer_id: number;
  constructor(peer: number) {
    this.peer_id = peer;
  }
}

const SiteLocation = "http://localhost:3001";

let current_dialogue: Dialogue | null = null;

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

export function handleOnClickSendingMessage(text: string) {
  if (text.length === 0) {
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

export function ChatMessage({
  message_id,
  message_text,
}: {
  message_id: number;
  message_text: string;
}) {
  return (
    <>
      <p className="message_otherus">{message_text}</p>
    </>
  );
}

export function DialogueRoom() {
  if (current_dialogue === null) {
    current_dialogue = new Dialogue(100);
  }
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

  return (
    <div className="form_message_otherus">
      {messages &&
        messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message_id={msg.id}
            message_text={msg.text}
          ></ChatMessage>
        ))}
    </div>
  );
}
