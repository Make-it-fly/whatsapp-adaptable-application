import State from "../whatsapp/state";
import FluxManager from "../whatsapp/fluxManager";
import IState from "../whatsapp/interfaces/state";
import { PersonNumber } from "../whatsapp/types/types";

class WelcomeState extends State implements IState {

  constructor(fluxManager: FluxManager) {
    super(fluxManager)
    this.optionsMap = {
      "Transferir": this._transferir.bind(this)
    };
  }

  public async render(personNumber: PersonNumber) {
    const message = "*Olá, no que podemos te ajudar?*"
    await this.fluxManager.client.sendMessage(personNumber, message, {
      type: "buttons",
      options: [
        { name: "Transferir" },
      ]
    });
  }
  private async _transferir(personNumber: PersonNumber) {
    console.log(this)
    await this.fluxManager.setPersonState(personNumber, 'choose-bet').render(personNumber)
  }

}

export default WelcomeState;
