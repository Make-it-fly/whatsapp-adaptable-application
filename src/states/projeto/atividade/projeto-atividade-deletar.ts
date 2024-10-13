import State from "../../../whatsapp/state";
import IState from "../../../whatsapp/interfaces/state";
import { PersonNumber } from "../../../whatsapp/types/types";
import { ProjetoManager } from "../../../classes/projeto-manager";

class ProjetoAtividadeDeletarState extends State implements IState {

  public async render(personNumber: PersonNumber): Promise<void> {
    const projetoSelecionado = ProjetoManager.getInstance().getProjetoSelecionado(personNumber)
    let message = `Vamos deletar uma atividade do projeto *${projetoSelecionado.nome}*!`
    await this.client.sendMessage(personNumber, message, {
      type: "list",
      footer: "Escolha uma atividade abaixo",
      //Renderiza todas as atividades como opções de lista
      options: projetoSelecionado.getAllAtividade().map(atividade => {
        return { name: atividade.nome.length > 24 ? atividade.nome.slice(0, 21) + '...' : atividade.nome } // Limita para até 24 caracteres, limite que a Api da Meta impõe para o nome das listas
      })
    });
  }
  public async handleOption(body: string, personNumber: string) {
    if (body.toLowerCase().replace(" ", "") == 'cancelar') {
      return this.cancel(personNumber)
    }
    const projetoSelecionado = this.fluxManager.manager.getProjetoSelecionado(personNumber);
    const atividadeParaDeletar = projetoSelecionado.getAtividade(body.replace("...", ""));
    const deletingName = atividadeParaDeletar.nome
    const sendingMessage = `A atividade *${deletingName}* foi excluída, no projeto: *${projetoSelecionado.nome}*. `
    projetoSelecionado.removerAtividade(atividadeParaDeletar.nome);
    await this.fluxManager.client.sendMessage(personNumber, sendingMessage);
    this.fluxManager.setPersonState(personNumber, "projeto-gerenciar").render(personNumber)
  }
}

export default ProjetoAtividadeDeletarState;
