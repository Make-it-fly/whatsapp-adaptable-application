import WhatsAppClientOficial from "./clients/WhatsAppClientOficial";
import ChatHandler from "./handlers/chatHandler";
import { IMessageData } from "./interfaces/message-data";


const app = new WhatsAppClientOficial();
const chatHandler = new ChatHandler(app)


app.start().catch((error) => {
  console.error("Error initializing WhatsApp Client:", error);
});

// Example of how to use the on method to handle events
app.on('message', (msg: IMessageData) => {
  chatHandler.handle(msg)
});

app.on('ready', () => {
  console.log('WhatsApp Client is ready!');
});
