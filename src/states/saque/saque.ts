import State from "../../whatsapp/state";
import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import { PersonNumber } from "../../whatsapp/types/types";
import isValidMoney from "../../utils/isValidMoney";
import formatToCurrency from "../../utils/formatToCurrency";
class SaqueState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {};
    }

    public async render(personNumber: PersonNumber) {
        await this.fluxManager.client.sendMessage(personNumber, "*Saldo Atual:* R$ 14.200,03\nEscreva o quanto deseja sacar.\n_Ex: R$ 9.999,99_");
    }

    public async handleOption(body: string, personNumber: PersonNumber) {
        if (body.toLowerCase().replace(" ", "") == 'cancelar') {
            return await this.cancel(personNumber)
        }
        if (!isValidMoney(body)) return await this.fluxManager.client.sendMessage(personNumber, "Não entendi. Por favor, insira um número válido");
        const currencyFormated = formatToCurrency(body)
        const personContext = this.fluxManager.getPersonContext(personNumber)
        personContext.vars.witdrawlValue = currencyFormated
        this.fluxManager.setPersonState(personNumber, 'saque-choose-key').render(personNumber)

    }

}

export default SaqueState;
