export const defaultTableColumns = [
  {
    field: 'compositionName',
    title: 'Tên thành phần',
    width: 250,
    fixed: true,
    hideable: false
  },
  {
    field: 'compositionCode',
    title: 'Mã thành phần',
    width: 200
  },
  {
    field: 'organizationName',
    title: 'Đơn vị áp dụng',
    width: 250
  },
  {
    field: 'compositionTypeDesc',
    title: 'Loại thành phần',
    width: 200
  },
  {
    field: 'propertyDesc',
    title: 'Tính chất',
    width: 150
  },
  {
    field: 'taxableTypeDesc',
    title: 'Chịu thuế',
    width: 150
  },
  {
    field: 'taxDeductionType',
    title: 'Giảm trừ khi tính thuế',
    width: 200
  },
  {
    field: 'norm',
    title: 'Định mức',
    width: 150
  },
  {
    field: 'valueTypeDesc',
    title: 'Kiểu giá trị',
    width: 150
  },
  {
    field: 'valueExpression',
    title: 'Giá trị',
    width: 250,
    cellTemplate: 'valueExpressionTemplate'
  },
  {
    field: 'description',
    title: 'Mô tả',
    width: 250
  },
  {
    field: 'showOnPayslipDesc',
    title: 'Hiển thị trên phiếu lương',
    width: 200
  },
  {
    field: 'creationSource',
    title: 'Nguồn tạo',
    width: 150
  },
  {
    field: 'statusDesc',
    title: 'Trạng thái',
    width: 150,
    cellTemplate: 'statusTemplate'
  }
];
