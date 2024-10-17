import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import State from "../../whatsapp/state";
import { PersonNumber } from "../../whatsapp/types/types";


class TransferEndState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {};
    }

    public async render(personNumber: PersonNumber) {
        const personContext = this.fluxManager.getPersonContext(personNumber)
        const message = `*Transação realizada*\n`
            + `A transação de ${personContext.vars.amount} para a agência ${personContext.vars.agencia} foi realizada.`;
        this.client.sendMessage(personNumber, message);
        await this.fluxManager.setPersonState(personNumber, 'welcome').render(personNumber);
        personContext.vars = {}

    }

}

export default TransferEndState;
