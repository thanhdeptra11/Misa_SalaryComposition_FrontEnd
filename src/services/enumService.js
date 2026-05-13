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
  async fetchCbBoxOptions(enumName, targetRef){
        try{
            const res = await this.getEnumByName(enumName);
            if(res && Array.isArray(res)){
                targetRef.value = res.map(item => ({
                    label: item.description,
                    value: item.value
                }))
            }
        }catch(error){
            console.error(`Lỗi khi lấy dữ liệu ${enumName}:`, error);
        }
    }
}

export default new EnumService();
