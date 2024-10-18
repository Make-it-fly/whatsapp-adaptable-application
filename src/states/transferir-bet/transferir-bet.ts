import State from "../../whatsapp/state";
import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import { PersonNumber } from "../../whatsapp/types/types";
class TransferirBetState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {};
    }

    public async render(personNumber: PersonNumber) {
        await this.fluxManager.client.sendMessage(personNumber, "Selecione em qual você está cadastrado", {
            type: 'buttons',
            options: [
                { name: "Bet 365" },
                { name: "Blaze" },
            ]
        });
    }

    public async handleOption(body: string, personNumber: PersonNumber) {
        if (body.toLowerCase().replace(" ", "") == 'cancelar') {
            return await this.cancel(personNumber)
        }
        const availableOptions = ['Bet 365', 'Blaze']
        if (!availableOptions.find(option => option == body)) return await this.fluxManager.client.sendMessage(personNumber, "Não entendi. Esta não é uma opção válida.");
        const personContext = this.fluxManager.getPersonContext(personNumber)
        personContext.vars.transferChoosedBet = body
        this.fluxManager.setPersonState(personNumber, 'transferir-bet-amount').render(personNumber)

    }

}

export default TransferirBetState;
