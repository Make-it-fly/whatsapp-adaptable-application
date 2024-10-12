import State from "../../classes/state";
import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../interfaces/state";

class InitialSelecionarProjetoState extends State implements IState {

  public async handleOption(body: string | number, personNumber: string) {
    const projeto = this.manager.obterProjeto(body.toString().trim().toLowerCase())
    this.manager.selecionarProjeto(personNumber, projeto)
    if (projeto) {
      this.handler.stateMap["projeto-gerenciar"].call!(personNumber)
    } else {
      await this.handler.client.sendMessage(personNumber, `Projeto com nome "${body}" não encontrado!`);
      this.handler.setPersonState(personNumber, "start")
    }
  }

}

export default InitialSelecionarProjetoState;
