import { PersonNumber } from "../whatsapp/types/types";

export interface IMessageData {
  msg?: any,
  personNumber: PersonNumber,
  body: string,
  personName?: string,
  deviceType?: string
}