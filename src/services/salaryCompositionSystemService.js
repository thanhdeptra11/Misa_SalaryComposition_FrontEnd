import BaseService from "./BaseService";
class SalaryCompositionSystemService extends BaseService {
    constructor() {
        // Kế thừa BaseService truyền vào tên Resource
        super('SalaryCompositionSystem')
    }
    // Mọi phương thức cơ bản được kế thừa
}
export default new SalaryCompositionSystemService('SalaryCompositionSystem')