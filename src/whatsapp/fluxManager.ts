import { ProjetoManager } from "../classes/projeto-manager";
import { IMessageClient } from "./interfaces/message-client";
import { IMessageData } from "./interfaces/message-data";
import IState from "./interfaces/state";
import InitialState from "../states/initial";
import InitialSelecionarProjetoState from "../states/projeto/initial-selecionar-projeto";
import ProjetoAtividadeDeletarState from "../states/projeto/atividade/projeto-atividade-deletar";
import ProjetoGerenciar from "../states/projeto/projeto-gerenciar";
import StartState from "../states/start";
import { PersonNumber } from "./types/types";
import ProjetoCriarState from "../states/projeto/projeto-criar";
import ProjetoAtividadeCriarState from "../states/projeto/atividade/projeto-atividade-criar";
import ProjetoAtividadeAlterarState from "../states/projeto/atividade/projeto-atividade-alterar";

const allowedNumbers = [
    '5524981017270',
    '5512982825404',
];

interface StateMap {
    [key: string]: IState
}

interface IChatStates {
    [key: string]: {
        lastMessageDate: number,
        state: string,
        pix?: {
            to?: string,
            value: string,
        },
        vars?: any
    }
}

class FluxManager {
    private personStates: IChatStates;
    stateMap: StateMap;
    manager: ProjetoManager;
    client: IMessageClient;

    constructor(client: IMessageClient) {
        this.personStates = {};
        this.client = client;
        this.manager = ProjetoManager.getInstance()
        this.stateMap = {
            "start": new StartState(this),
            "initial": new InitialState(this),
            "initial-selecionar-projeto": new InitialSelecionarProjetoState(this),
            "projeto-criar": new ProjetoCriarState(this),
            "projeto-gerenciar": new ProjetoGerenciar(this),
            "projeto-atividade-criar": new ProjetoAtividadeCriarState(this),
            "projeto-atividade-alterar": new ProjetoAtividadeAlterarState(this),
            "projeto-atividade-deletar": new ProjetoAtividadeDeletarState(this)
        };
    }

    checkPermission({ personNumber, personName }: { personNumber: PersonNumber, personName: string | null | undefined }): boolean {
        const allowed = allowedNumbers.includes(personNumber.toString());
        if (!allowed) {
            console.log(`Acesso não autorizado: ${personNumber} ${personName ? ("(" + personName + ")") : ""}`);
        }
        return allowed;
    }

    async handle({ personName, deviceType, body, personNumber, msg }: IMessageData) {
        if (!this.checkPermission({ personNumber, personName })) return;
        this.configUserState(personNumber);
        const state = this.getPersonState(personNumber);

        console.log(`Acesso: ${personNumber} (${personName}) Estado: ${state}`)

        if (state === "start") {
            return this.stateMap.start.render(personNumber);
        }

        const currentStateHandler: IState = this.stateMap[state];
        try {
            if (currentStateHandler) {
                return currentStateHandler.handleOption(body, personNumber);
            } else {
                return this.client.sendMessage(personNumber, "Não entendi, por favor, escolha uma das opções disponíveis.");
            }
        } catch (error) {
            this.client.sendMessage(personNumber, "ERRO: Algo deu errado, por favor avise o time de suporte!");
        }
    }

    configUserState(personNumber: string | number) {
        if (!this.personStates[personNumber]) {
            this.personStates[personNumber] = {
                lastMessageDate: Date.now(),
                state: 'start'
            };
        }
    }

    getPersonState(personNumber: PersonNumber) {
        return this.personStates[personNumber].state;
    }

    getPersonStateInstance(personNumber: PersonNumber) {
        return this.personStates[personNumber];
    }

    setPersonState(personNumber: PersonNumber, state: string) {
        this.personStates[personNumber].state = state;
        this.personStates[personNumber].lastMessageDate = Date.now();
    }

    resetPersonState(personNumber: PersonNumber) {
        delete this.personStates[personNumber]
        this.configUserState(personNumber)
    }
}

export default FluxManager;
