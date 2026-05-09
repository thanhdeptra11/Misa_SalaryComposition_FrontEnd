import dataCandidate from '@/stores/dataCandidate'
const STORAGE_KEY = 'candidateList'
const SEARCHABLE_FIELDS = [
  'fullName',
  'dob',
  'gender',
  'region',
  'phone',
  'email',
  'country',
  'city',
  'ward',
  'address',
]

export const candidateService = {
  getAll,
  save,
  create,
  remove,
  search,
  getPaginated,
}
function getAll() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataCandidate))
    return dataCandidate
  }
  return data
}
function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
function create(newItem) {
  const list = getAll()
  list.push(newItem)
  save(list)
}

function remove(id) {
  const list = getAll().filter((item) => item.id !== id)
  save(list)
}

function normalizeKeyword(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase()
}

function search(keyword = '') {
  const normalizedKeyword = normalizeKeyword(keyword)

  if (!normalizedKeyword) {
    return getAll()
  }

  return getAll().filter((item) =>
    SEARCHABLE_FIELDS.some((field) =>
      normalizeKeyword(item[field]).includes(normalizedKeyword)
    )
  )
}

function getPaginated(page = 1, pageSize = 25, keyword = '') {
  const filteredData = search(keyword)
  const totalRecords = filteredData.length
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const data = filteredData.slice(startIndex, endIndex)

  return {
    data,
    totalRecords,
    totalPages: Math.ceil(totalRecords / pageSize)
  }
}
