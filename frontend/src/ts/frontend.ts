import * as SharedTypes from "../../../shared_types/types";

export class Dialogue {
  peer_id: number;
  constructor(peer: number) {
    this.peer_id = peer;
  }
}

const SiteLocation = "http://localhost:3000";

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
