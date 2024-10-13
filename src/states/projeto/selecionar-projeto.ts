import State from "../../whatsapp/state";
import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import { PersonNumber } from "../../whatsapp/types/types";
import { ProjetoManager } from "../../classes/projeto-manager";

class SelecionarProjetoState extends State implements IState {

  public async render(personNumber: PersonNumber): Promise<void> {
    const message = 'Digite o nome do projeto que você quer gerenciar';
    await this.fluxManager.client.sendMessage(personNumber, message);
  }

  public async handleOption(body: string | number, personNumber: string) {
    const projetoManager = ProjetoManager.getInstance();
    const projeto = projetoManager.obterProjeto(body.toString().trim().toLowerCase())
    if (projeto) {
      projetoManager.selecionarProjeto(personNumber, projeto)
      this.fluxManager.setPersonState(personNumber, "projeto-gerenciar").render(personNumber)
    } else {
      await this.fluxManager.client.sendMessage(personNumber, `Projeto com nome "${body}" não encontrado!`);
      await this.fluxManager.setPersonState(personNumber, "welcome").render(personNumber)
    }
  }

}

export default SelecionarProjetoState;
