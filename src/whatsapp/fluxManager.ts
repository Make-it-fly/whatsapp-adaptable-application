import { ProjetoManager } from "../classes/projeto-manager";
import { IMessageClient } from "./interfaces/message-client";
import { IMessageData } from "./interfaces/message-data";
import IState from "./interfaces/state";
import fs from 'fs';
import path from 'path';
import { PersonNumber } from "./types/types";
import WelcomeState from "../states/welcome";
import SelecionarProjetoState from "../states/projeto/selecionar-projeto";
import ProjetoCriarState from "../states/projeto/projeto-criar";
import ProjetoGerenciar from "../states/projeto/projeto-gerenciar";
import ProjetoAtividadeCriarState from "../states/projeto/atividade/projeto-atividade-criar";
import ProjetoAtividadeAlterarState from "../states/projeto/atividade/projeto-atividade-alterar";
import ProjetoAtividadeDeletarState from "../states/projeto/atividade/projeto-atividade-deletar";

const allowedNumbers = [
    '5524981017270',
    '5512982825404',
];

interface StateMap {
    [key: string]: IState
}

interface IPeopleContext {
    [key: PersonNumber]: IPersonContext
}

interface IPersonContext {
    lastMessageDate: number,
    stateName: string,
    pix?: {
        to?: string,
        value: string,
    },
    vars?: any
}

class FluxManager {
    private peopleContext: IPeopleContext;
    stateMap: StateMap;
    projetoManager: ProjetoManager;
    client: IMessageClient;

    constructor(client: IMessageClient) {
        this.peopleContext = {};
        this.client = client;
        this.projetoManager = ProjetoManager.getInstance()
        this.stateMap = {
            "welcome": new WelcomeState(this),
            "selecionar-projeto": new SelecionarProjetoState(this),
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
        const { firstAccess } = this.configUserState(personNumber);
        if (firstAccess) {
            return this.getPersonState(personNumber).render(personNumber)
        } //Checa se é o primeiro acesso do usuário. Se sim, o welcomeState é chamado e a função é interrompida

        const personContext = this.getPersonContext(personNumber);
        const currentState: IState = this.stateMap[personContext.stateName];

        console.log(`Acesso: ${personNumber} (${personName}) Estado: ${personContext}`)
        try {
            if (currentState) {
                return currentState.handleOption(body, personNumber);
            } else {
                return this.client.sendMessage(personNumber, "Não entendi, por favor, escolha uma das opções disponíveis.");
            }
        } catch (error) {
            this.client.sendMessage(personNumber, "ERRO: Algo deu errado, por favor avise o time de suporte!");
        }
    }

    configUserState(personNumber: PersonNumber) {
        if (!this.peopleContext[personNumber]) {
            this.peopleContext[personNumber] = {
                lastMessageDate: Date.now(),
                stateName: 'welcome'
            };
            return { firstAccess: true }
        }
        return { firstAccess: false }
    }

    getPersonContext(personNumber: PersonNumber) {
        return this.peopleContext[personNumber];
    }

    getPersonState(personNumber: PersonNumber): IState {
        return this.stateMap[this.getPersonContext(personNumber).stateName];
    }

    setPersonState(personNumber: PersonNumber, stateName: string): IState {
        this.peopleContext[personNumber].stateName = stateName;
        this.getPersonContext(personNumber).lastMessageDate = Date.now();
        return this.stateMap[stateName]
    }

    resetPersonState(personNumber: PersonNumber) {
        delete this.peopleContext[personNumber]
        this.configUserState(personNumber)
    }

    private loadStates(): StateMap {
        const statesDir = path.resolve(__dirname, '../states');
        const stateMap: StateMap = {};

        const readStatesRecursively = (dir: string) => {
            fs.readdirSync(dir).forEach((file) => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    readStatesRecursively(fullPath);
                } else if (file.endsWith('.ts')) {
                    const stateName = path.basename(file, path.extname(file));
                    try {
                        const StateClass = require(fullPath).default;
                        if (StateClass && typeof StateClass === 'function') {
                            stateMap[stateName] = new StateClass(this);
                        }
                    } catch (error) {
                        console.error(`Erro ao importar o estado ${stateName}:`, error);
                    }
                }
            });
        };

        readStatesRecursively(statesDir);
        return stateMap;
    }
}

export default FluxManager;
