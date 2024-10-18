export default function formatToCurrency(value: string): string {
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