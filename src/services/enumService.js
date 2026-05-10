import httpClient from './httpClient'

class EnumService {
  /**
   * Lấy danh sách enum theo tên
   * @param {String} enumName - Tên enum, ví dụ: 'FollowStatus'
   * @returns {Promise<Array>} - Danh sách enum
   */
  async getEnumByName(enumName) {
    const response = await httpClient.get(`/Enum/${enumName}`);
    return response;
  }
}

export default new EnumService();
