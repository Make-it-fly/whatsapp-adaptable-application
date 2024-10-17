import FluxManager from "../../whatsapp/fluxManager";
import IState from "../../whatsapp/interfaces/state";
import State from "../../whatsapp/state";
import { PersonNumber } from "../../whatsapp/types/types";


class ChooseAmountState extends State implements IState {

    constructor(fluxManager: FluxManager) {
        super(fluxManager)
        this.optionsMap = {};
    }

    public async render(personNumber: PersonNumber) {
        const message = "*Digite a quantia que deseja*"
        await this.client.sendMessage(personNumber, message)
    }

    public async handleOption(body: string, personNumber: PersonNumber) {
        if (body.toLowerCase().replace(" ", "") == 'cancelar') {
            return await this.cancel(personNumber)
        }
        if (!this._isValidMoney(body)) {
            await this.client.sendMessage(personNumber, "Desculpe, não entendi o que você digitou. tente digitar em um formato como: _00,00_")
        }
        const amount = this._formatToCurrency(body)
        const personContext = this.fluxManager.getPersonContext(personNumber)
        personContext.vars.amount = amount
        await this.fluxManager.setPersonState(personNumber, 'transfer-confirm').render(personNumber)
    }

    private _isValidMoney(value: string): boolean {
        // Remove espaços e símbolos monetários comuns como "R$", "$", etc.
        const cleanedValue = value.trim().replace(/[^0-9,.\-]/g, '');

        // Expressão regular para verificar números válidos
        const moneyRegex = /^-?\d+(,\d{2})?$/;

        // Verifica se é um valor válido
        return moneyRegex.test(cleanedValue);
    }

    private _formatToCurrency(value: string): string {
        // Remove espaços, símbolos monetários e deixa apenas números, vírgula e ponto
        const cleanedValue = value.trim().replace(/[^0-9,.\-]/g, '');

        // Substitui vírgulas por pontos para poder converter para número
        const numericValue = parseFloat(cleanedValue.replace(',', '.'));

        // Se não for um número válido, retorna "R$ 0,00"
        if (isNaN(numericValue)) {
            return "R$ 0,00";
        }

        // Formata o número para o padrão monetário brasileiro
        return numericValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }

}

export default ChooseAmountState;
