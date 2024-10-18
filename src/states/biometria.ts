import State from "../whatsapp/state";
import FluxManager from "../whatsapp/fluxManager";
import IState from "../whatsapp/interfaces/state";
import { PersonNumber } from "../whatsapp/types/types";

class BiometriaState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {};
    }

    public async render(personNumber: PersonNumber) {
        await this.fluxManager.client.sendMessage(personNumber, "Realize a sua biometria através do seguinte link:");
        await this.fluxManager.client.sendMessage(personNumber, "Okto.com/facialetcetcetctftacaseeas");
        setTimeout(async () => {
            await this.fluxManager.setPersonState(personNumber, 'hello-user').render(personNumber)
        }, 1000)
    }

    public async handleOption(body: string, personNumber: PersonNumber): Promise<void> {

    }

}

export default BiometriaState;
