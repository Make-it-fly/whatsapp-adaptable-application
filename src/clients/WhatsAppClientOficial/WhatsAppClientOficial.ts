import dotenv, { config } from "dotenv";
import express, { Application } from 'express';
import { IMessageClient, ISendMessageConfigs } from "../../whatsapp/interfaces/message-client";
import { IMessageData } from "../../whatsapp/interfaces/message-data";
import { PossibleClients } from "../../whatsapp/types/types";
import AppError from "../../whatsapp/errors/AppError";
dotenv.config();

export default class WhatsAppClientOficial implements IMessageClient {
  private eventCallbacks: { [event: string]: Function[] } = {};

  constructor() { }

  async start(): Promise<void> {
    const server: Application = express();
    /* const httpsOptions = {
      key: fs.readFileSync(path.join(process.cwd(), 'ssl', 'server.key')),
      cert: fs.readFileSync(path.join(process.cwd(), 'ssl', 'server.cert'))
    }; */

    server.use(express.json());

    server.post('/webhook', (req, res) => {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        body.entry.forEach(entry => {
          entry.changes.forEach(change => {
            const field = change.field;

            // Verifica se o evento está relacionado a mensagens
            if (field === 'messages') {
              if (change.value.messages) {
                const messageData: IMessageData | undefined = this._treatData(change.value);
                if (messageData) {
                  this._triggerEvent('message', messageData);
                }
              }
            }
            // Tratando confirmação de entrega
            else if (field === 'statuses') {
              const statusData = change.value;
              this._triggerEvent('status', statusData);
            }
            // Outros tipos de eventos que podem ser relevantes
            else if (field === 'account_update') {
              const accountData = change.value;
              this._triggerEvent('account_update', accountData);
            }
            // Outros eventos ou tratamento padrão para campos desconhecidos
            else {
              console.log('Evento desconhecido ou não tratado:', field);
            }
          });
        });
        res.status(200).send('EVENT_RECEIVED');
      } else {
        res.sendStatus(404);  // Caso não seja do tipo whatsapp_business_account
      }
    });


    server.get("/webhook", (req, res) => {
      const challenge = req.query["hub.challenge"];
      const mode = req.query["hub.mode"];
      const verify_token = req.query["hub.verify_token"];

      if (mode == "subscribe" && verify_token == process.env.WPPOFICIAL_VERIFICATION_TOKEN) {
        return res.status(200).send(challenge)
      }
      res.status(400).send()
    })
    //https.createServer(httpsOptions, server).listen(process.env.WPPOFICIAL_MESSAGE_WEBHOOK_PORT, () => {
    server.listen(process.env.WPPOFICIAL_MESSAGE_WEBHOOK_PORT, () => {
      console.log(`Webhook WhatsApp Oficial escutando na porta HTTPS ${process.env.WPPOFICIAL_MESSAGE_WEBHOOK_PORT}`);
      this._triggerEvent('ready');
    });
  }

  async sendMessage(number: string | number, message: string, configs?: ISendMessageConfigs, otherProps?: any): Promise<any> {
    console.log(`Enviando para: ${number}, mensagem: ${message}`)
    if (configs?.type == 'buttons') {
      return await this._fetchSendButtonsMessage(number.toString(), message, configs)
    }
    if (configs?.type == 'list') {
      return await this._fetchSendListsMessage(number.toString(), message, configs)
    }
    await this._fetchSendMessage(number.toString(), message, configs);
  }

  on(event: string, callback: Function): void {
    if (!this.eventCallbacks[event]) {
      this.eventCallbacks[event] = [];
    }
    this.eventCallbacks[event].push(callback);
  }

  getClientType(): PossibleClients {
    return "oficial"
  }

  private async _triggerEvent(event: string, data?: any): Promise<void> {
    const callbacks = this.eventCallbacks[event];
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  private async _fetchSendMessage(number: string, message: string, configs?: ISendMessageConfigs) {
    try {
      const response = await fetch(`https://graph.facebook.com/${process.env.WPPOFICIAL_VERSION}/${process.env.WPPOFICIAL_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.WPPOFICIAL_TOKEN}`
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: number,
          type: "text",
          text: {
            preview_url: false,
            body: message
          }
        })
      })
      if (!response.ok) {
        throw new AppError(`Erro ao enviar mensagem para o numero: ${number}. conteudo: ${message}`)
      }

      const data = await response.json();
    } catch (error) {
      console.error(error)
    }
  }
  private async _fetchSendButtonsMessage(number: string, message: string, configs: ISendMessageConfigs) {
    try {
      if (!configs.options) throw new AppError("_fetchSendButtonsMessage chamado sem especificar botões.");
      const buttons = configs.options.map((option, i) => {
        return {
          "type": "reply",
          "reply": {
            "id": i,
            "title": option.name
          }
        }
      })
      const response = await fetch(`https://graph.facebook.com/${process.env.WPPOFICIAL_VERSION}/${process.env.WPPOFICIAL_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.WPPOFICIAL_TOKEN}`
        },
        body: JSON.stringify({
          "messaging_product": "whatsapp",
          "recipient_type": "individual",
          "to": number,
          "type": "interactive",
          "interactive": {
            "type": "button",
            "header": {
              "type": "text",
              "text": configs?.header || ""
            },
            "body": {
              "text": message
            },
            "footer": {
              "text": configs?.footer || "Escolha uma das opções abaixo"
            },
            "action": {
              "buttons": buttons
            }
          }
        })
      })
      if (!response.ok) {
        throw new AppError(`Erro ao enviar mensagem para o numero: ${number}. conteudo: ${message}`)
      }

      const data = await response.json();
      console.log(data)

    } catch (error) {
      console.error(error)
    }
  }
  private async _fetchSendListsMessage(number: string, message: string, configs: ISendMessageConfigs) {
    try {
      if (!configs.options) throw new AppError("_fetchSendListsMessage chamado sem especificar opções.");
      const options = configs.options.map((option, i) => {
        return {
          "id": `<LIST_SECTION_${i + 1}_ROW_${i + 1}_ID>`,
          "title": option.name
        }
      })
      const response = await fetch(`https://graph.facebook.com/${process.env.WPPOFICIAL_VERSION}/${process.env.WPPOFICIAL_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.WPPOFICIAL_TOKEN}`
        },
        body: JSON.stringify({
          "messaging_product": "whatsapp",
          "recipient_type": "individual",
          "to": number,
          "type": "interactive",
          "interactive": {
            "type": "list",
            "header": {
              "type": "text",
              "text": configs?.header || ""
            },
            "body": {
              "text": message
            },
            "footer": {
              "text": configs?.footer || ""
            },
            "action": {
              "button": configs?.listButtonName || "Abrir opções",
              "sections": [
                {
                  title: "Escolha uma opção",
                  rows: options
                }
              ]
            }
          }
        })
      })
      if (!response.ok) {
        throw new AppError(`Erro ao enviar mensagem para o numero: ${number}. conteudo: ${message}`)
      }

      const data = await response.json();
      console.log(data)

    } catch (error) {
      console.error(error)
    }
  }
  private _treatData(body): IMessageData | undefined {
    try {
      if (body.messages) {
        const messageData: IMessageData = {
          body: "",
          personNumber: body.messages[0].from,
          personName: body.contacts[0]?.profile?.name || ""
        };
        if (!body.messages[0].text) {
          if (!body.messages[0]?.interactive) return
          if (body.messages[0].interactive.type == 'list_reply') {
            messageData.body = body.messages[0].interactive.list_reply.title
          }
        } else {
          messageData.body = body.messages[0].text.body
        }
        return messageData
      }
    } catch (error) {
      console.error("Erro ao tratar dados: ", error)
      try {
        const messageData: IMessageData = {
          body: "Algo deu errado",
          personNumber: body?.messages[0]?.from || ""
        }
        return messageData
      } catch (error) {
        console.error("Erro ao retornar mensagem de erro", error)
      }
      return
    }
  }
}
