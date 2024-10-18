import State from "../whatsapp/state";
import FluxManager from "../whatsapp/fluxManager";
import IState from "../whatsapp/interfaces/state";
import { PersonNumber } from "../whatsapp/types/types";

class HelloUserState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {
            "Depositar": this._depositar.bind(this),
            "Transferir para Bet": this._transferir.bind(this),
            "Saque": this._saque.bind(this),
        };
    }

    public async render(personNumber: PersonNumber) {
        const message = `Olá Fulano, como podemos te ajudar hoje?`
        await this.fluxManager.client.sendMessage(personNumber, message, {
            type: 'buttons',
            options: [
                { name: "Depositar" },
                { name: "Transferir para Bet" },
                { name: "Saque" },
            ]
        });
    }

    private async _depositar(personNumber: PersonNumber) {
        this.fluxManager.setPersonState(personNumber, 'depositar').render(personNumber)
    }
    private async _transferir(personNumber: PersonNumber) {
        this.fluxManager.setPersonState(personNumber, 'transferir-bet').render(personNumber)
    }
    private async _saque(personNumber: PersonNumber) {
        this.fluxManager.setPersonState(personNumber, 'saque').render(personNumber)
    }

}

export default HelloUserState;
