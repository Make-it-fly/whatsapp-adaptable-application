import FluxManager from "../whatsapp/fluxManager";
import { PersonNumber } from "../whatsapp/types/types";

interface IState {
  handler: FluxManager;
  handleOption(option: string | number, personNumber: PersonNumber): void;
  render?(personNumber: PersonNumber): Promise<void>;
  sendMessage?(number: string | number, message: string, otherProps?: any): Promise<any>;
  cancel(personNumber: PersonNumber): void;
}

export default IState;
