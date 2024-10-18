export default function isValidMoney(value: string): boolean {
    // Remove espaços e símbolos monetários comuns como "R$", "$", etc.
    const cleanedValue = value.trim().replace(/[^0-9,.\-]/g, '');

    // Expressão regular para verificar números válidos
    const moneyRegex = /^-?\d+(,\d{2})?$/;

    // Verifica se é um valor válido
    return moneyRegex.test(cleanedValue);
}