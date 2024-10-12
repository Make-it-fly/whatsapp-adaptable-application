import State from "../../../classes/state";
import IState from "../../../interfaces/state";

class ProjetoAtividadeDeletarState extends State implements IState {

  public async handleOption(body: string, personNumber: string) {
    const projetoSelecionado = this.handler.manager.getProjetoSelecionado(personNumber);

    const atividadeParaDeletar = projetoSelecionado.getAtividade(body.replace("...", ""));
    const deletingName = atividadeParaDeletar.nome
    const sendingMessage = `A atividade *${deletingName}* foi excluída, no projeto: *${projetoSelecionado.nome}*. `
    projetoSelecionado.removerAtividade(atividadeParaDeletar.nome);
    await this.handler.client.sendMessage(personNumber, sendingMessage);
    this.handler.setPersonState(personNumber, "projeto-gerenciar")
    this.handler.stateMap["projeto-gerenciar"].call!(personNumber);
  }
}

export default ProjetoAtividadeDeletarState;
