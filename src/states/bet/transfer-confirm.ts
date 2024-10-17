import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import State from "../../whatsapp/state";
import { PersonNumber } from "../../whatsapp/types/types";


class TransferConfirmState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {
            'Confirmar': this._optionConfirmar.bind(this)
        };
    }

    public async render(personNumber: PersonNumber) {
        const personContext = this.fluxManager.getPersonContext(personNumber)
        const message = `*Confirmação de transferência*\n`
            + `Você confirma a transação de ${personContext.vars.amount} para a agência ${personContext.vars.agencia}?`;
        await this.client.sendMessage(personNumber, message, {
            type: "buttons",
            options: [
                { name: "Confirmar" },
                { name: "Cancelar" }
            ]
        })
    }

    private async _optionConfirmar(personNumber: PersonNumber) {
        await this.fluxManager.setPersonState(personNumber, 'transfer-end').render(personNumber)
    }

}

export default TransferConfirmState;
