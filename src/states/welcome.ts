import State from "../whatsapp/state";
import FluxManager from "../whatsapp/fluxManager";
import IState from "../whatsapp/interfaces/state";
import { PersonNumber } from "../whatsapp/types/types";

class WelcomeState extends State implements IState {

  constructor(fluxManager: FluxManager) {
    super(fluxManager)
    this.optionsMap = {
      "Realizar Biometria": this._realizarBiometria.bind(this),
      "Não tenho conta": this._naoTenhoConta.bind(this),
    };
  }

  public async render(personNumber: PersonNumber) {
    const message = "Olá, bem vindo a *Okto Payment*. Realize a biometria facial para acessar sua conta."
    await this.fluxManager.client.sendMessage(personNumber, message, {
      type: "buttons",
      options: [
        { name: "Realizar Biometria" },
        { name: "Não tenho conta" },
      ]
    });
  }
  private async _naoTenhoConta(personNumber: PersonNumber) {
    await this.fluxManager.client.sendMessage(personNumber, "Sem problema, crie sua conta no nosso aplicativo:");
    await this.fluxManager.client.sendMessage(personNumber, "Okto.com/download");
  }
  private async _realizarBiometria(personNumber: PersonNumber) {
    this.fluxManager.setPersonState(personNumber, 'biometria').render(personNumber)
  }

}

export default WelcomeState;
