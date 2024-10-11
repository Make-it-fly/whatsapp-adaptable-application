import qrcode from "qrcode-terminal";
import WhatsAppWeb, { Buttons, List, Message } from "whatsapp-web.js";
import dotenv from "dotenv";
import { IMessageClient } from '../interfaces/message-client';
import { IMessageData } from "../interfaces/message-data";
import { PossibleClients } from "../types/types";
const { Client, LocalAuth } = WhatsAppWeb;
dotenv.config();

export default class WhatsAppClient implements IMessageClient {
  private client: WhatsAppWeb.Client;
  private eventCallbacks: { [event: string]: Function[] } = {};

  constructor() { }

  async start(): Promise<void> {
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: './authenticator' }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    console.log("Initializing WhatsApp Client...");

    this.client.on('qr', (qr: string) => {
      console.log("Scan QRCode for authentication");
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('Client is ready!');
      this.triggerEvent('ready');
    });

    this.client.on('message', async (msg: Message) => {
      const messageData: IMessageData = {
        body: msg.body,
        personNumber: msg.from.split("@")[0],
        deviceType: msg.deviceType,
        msg,
        personName: msg["_data"].notifyName
      }
      this.triggerEvent('message', messageData);
    });

    await this.client.initialize();
  }

  async sendMessage(number: string | number, message: string, otherProps?: any): Promise<any> {
    const chatId = `${number}@c.us`;
    return this.client.sendMessage(chatId, message, otherProps);
  }

  on(event: string, callback: Function): void {
    if (!this.eventCallbacks[event]) {
      this.eventCallbacks[event] = [];
    }
    this.eventCallbacks[event].push(callback);
  }

  getClientType(): PossibleClients {
    return 'whatsappjs'
  }

  private triggerEvent(event: string, data?: any): void {
    const callbacks = this.eventCallbacks[event];
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}
