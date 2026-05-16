export const ENUM_NAMES = {
  COMPOSITION_TYPE: 'CompositionType',
  FOLLOW_STATUS: 'FollowStatus',
  COMPOSITION_PROPERTY: 'CompositionProperty',
  DISPLAY_PAYROLL_TYPE: 'DisplayPayrollType',
  MI_VALUE_TYPE: 'MIValueType',
  TAX_APPLIED_TYPE: 'TaxAppliedType',

};

export const ENUM_DISPLAY_MAPS = {
  [ENUM_NAMES.COMPOSITION_TYPE]: {
    1: 'Thông tin nhân viên',
    2: 'Chấm công',
    3: 'Doanh số',
    4: 'KPI',
    5: 'Sản phẩm',
    6: 'Lương',
    7: 'Thuế TNCN',
    8: 'Bảo hiểm - Công đoàn',
    9: 'Khác'
  },

  [ENUM_NAMES.FOLLOW_STATUS]: {
    1: 'Đang theo dõi',
    0: 'Ngừng theo dõi'
  },
  [ENUM_NAMES.COMPOSITION_PROPERTY]: {
    1: 'Thu nhập',
    2: 'Khấu trừ',
    3: 'Khác'
  },
  [ENUM_NAMES.DISPLAY_PAYROLL_TYPE]:{
    1:"Có",
    2:"Không",
    3:"Chỉ hiển thị nếu giá trị khác 0"
  },
  [ENUM_NAMES.MI_VALUE_TYPE]:{
    1:"Số",
    2:"Văn bản",
    3:"Ngày tháng",
    4:"Tiền tệ"
  },
  [ENUM_NAMES.TAX_APPLIED_TYPE]:{
    1:"Chịu thuế",
    2: "Miễn thuế toàn phần",
    3: "Miễn thuế một phần"
  }

};

const isEmptyValue = (value) => {
  return value === null || value === undefined || String(value).trim() === '';
};

const normalizeOptionValue = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
};
/*
  Hàm lấy text hiển thị của một enum
  @param enumName: Tên enum
  @param value: Giá trị enum
  @param fallback: Giá trị fallback khi không tìm thấy
  @returns Text hiển thị của enum
*/
export const getEnumText = (enumName, value, fallback = '-') => {
  if (isEmptyValue(value)) return fallback;

  // Object key trong JS là string, nên ép value về string để map ổn định
  return ENUM_DISPLAY_MAPS[enumName]?.[String(value)] ?? fallback;
};
/**
 * Hàm lấy options cho dropdown
 * @param enumName: Tên enum
 * @param firstOption: Option đầu tiên (nếu có)
 * @returns Options cho dropdown
 */
export const getEnumOptions = (enumName, firstOption = null) => {
  const map = ENUM_DISPLAY_MAPS[enumName] || {};

  const options = Object.entries(map).map(([value, label]) => ({
    value: normalizeOptionValue(value),
    label
  }));

  return firstOption ? [firstOption, ...options] : options;
};
/**
 * Hàm map enum fields
 * @param row: Row dữ liệu
 * @param configs: Configs
 * @returns Mapped row
 */
export const mapEnumFields = (row, configs) => {
  const mappedRow = { ...row };

  configs.forEach(({ enumName, sourceField, targetField, fallback }) => {
    // Lấy int từ sourceField rồi gán text vào targetField
    mappedRow[targetField] = getEnumText(
      enumName,
      row?.[sourceField],
      fallback
    );
  });

  return mappedRow;
};
/**
 * Hàm map enum fields cho danh sách
 * @param rows: Danh sách dữ liệu
 * @param configs: Configs
 * @returns Danh sách mapped
 */
export const mapEnumFieldsForList = (rows, configs) => {
  if (!Array.isArray(rows)) return [];

  return rows.map(row => mapEnumFields(row, configs));
};
