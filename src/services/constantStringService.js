import httpClient from "./httpClient";
class ConstantStringService {
    /**
     * Lấy danh sách hằng số theo tên class
     * @param {String} className - Tên của class constant (ví dụ: 'CompositionType', 'PropertyType'...)
     * @returns {Promise<Array>} - Trả về mảng các object [{name, value}, ...]
     */
    async getConstantStringByClassName(className) {
        return (await httpClient.get(`/Constant/${className}`));
    }
    async fetchCbBoxOptions(className, targetRef){
        try{
            const res = await this.getConstantStringByClassName(className);
            if(res && Array.isArray(res)){
                targetRef.value = res.map(item => ({
                    label: item.value,
                    value: item.value
                }))
            }
        }catch(error){
            console.error(`Lỗi khi lấy dữ liệu ${className}:`, error);
        }
    }
}

export default new ConstantStringService();