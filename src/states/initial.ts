import State from "../classes/state";
import ChatHandler from "../handlers/chatHandler";
import IState from "../interfaces/state";

class InitialState extends State implements IState {
    constructor(chatHandler: ChatHandler) {
        super(chatHandler)
        this.optionsMap = {
            'Gerir um projeto': this.handleOption1,
            'Criar um projeto': this.handleOption2,
            'Listar tudo': this.handleOption3,
        };
    }

    private handleOption1 = async (personNumber: string) => {
        const message = 'Perfeito, digite o nome do projeto que você quer gerenciar';
        await this.handler.client.sendMessage(personNumber, message);
        this.handler.setPersonState(personNumber, "initial-selecionar-projeto");
    };

    private handleOption2 = async (personNumber: string) => {
        const message = 'Perfeito, vamos criar um novo projeto. Primeiramente, como será o nome dele?';
        await this.handler.client.sendMessage(personNumber, message);
        this.handler.setPersonState(personNumber, "projeto-criar");
    };

    private handleOption3 = async (personNumber: string) => {
        if (this.manager.projetos.length > 0) {
            const message = this.manager.descreverProjetos()
            await this.handler.client.sendMessage(personNumber, message);
            this.handler.setPersonState(personNumber, "start");
        } else {
            await this.handler.client.sendMessage(personNumber, "Ainda não temos nenhum projeto ativo.")
            this.handler.setPersonState(personNumber, "start");
        }
    };

}

export default InitialState;
