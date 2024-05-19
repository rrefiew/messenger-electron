export interface UserMessage {
  id: number;
  text: string;
  sender_id: number;
  peer_id: number;
  attachment_id?: number;
}
