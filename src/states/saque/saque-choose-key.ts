import State from "../../whatsapp/state";
import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import { PersonNumber } from "../../whatsapp/types/types";
import isValidMoney from "../../utils/isValidMoney";
import formatToCurrency from "../../utils/formatToCurrency";
class SaqueChooseKeyState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {};
    }

    public async render(personNumber: PersonNumber) {
        await this.fluxManager.client.sendMessage(personNumber, "Agora, digite a chave pix desejada para a transferência:");
    }

    public async handleOption(body: string, personNumber: PersonNumber) {
        if (body.toLowerCase().replace(" ", "") == 'cancelar') {
            return await this.cancel(personNumber)
        }
        const personContext = this.fluxManager.getPersonContext(personNumber)
        personContext.vars.witdrawlKey = body
        this.fluxManager.setPersonState(personNumber, 'saque-end').render(personNumber)

    }

}

export default SaqueChooseKeyState;
