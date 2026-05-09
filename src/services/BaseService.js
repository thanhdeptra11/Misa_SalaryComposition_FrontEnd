import http from './httpClient'

export default class BaseService {
  constructor(resource) {
    this.resource = resource
    this.base = `/${resource}`
  }

  getAll() {
    return http.get(this.base)
  }

  // request: { pageNumber, pageSize, searchTerm, filters: [{ property, operator, value, dataType }] }
  getPaging(request) {
    return http.post(`${this.base}/filter`, request)
  }

  getById(id) {
    return http.get(`${this.base}/${id}`)
  }

  create(entity) {
    return http.post(this.base, entity)
  }

  // PUT /{resource} — id is inside the body
  update(entity) {
    return http.put(this.base, entity)
  }

  delete(id) {
    return http.delete(`${this.base}/${id}`)
  }

  deleteMultiple(ids) {
    return http.post(`${this.base}/delete-multiple`, ids)
  }

  saveData(entities) {
    return http.post(`${this.base}/save-batch`, entities)
  }
}
