import {
  createContext,
  FC,
  memo,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import dotenv from "dotenv";

import { User } from "../../../shared_types/types";
import { setSyntheticTrailingComments } from "typescript";

const SiteLocation = "https://quagunesop.beget.app";

export class Dialogue {
  peer_id: number;
  name?: string;
  constructor(peer: number, name?: string) {
    this.peer_id = peer;
    this.name = name;
  }
}

interface DialogueProps {
  dialogue: Dialogue | null;
  isDialogueActive: boolean;
  SelectDialogue: (peerName: string) => Promise<boolean>;
  DeselectDialogue: () => Promise<boolean>;
  StartDialogue: (dialogueId: number) => Promise<boolean>;
}
export const DialoguePropsContext = createContext<DialogueProps>(
  {} as DialogueProps
);

interface DialogueProvider {
  children: ReactNode;
}

export const DialogueProvider: FC<DialogueProvider> = memo(({ children }) => {
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [isDialogueActive, setIsDialogueActive] = useState(true);

  async function SelectDialogue(peerName: string) {
    try {
      let response = await fetch(
        `${SiteLocation}/users/get_user_id_from_name/${peerName}`
      );

      const peer_id = +(await response.json());
      let new_dialogue = new Dialogue(peer_id, peerName);
      setDialogue(new_dialogue);
      setIsDialogueActive(true);
      return true;
    } catch (_e) {
      console.log(_e);
      return false;
    }
  }
  async function DeselectDialogue() {
    setDialogue(null);
    setIsDialogueActive(false);
    return false;
  }
  async function StartDialogue(dialogueId: number) {
    return false;
  }

  return (
    <DialoguePropsContext.Provider
      value={{
        dialogue,
        isDialogueActive,
        SelectDialogue,
        DeselectDialogue,
        StartDialogue,
      }}
    >
      {children}
    </DialoguePropsContext.Provider>
  );
});

export function useDialogue() {
  return useContext(DialoguePropsContext);
}
