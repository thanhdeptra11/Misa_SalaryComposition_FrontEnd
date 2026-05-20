/**
 * Kiểm tra xem trạng thái có phải là đang theo dõi không
 * @param {number|boolean} status 
 * @returns {boolean}
 */
export const isTracking = (status) => status === 1 || status === true;

/**
 * Xây dựng payload để cập nhật trạng thái
 * @param {Object} row - Bản ghi hiện tại
 * @param {number|boolean} status - Trạng thái mới
 * @returns {Object} Payload để gọi API
 */
export const buildToggleStatusPayload = (row, status) => ({
  id: row.id || row.salaryCompositionId,
  organizationId: row.organizationId,
  systemCompositionId: row.systemCompositionId,
  compositionCode: row.compositionCode,
  compositionName: row.compositionName,
  compositionType: row.compositionType,
  property: row.property,
  taxableType: row.taxableType,
  taxDeductionType: row.taxDeductionType,
  norm: row.norm,
  valueType: row.valueType,
  valueExpression: row.valueExpression,
  description: row.description,
  showOnPayslip: row.showOnPayslip,
  creationSource: row.creationSource,
  status: status === 1
});

/**
 * Lọc danh sách ID được chọn, chỉ giữ lại các ID cấp cao nhất (không có parent nào trong danh sách được chọn)
 * @param {Array} selectedIds - Danh sách các ID đang được chọn
 * @param {Array} organizations - Danh sách tất cả các đơn vị
 * @returns {Array} Danh sách các ID đã lọc
 */
export const getHighestSelectedOrgIds = (selectedIds, organizations) => {
  if (!selectedIds || !selectedIds.length || !organizations || !organizations.length) return [];
  
  const selectedSet = new Set(selectedIds);
  const orgMap = new Map(organizations.map(org => [org.id, org]));

  return selectedIds.filter(id => {
    const org = orgMap.get(id);
    return org && !selectedSet.has(org.parentId);
  });
};

/**
 * Tạo câu thông báo khi xóa nhiều bản ghi
 * @param {Array} bulkSystemRows - Danh sách bản ghi hệ thống không thể xóa
 * @param {Array} bulkDeletableRows - Danh sách bản ghi có thể xóa
 * @returns {string} Nội dung thông báo
 */
export const getBulkDeleteConfirmMessage = (bulkSystemRows, bulkDeletableRows) => {
  const systemNames = bulkSystemRows
    .map(row => row.compositionName)
    .filter(Boolean)
    .join(', ');

  if (bulkSystemRows.length && bulkDeletableRows.length) {
    return `${systemNames} là giá trị mặc định của hệ thống nên không thể xóa. Bạn có muốn xóa các bản ghi còn lại không?`;
  }

  if (bulkSystemRows.length && !bulkDeletableRows.length) {
    return `${systemNames} là giá trị mặc định của hệ thống nên không thể xóa.`;
  }

  return `Bạn có chắc chắn muốn xóa ${bulkDeletableRows.length} thành phần lương đã chọn không?`;
};
