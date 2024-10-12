import State from "../classes/state";
import IState from "../whatsapp/interfaces/state";
import { PersonNumber } from "../whatsapp/types/types";

class StartState extends State implements IState {

  public async render(personNumber: PersonNumber) {
    const message = "*Olá, vamos gerir nossas atividades? Escolha uma das opções:*"
      + `\n _Temos um total de *${this.handler.manager.contarProjetos()}* projetos ativos_`
    await this.handler.client.sendMessage(personNumber, message, {
      type: "list",
      options: [
        { name: "Gerir um projeto" },
        { name: "Criar um projeto" },
        { name: "Listar tudo" },
      ]
    });
    this.handler.setPersonState(personNumber, "initial");
  }
}

export default StartState;
