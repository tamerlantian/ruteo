export const dateUtil = {
  formatDate: (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  },

  /**
   * Formats a Date object to the API required format: YYYY-MM-DD HH:MM
   * @param date Date object to format
   * @returns Formatted date string for API consumption
   */
  formatForAPI: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  /**
   * Gets current date formatted for API
   * @returns Current date in YYYY-MM-DD HH:MM format
   */
  getCurrentForAPI: (): string => {
    return dateUtil.formatForAPI(new Date());
  },
};
