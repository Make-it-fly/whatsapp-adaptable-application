import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import State from "../../whatsapp/state";
import { PersonNumber } from "../../whatsapp/types/types";


class ChooseBetState extends State implements IState {

  constructor(fluxManager: FluxManager) {
    super(fluxManager)
    this.optionsMap = {};
  }

  public async render(personNumber: PersonNumber) {
    const message = "*Escolha a agência que deseja transferir:*"
    await this.fluxManager.client.sendMessage(personNumber, message, {
      type: 'list',
      listOptions: [
        {
          sectionName: 'Agências',
          rows: [
            { name: 'Agência BET 1', description: 'Essa é a agência 1' },
            { name: 'Agência BET 2', description: 'Essa é a agência 2' },
            { name: 'Agência BET 3', description: 'Essa é a agência 3' },
            { name: 'Agência BET 4', description: 'Essa é a agência 4' },
          ]
        }
      ]
    });
  }

  public async handleOption(body: string, personNumber: PersonNumber) {
    if (body.toLowerCase().replace(" ", "") == 'cancelar') {
      return await this.cancel(personNumber)
    }
    if (!(body == 'Agência BET 1' || body == 'Agência BET 2' || body == 'Agência BET 3' || body == 'Agência BET 4')) {
      return this.client.sendMessage(personNumber, "Agência não encontrada. Por favor, escolha uma das opções disponíveis.")
    }
    const personContext = this.fluxManager.getPersonContext(personNumber)
    personContext.vars.agencia = body
    this.fluxManager.setPersonState(personNumber, 'choose-amount').render(personNumber)
  }

}

export default ChooseBetState;
