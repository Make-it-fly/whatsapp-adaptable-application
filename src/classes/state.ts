import FluxManager from "../whatsapp/fluxManager";
import { IMessageClient } from "../whatsapp/interfaces/message-client";
import IState from "../whatsapp/interfaces/state";
import { PersonNumber } from "../whatsapp/types/types";
import { ProjetoManager } from "./projeto-manager";

class State implements IState {
  handler: FluxManager;
  client: IMessageClient;
  manager: ProjetoManager
  protected optionsMap: Record<string | number, (personNumber: PersonNumber) => void>;

  constructor(fluxManager: FluxManager) {
    this.handler = fluxManager;
    this.client = this.handler.client;
    this.manager = ProjetoManager.getInstance()
  }

  public async handleOption(option: string, personNumber: PersonNumber) {
    if (option.toLowerCase().replace(" ", "") == 'cancelar') {
      return await this.cancel(personNumber)
    }
    const action = this.getAction(option);
    if (action) {
      action(personNumber);
    } else {
      const message = 'Opção inválida. Por favor, escolha uma das opções disponíveis.';
      await this.handler.client.sendMessage(personNumber, message);
    }
  }

  public async cancel(personNumber) {
    await this.handler.client.sendMessage(personNumber, "Ok, cancelando a sua ação.")
    this.handler.setPersonState(personNumber, "start")
    this.handler.stateMap["start"].render(personNumber)
  }

  public getAction(option: string) {
    return this.optionsMap[this._findMatchingKey(this.optionsMap, option)]
  }

  protected _findMatchingKey(obj: Record<string, any>, searchString: string): string | undefined {
    const normalizedSearch = searchString.replace(/\s+/g, '').toLowerCase();

    // Percorre todas as chaves do objeto
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Normaliza a chave atual
        const normalizedKey = key.replace(/\s+/g, '').toLowerCase();

        // Compara a chave normalizada com a string normalizada
        if (normalizedKey === normalizedSearch) {
          return key;
        }
      }
    }
  }
}
export default State