import State from "../../whatsapp/state";
import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import { PersonNumber } from "../../whatsapp/types/types";
import isValidMoney from "../../utils/isValidMoney";
import formatToCurrency from "../../utils/formatToCurrency";
class TransferirBetAmountState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {};
    }

    public async render(personNumber: PersonNumber) {
        await this.fluxManager.client.sendMessage(personNumber, "*Saldo Atual:* R$ 14.200,03\nEscreva quanto deseja enviar\nEx: R$ 2.000,00");
    }

    public async handleOption(body: string, personNumber: PersonNumber) {
        if (body.toLowerCase().replace(" ", "") == 'cancelar') {
            return await this.cancel(personNumber)
        }
        if (!isValidMoney(body)) return await this.fluxManager.client.sendMessage(personNumber, "Não entendi. Por favor, insira um número válido");
        const currencyFormated = formatToCurrency(body)
        const personContext = this.fluxManager.getPersonContext(personNumber)
        personContext.vars.transferChoosedValue = currencyFormated
        this.fluxManager.setPersonState(personNumber, 'transferir-bet-end').render(personNumber)

    }

}

export default TransferirBetAmountState;
