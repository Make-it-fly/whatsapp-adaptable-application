import { Projeto } from "../../classes/projeto";
import State from "../../classes/state";
import IState from "../../interfaces/state";


class ProjetoCriarState extends State implements IState {

    public async handleOption(body: string | number, personNumber: string) {
        const novoProjeto = new Projeto(body.toString())
        this.manager.adicionarProjeto(novoProjeto)
        const sendingMessage = `Maravilha, o projeto com o nome: *${novoProjeto.nome}* foi criado. `
        console.log(this.manager.listarProjetos())
        await this.handler.client.sendMessage(personNumber, sendingMessage);
        this.handler.setPersonState(personNumber, "projeto-gerenciar");
        this.manager.selecionarProjeto(personNumber, novoProjeto)
        this.handler.stateMap["projeto-gerenciar"].call!(personNumber);
    }
}

export default ProjetoCriarState;
