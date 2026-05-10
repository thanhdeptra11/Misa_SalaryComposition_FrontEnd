import httpClient from './httpClient'

class OrganizationService {
  /**
   * Lấy danh sách các đơn vị/tổ chức
   * @returns {Promise<Array>} - Danh sách đơn vị phẳng (flat array) với id và parentId
   */
  async getOrganizations() {
    const response = await httpClient.get('/Organization');
    return response;
  }
}

export default new OrganizationService();
