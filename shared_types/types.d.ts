export interface UserMessage {
  id: number;
  text: string;
  sender_id: number;
  peer_id: number;
  attachment_id?: number;
}

export interface ChatPreview {
  message: UserMessage;
  peerName: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
}
