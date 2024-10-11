import { ProjetoManager } from "../../classes/projeto-manager";
import State from "../../classes/state";
import ChatHandler from "../../handlers/chatHandler";
import IState from "../../interfaces/state";
import { PersonNumber } from "../../types/types";

class ProjetoGerenciar extends State implements IState {

  constructor(chatHandler: ChatHandler) {
    super(chatHandler)
    this.manager = ProjetoManager.getInstance()
    this.optionsMap = {
      'Listar Atividades': this.optionListarAtividades.bind(this),
      'Adicionar Atividade': this.optionCriarAtividade.bind(this),
      'Deletar Atividades': this.optionDeletarAtividade.bind(this),
    };
  }

  private async optionCriarAtividade(personNumber: PersonNumber) {
    const projetoSelecionado = this.manager.getProjetoSelecionado(personNumber)
    let message = `Muito bem, vamos adicionar uma nova atividade para o projeto *${projetoSelecionado.nome}*! Me diga o nome desta atividade!`;
    await this.client.sendMessage(personNumber, message);
    this.handler.setPersonState(personNumber, 'projeto-atividade-criar')
  }

  private async optionDeletarAtividade(personNumber: PersonNumber) {
    const projetoSelecionado = this.manager.getProjetoSelecionado(personNumber)
    if (projetoSelecionado.contarAtividades() > 0) {
      let message = `Vamos deletar uma atividade do projeto *${projetoSelecionado.nome}*!`
      await this.client.sendMessage(personNumber, message, {
        type: "list",
        footer: "Escolha uma atividade abaixo",
        options: projetoSelecionado.getAllAtividade().map(atividade => {
          return { name: atividade.nome.length > 24 ? atividade.nome.slice(0, 21) + '...' : atividade.nome }
        })
      });
      this.handler.setPersonState(personNumber, 'projeto-atividade-deletar')
    } else {
      await this.client.sendMessage(personNumber, `Ainda não há nenhuma atividade registrada no projeto *${projetoSelecionado.nome}*!`)
      this.call(personNumber)
    }
  }

  private async optionListarAtividades(personNumber: PersonNumber) {
    const projetoSelecionado = this.manager.getProjetoSelecionado(personNumber)
    let message = projetoSelecionado.descreverAtividades();
    await this.client.sendMessage(personNumber, message);
    this.call(personNumber)
  }

  public async call(personNumber: PersonNumber) {
    let message = ""
    const projetoSelecionado = this.manager.getProjetoSelecionado(personNumber)
    if (projetoSelecionado) {
      message = `Vamos gerenciar o projeto ${projetoSelecionado.nome}? O que deseja fazer neste projeto?`
    } else {
      message = 'Digite o nome do projeto que você quer gerenciar';
    }
    this.handler.setPersonState(personNumber, "projeto-gerenciar");
    await this.client.sendMessage(personNumber, message, projetoSelecionado ? {
      type: "list",
      options: [
        { name: "Listar Atividades​" },
        { name: "Adicionar Atividade" },
        { name: "Deletar Atividades" },
        { name: "Cancelar" },
      ]
    } : undefined);
  };

  public async handleOption(option: string, personNumber: PersonNumber) {
    if (option.toLowerCase().replace(" ", "") == 'cancelar') {
      return this.cancel(personNumber)
    }
    const projetoSelecionado = this.handler.manager.getProjetoSelecionado(personNumber)
    if (projetoSelecionado) {
      if (this.optionsMap[option]) {
        this.getAction(option)(personNumber);
      } else {
        const message = 'Opção inválida. Por favor, escolha uma das opções disponíveis.';
        await this.client.sendMessage(personNumber, message);
      }
    } else {
      const projeto = this.handler.manager.obterProjeto(option.toString())
      if (!projeto) {
        return this.client.sendMessage(personNumber, "Não encontrei esse projeto que você mencionou. Tem certeza que o nome é esse? Repita o nome, por favor. Ou escreva 'cancelar' para desistir")
      }

    }
  }
}

export default ProjetoGerenciar;
