import { computed, reactive, ref } from 'vue'

const advancedFilterFields = [
  {
    property: 'composition_code',
    title: 'Mã thành phần',
    dataType: 'string',
    defaultOperator: 'contains',
  },
  {
    property: 'composition_name',
    title: 'Tên thành phần',
    dataType: 'string',
    defaultOperator: 'contains',
  },
  {
    property: 'composition_type',
    title: 'Loại thành phần',
    dataType: 'number',
    defaultOperator: '=',
  },
  { property: 'property', title: 'Tính chất', dataType: 'number', defaultOperator: '=' },
  { property: 'taxable_type', title: 'Chịu thuế', dataType: 'number', defaultOperator: '=' },
  {
    property: 'tax_deduction_type',
    title: 'Giảm trừ khi tính thuế',
    dataType: 'string',
    defaultOperator: 'contains',
  },
  { property: 'norm', title: 'Định mức', dataType: 'string', defaultOperator: 'contains' },
  { property: 'value_type', title: 'Kiểu giá trị', dataType: 'number', defaultOperator: '=' },
  {
    property: 'value_expression',
    title: 'Giá trị',
    dataType: 'string',
    defaultOperator: 'contains',
  },
  { property: 'description', title: 'Mô tả', dataType: 'string', defaultOperator: 'contains' },
  {
    property: 'creation_source',
    title: 'Nguồn tạo',
    dataType: 'string',
    defaultOperator: 'contains',
  },
  {
    property: 'show_on_payslip',
    title: 'Hiển thị trên phiếu lương',
    dataType: 'number',
    defaultOperator: '=',
  },
]

const operatorOptions = [
  { value: 'contains', label: 'Chứa' },
  { value: '=', label: 'Bằng' },
  { value: '>', label: 'Lớn hơn' },
  { value: '>=', label: 'Lớn hơn hoặc bằng' },
  { value: '<', label: 'Nhỏ hơn' },
  { value: '<=', label: 'Nhỏ hơn hoặc bằng' },
]

export function useSalaryCompositionAdvancedFilters({ pagingPayload, fetchData }) {
  const isShowAdvancedFilter = ref(false)
  const advancedFilterKeyword = ref('')
  const activeAdvancedFilterProperty = ref(advancedFilterFields[0]?.property || '')
  // Summary: Bản nháp (draft) của các điều kiện bộ lọc nâng cao,
  // lưu trữ trạng thái bật/tắt, toán tử và giá trị nhập cho từng trường.
  //   Params: None
  //   Return: Object reactive chứa các nháp bộ lọc, ví dụ:
  //   {
  //     composition_code: { enabled: true, operator: 'contains', value: 'ABC' },
  //     composition_name: { enabled: false, operator: '=', value: '' }
  //   }
  // Return: Promise<void>
  const advancedFilterDrafts = reactive(
    advancedFilterFields.reduce((result, field) => {
      result[field.property] = {
        enabled: false,
        operator: field.defaultOperator || 'contains',
        value: '',
      }

      return result
    }, {}),
  )
  // Tạo một Set chứa tên các property của bộ lọc nâng cao để dễ dàng kiểm tra khi build payload lọc
  const advancedFilterProperties = new Set(advancedFilterFields.map((field) => field.property))
  // Summary: Mảng các trường bộ lọc được lọc theo từ khóa nhập vào,
  // dùng để hiển thị trong giao diện khi người dùng tìm kiếm trường cần lọc
  // Params: None
  // Return: Array các trường bộ lọc có title chứa từ khóa
  const filteredAdvancedFilterFields = computed(() => {
    const keyword = advancedFilterKeyword.value.trim().toLowerCase()

    if (!keyword) return advancedFilterFields

    return advancedFilterFields.filter((field) => field.title.toLowerCase().includes(keyword))
  })
  // Summary: Thiết lập trường bộ lọc đang active (đang chỉnh sửa) khi
  // người dùng chọn một trường để nhập điều kiện lọc
  // Params: property (String) - Tên trường được chọn
  // Return: void, cập nhật activeAdvancedFilterProperty
  const setActiveAdvancedFilterField = (property) => {
    activeAdvancedFilterProperty.value = property
  }

  // Summary: Bật/tắt việc sử dụng một trường trong bộ lọc nâng cao
  // Params:
  //   - property (String): Tên trường
  //   - checked (Boolean): Trạng thái bật hoặc tắt
  // Return: void
  const toggleAdvancedFilterField = (property, checked) => {
    advancedFilterDrafts[property].enabled = checked

    if (checked) {
      activeAdvancedFilterProperty.value = property
    }
  }

  // Summary: Cập nhật dữ liệu tạm (draft) cho một trường trong bộ lọc (vd: toán tử, giá trị nhập)
  // Params:
  //   - property (String): Tên trường
  //   - patch (Object): Chứa các thuộc tính cần cập nhật (vd: { operator: '=', value: 'abc' })
  // Return: void
  const updateAdvancedFilterDraft = (property, patch) => {
    advancedFilterDrafts[property] = {
      ...advancedFilterDrafts[property],
      ...patch,
    }
  }

  // Summary: Xây dựng mảng payload bộ lọc từ các nháp (drafts) đang được bật (enabled)
  // Params: None
  // Return: Array<Object> Mảng các điều kiện lọc sẵn sàng ghép vào pagingPayload
  const buildAdvancedFilters = () => {
    return advancedFilterFields
      .filter((field) => advancedFilterDrafts[field.property]?.enabled)
      .map((field) => ({
        property: field.property,
        operator: advancedFilterDrafts[field.property].operator,
        value: String(advancedFilterDrafts[field.property].value ?? '').trim(),
        dataType: field.dataType || 'string',
      }))
      .filter((filter) => filter.value !== '')
  }

  // Summary: Đưa trang về 1 và gọi lại API fetchData để load dữ liệu mới nhất
  // Params: None
  // Return: Promise<void>
  const reloadFirstPage = async () => {
    const isFirstPage = pagingPayload.pageNumber === 1
    pagingPayload.pageNumber = 1

    if (isFirstPage) {
      await fetchData()
    }
  }

  // Summary: Áp dụng các điều kiện bộ lọc nâng cao vào pagingPayload chung và load lại trang
  // Params: None
  // Return: Promise<void>
  const applyAdvancedFilters = async () => {
    pagingPayload.filters = [
      ...pagingPayload.filters.filter((filter) => !advancedFilterProperties.has(filter.property)),
      ...buildAdvancedFilters(),
    ]

    await reloadFirstPage()
  }

  // Summary: Hủy/Xóa toàn bộ các thiết lập của bộ lọc nâng cao, làm sạch pagingPayload và load lại bảng
  // Params: None
  // Return: Promise<void>
  const resetAdvancedFilters = async () => {
    Object.keys(advancedFilterDrafts).forEach((property) => {
      advancedFilterDrafts[property].enabled = false
      advancedFilterDrafts[property].value = ''
    })

    pagingPayload.filters = pagingPayload.filters.filter(
      (filter) => !advancedFilterProperties.has(filter.property),
    )

    await reloadFirstPage()
  }

  return {
    isShowAdvancedFilter,
    advancedFilterFields,
    filteredAdvancedFilterFields,
    advancedFilterKeyword,
    activeAdvancedFilterProperty,
    advancedFilterDrafts,
    advancedFilterOperatorOptions: operatorOptions,
    setActiveAdvancedFilterField,
    toggleAdvancedFilterField,
    updateAdvancedFilterDraft,
    applyAdvancedFilters,
    resetAdvancedFilters,
  }
}
