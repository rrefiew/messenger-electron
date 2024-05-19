import * as SharedTypes from "../../../shared_types/types";
import * as React from "react";
import io from "socket.io-client";

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

export function ChatMessage({
  message_id,
  message_text,
}: {
  message_id: number;
  message_text: string;
}) {
  return (
    <div>
      <p>{message_text}</p>
    </div>
  );
}
const socket = io(SiteLocation);
socket.connect();

setInterval(() => {
  console.log("aaaa");
  sendMessage({
    id: 0,
    peer_id: 100,
    sender_id: 0,
    text: "heyheyhey!",
  });
}, 5000);

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

  socket.on("update", (updatedData) => {
    const fetchMessages = async () => {
      console.log("socket on updated data fetch messages");
      if (current_dialogue !== null) {
        setMessages(await getLastMessages(+userId, current_dialogue, 15));
      }
    };

    fetchMessages();
  });

  React.useEffect(() => {
    const fetchMessages = async () => {
      console.log("fetchmessages");
      if (current_dialogue !== null) {
        setMessages(await getLastMessages(+userId, current_dialogue, 15));
      }
    };

    fetchMessages(); // Call the async function
  }, [userId, current_dialogue]); // Dependencies: re-run effect if these values change

  return (
    <div>
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
