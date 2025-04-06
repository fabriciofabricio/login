// src/utils/formatUtils.js
/**
 * Formata um valor numérico para moeda brasileira (R$)
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado como moeda
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  /**
   * Formata uma data para o formato brasileiro dd/mm/yyyy
   * @param {Date} date - Data a ser formatada
   * @returns {string} - Data formatada
   */
  export const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  /**
   * Formata um valor percentual
   * @param {number} value - Valor a ser formatado (ex: 0.05 para 5%)
   * @param {boolean} includeSign - Se deve incluir o sinal de + para valores positivos
   * @returns {string} - Valor formatado como percentual
   */
  export const formatPercentage = (value, includeSign = false) => {
    const sign = includeSign && value > 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(1)}%`;
  };
  
  /**
   * Determina se um valor é positivo ou não
   * @param {number} value - Valor a verificar
   * @returns {boolean} - Verdadeiro se positivo
   */
  export const isPositive = (value) => value >= 0;