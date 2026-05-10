import httpClient from './httpClient'

export default {
  /**
   * Filter salary composition
   * @param {Object} payload 
   * @returns 
   */
  filter(payload) {
    return httpClient.post('SalaryComposition/filter', payload)
  }
}
