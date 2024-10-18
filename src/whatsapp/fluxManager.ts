import { ProjetoManager } from "../classes/projeto-manager";
import { IMessageClient } from "./interfaces/message-client";
import { IMessageData } from "./interfaces/message-data";
import IState from "./interfaces/state";
import fs from 'fs';
import path from 'path';
import { PersonNumber } from "./types/types";
import WelcomeState from "../states/welcome";
import HelloUserState from "../states/hello-user";
import SaqueState from "../states/saque/saque";
import SaqueChooseKeyState from "../states/saque/saque-choose-key";
import SaqueEndState from "../states/saque/saque-end";
import BiometriaState from "../states/biometria";
import DepositarState from "../states/depositar/depositar";
import TransferirBetEndState from "../states/transferir-bet/transferir-bet-end";
import TransferirBetAmountState from "../states/transferir-bet/transferir-bet-amount";
import TransferirBetState from "../states/transferir-bet/transferir-bet";

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
            'hello-user': new HelloUserState(this),
            'biometria': new BiometriaState(this),
            'saque': new SaqueState(this),
            'saque-end': new SaqueEndState(this),
            'saque-choose-key': new SaqueChooseKeyState(this),
            'transferir-bet': new TransferirBetState(this),
            'transferir-bet-amount': new TransferirBetAmountState(this),
            'transferir-bet-end': new TransferirBetEndState(this),
            'depositar': new DepositarState(this),
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
                stateName: 'welcome',
                vars: {}
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
