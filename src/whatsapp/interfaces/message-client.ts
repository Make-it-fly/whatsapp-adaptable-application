import { PossibleClients } from "../whatsapp/types/types";

export interface IMessageClient {
  start(): Promise<void>;
  //sendMessage(number: string | number, message: string, otherProps?: any): Promise<any>;
  sendMessage(number: string | number, message: string, configs?: ISendMessageConfigs, otherProps?: any): Promise<any>;
  on(event: string, callback: Function): any;
  getClientType(): PossibleClients;
}

export interface ISendMessageConfigs {
  options?: ISendMessageOption[],
  header?: string,
  footer?: string,
  listButtonName?: string,
  type?: 'buttons' | 'list' | 'buttons-or-list' | 'media'
}

export interface ISendMessageOption {
  name: string
}