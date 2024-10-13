import State from "../whatsapp/state";
import FluxManager from "../whatsapp/fluxManager";
import IState from "../whatsapp/interfaces/state";
import { PersonNumber } from "../whatsapp/types/types";
import { ProjetoManager } from "../classes/projeto-manager";

class WelcomeState extends State implements IState {

  constructor(fluxManager: FluxManager) {
    super(fluxManager)
    this.optionsMap = {
      'Gerir um projeto': this.handleOption1,
      'Criar um projeto': this.handleOption2,
      'Listar tudo': this.handleOption3,
    };
  }

  public async render(personNumber: PersonNumber) {
    const message = "*Olá, vamos gerir nossas atividades? Escolha uma das opções:*"
      + `\n _Temos um total de *${this.fluxManager.manager.contarProjetos()}* projetos ativos_`
    await this.fluxManager.client.sendMessage(personNumber, message, {
      type: "list",
      listOptions: [
        {
          sectionName: "Projetos", rows: [
            { name: "Gerir um projeto", description: "Administra um projeto já existente." },
            { name: "Criar um projeto", description: "Cria projetos novos de acordo com a descrição informada." },
            { name: "Listar tudo", description: "Lista todos os projetos existentes." },
          ]
        }
      ]
    });
  }

  private handleOption1 = async (personNumber: string) => {
    this.fluxManager.setPersonState(personNumber, "selecionar-projeto").render(personNumber);
  };

  private handleOption2 = async (personNumber: string) => {
    this.fluxManager.setPersonState(personNumber, "projeto-criar").render(personNumber);
  };

  private handleOption3 = async (personNumber: string) => {
    if (ProjetoManager.getInstance().projetos.length > 0) {
      const message = ProjetoManager.getInstance().descreverProjetos()
      await this.fluxManager.client.sendMessage(personNumber, message);
      this.render(personNumber)
    } else {
      await this.fluxManager.client.sendMessage(personNumber, "Ainda não temos nenhum projeto ativo.")
      this.render(personNumber)
    }
  };
}

export default WelcomeState;
