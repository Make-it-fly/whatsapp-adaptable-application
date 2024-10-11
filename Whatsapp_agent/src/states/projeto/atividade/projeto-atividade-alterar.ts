import State from "../../../classes/state";
import IState from "../../../interfaces/state";

class ProjetoAtividadeAlterarState extends State implements IState {

  public async handleOption(body: string | number, personNumber: string) {
    const projetoSelecionado = this.handler.manager.getProjetoSelecionado(personNumber);
    console.log('projetoSelecionado', projetoSelecionado)
    const atividadeParaAlterar = projetoSelecionado.getAtividade(body.toString());
    console.log('atividadeParaAlterar', atividadeParaAlterar)
    const oldName = atividadeParaAlterar.nome
    atividadeParaAlterar.nome = body.toString();
    const sendingMessage = `O nome da atividade foi renomeado de *${oldName}* para *${atividadeParaAlterar.nome}* no projeto: *${projetoSelecionado.nome}*. `
    await this.handler.client.sendMessage(personNumber, sendingMessage);
    this.handler.setPersonState(personNumber, "projeto-gerenciar")
    this.handler.stateMap["projeto-gerenciar"].call!(personNumber);
  }
}

export default ProjetoAtividadeAlterarState;
