import * as SharedTypes from "../../../shared_types/types";
import * as React from "react";

export class Dialogue {
  peer_id: number;
  constructor(peer: number) {
    this.peer_id = peer;
  }
}

const SiteLocation = "http://localhost:3000";

let current_dialogue: Dialogue | null = null;

export async function sendMessage(
  message: SharedTypes.UserMessage
): Promise<boolean> {
  try {
    await fetch(
      `${SiteLocation}/danger_zone/messages/send_message/sender_id/${message.sender_id}/peer_id/${message.peer_id}/text/${message.text}`
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
      <p>message_text</p>
    </div>
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
    return <></>;
  }

  const [messages, setMessages] = React.useState<SharedTypes.UserMessage[]>([]);

  React.useEffect(() => {
    const fetchMessages = async () => {
      if (current_dialogue !== null) {
        getLastMessages(+userId, current_dialogue, 15);
      }
    };

    fetchMessages(); // Call the async function
  }, [userId, current_dialogue]); // Dependencies: re-run effect if these values change

  return (
    <div>
      {messages &&
        messages.map((msg) => (
          <ChatMessage
            message_id={msg.id}
            message_text={msg.text}
          ></ChatMessage>
        ))}
    </div>
  );
}
