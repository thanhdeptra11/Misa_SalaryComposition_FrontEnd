import BaseService from "./BaseService";
class SalaryCompositionService extends BaseService {
    constructor() {
        // Kế thừa BaseService truyền vào tên Resource
        super('SalaryComposition')
    }
    // Mọi phương thức cơ bản được kế thừa
}
export default new SalaryCompositionService('SalaryComposition')