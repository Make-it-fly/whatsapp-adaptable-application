import State from "../../whatsapp/state";
import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import { PersonNumber } from "../../whatsapp/types/types";

class DepositarState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {};
    }

    public async render(personNumber: PersonNumber) {
        await this.fluxManager.client.sendMessage(personNumber, "Para depositar em sua conta utilize a seguinte chave PIX:");
        await this.fluxManager.client.sendMessage(personNumber, "exemplo.chave@email.com");
        this.fluxManager.setPersonState(personNumber, 'hello-user').render(personNumber)
    }

    public async handleOption(body: string, personNumber: PersonNumber): Promise<void> {

    }

}

export default DepositarState;
