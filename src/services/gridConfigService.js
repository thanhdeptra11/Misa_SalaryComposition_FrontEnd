import BaseService from './BaseService'

class GridConfigService extends BaseService {
  constructor() {
    super('GridConfig')
  }

  getByUserAndGrid(userId, gridId) {
    return this.getPaging({
      pageNumber: 1,
      pageSize: 500,
      searchTerm: '',
      filters: [
        {
          property: 'user_id',
          operator: '=',
          value: userId,
          dataType: 'string'
        },
        {
          property: 'grid_id',
          operator: '=',
          value: gridId,
          dataType: 'string'
        }
      ]
    })
  }
}

export default new GridConfigService()