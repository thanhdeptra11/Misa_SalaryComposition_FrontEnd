
export const vrResource = {
  fields: {
    salaryComposition: {
      compositionName: 'Tên thành phần',
      compositionCode: 'Mã thành phần',
      compositionOrganization: 'Đơn vị áp dụng',
      compositionType: 'Loại thành phần',
      compositionProperty: 'Tính chất'
    }
  },

  validation: {
    required: '{field} không được bỏ trống',
    maxLength: '{field} không được vượt quá {max} ký tự'
  }
};
