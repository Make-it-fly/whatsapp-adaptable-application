import { Atividade } from "../../../classes/atividade";
import State from "../../../classes/state";
import IState from "../../../interfaces/state";


class ProjetoAtividadeCriarState extends State implements IState {

  public async handleOption(body: string | number, personNumber: string) {
    const projetoSelecionado = this.handler.manager.getProjetoSelecionado(personNumber);

    const novaAtividade = new Atividade(body.toString(), projetoSelecionado);
    projetoSelecionado.adicionarAtividade(novaAtividade)
    const sendingMessage = `A atividade com o nome: *${novaAtividade.nome}* foi criada no projeto: *${projetoSelecionado.nome}*. `
    await this.handler.client.sendMessage(personNumber, sendingMessage);
    this.handler.setPersonState(personNumber, "projeto-gerenciar")
    this.handler.stateMap["projeto-gerenciar"].call!(personNumber);
  }
}

export default ProjetoAtividadeCriarState;
