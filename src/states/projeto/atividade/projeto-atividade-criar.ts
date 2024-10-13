import { Atividade } from "../../../classes/atividade";
import State from "../../../whatsapp/state";
import IState from "../../../whatsapp/interfaces/state";
import { PersonNumber } from "../../../whatsapp/types/types";
import { ProjetoManager } from "../../../classes/projeto-manager";


class ProjetoAtividadeCriarState extends State implements IState {

  public async render(personNumber: PersonNumber): Promise<void> {
    const projetoSelecionado = ProjetoManager.getInstance().getProjetoSelecionado(personNumber)
    let message = `Muito bem, vamos adicionar uma nova atividade para o projeto *${projetoSelecionado.nome}*! Me diga o nome desta atividade!`;
    await this.client.sendMessage(personNumber, message);
  }

  public async handleOption(body: string | number, personNumber: string) {
    const projetoSelecionado = this.fluxManager.manager.getProjetoSelecionado(personNumber);

    const novaAtividade = new Atividade(body.toString(), projetoSelecionado);
    projetoSelecionado.adicionarAtividade(novaAtividade)
    const sendingMessage = `A atividade com o nome: *${novaAtividade.nome}* foi criada no projeto: *${projetoSelecionado.nome}*. `
    await this.fluxManager.client.sendMessage(personNumber, sendingMessage);
    this.fluxManager.setPersonState(personNumber, "projeto-gerenciar").render(personNumber)
  }
}

export default ProjetoAtividadeCriarState;
