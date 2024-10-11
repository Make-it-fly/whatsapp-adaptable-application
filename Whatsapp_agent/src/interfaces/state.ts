import ChatHandler from "../handlers/chatHandler";
import { PersonNumber } from "../types/types";

interface IState {
  handler: ChatHandler;
  handleOption(option: string | number, personNumber: PersonNumber): void;
  call?(personNumber: PersonNumber): Promise<void>;
  sendMessage?(number: string | number, message: string, otherProps?: any): Promise<any>;
  cancel(personNumber: PersonNumber): void;
}

export default IState;
