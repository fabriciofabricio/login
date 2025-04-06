// src/utils/dateUtils.js
/**
 * Obtém o período atual no formato YYYY-MM
 * @returns {string} - Período no formato YYYY-MM
 */
export const getCurrentPeriod = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };
  
  /**
   * Obtém o rótulo do período
   * @param {string} period - Período no formato YYYY-MM
   * @returns {string} - Rótulo formatado (ex: "Junho de 2024")
   */
  export const getPeriodLabel = (period) => {
    if (!period) return "";
    
    const [year, month] = period.split('-');
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    return `${monthNames[parseInt(month) - 1]} de ${year}`;
  };
  
  /**
   * Obtém os últimos N períodos até a data atual
   * @param {number} count - Número de períodos a retornar
   * @returns {Array} - Array de objetos { period, label }
   */
  export const getRecentPeriods = (count = 12) => {
    const periods = [];
    const currentDate = new Date();
    
    for (let i = 0; i < count; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      periods.push({
        period,
        label: getPeriodLabel(period)
      });
    }
    
    return periods;
  };
  
  /**
   * Converte uma string de período para um objeto Date
   * @param {string} period - Período no formato YYYY-MM
   * @returns {Date} - Objeto Date correspondente
   */
  export const periodToDate = (period) => {
    if (!period) return new Date();
    
    const [year, month] = period.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  };