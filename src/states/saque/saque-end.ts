import State from "../../whatsapp/state";
import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import { PersonNumber } from "../../whatsapp/types/types";
class SaqueEndState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {};
    }

    public async render(personNumber: PersonNumber) {
        const personContext = this.fluxManager.getPersonContext(personNumber)
        const message = `Valor *${personContext.vars.witdrawlValue}* enviado com sucesso para chave PIX: *${personContext.vars.witdrawlKey}*`
        personContext.vars = {}
        await this.fluxManager.client.sendMessage(personNumber, message);
        this.fluxManager.setPersonState(personNumber, 'hello-user').render(personNumber)
    }

    public async handleOption(body: string, personNumber: PersonNumber) {
    }

}

export default SaqueEndState;
