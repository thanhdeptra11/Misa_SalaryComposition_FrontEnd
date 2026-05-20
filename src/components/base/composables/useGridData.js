import { computed, reactive, ref, watch } from 'vue';
import { mapEnumFieldsForList } from '@/constants/enumDisplayConstants';

// Summary: Hook/Composable dùng chung quản lý state (dữ liệu, phân trang, lọc, tìm kiếm) cho mọi bảng dữ liệu (Grid).
// Params: service (Object) - API service, options (Object) - Cấu hình mặc định (page, size, map enum...).
// Return: Object chứa toàn bộ state và các hàm thao tác grid.
export function useGridData(service, options = {}) {
  const tableData = ref([]);
  const totalRecords = ref(0);
  const searchResults = ref([]);
  const isLoading = ref(false);

  // Source of truth duy nhất cho request gửi lên backend.
  const pagingPayload = reactive({
    pageNumber: options.defaultPageNumber || 1,
    pageSize: options.defaultPageSize || 15,
    searchTerm: '',
    filters: []
  });

  const currentPage = computed({
    get: () => pagingPayload.pageNumber,
    set: (value) => {
      pagingPayload.pageNumber = value;
    }
  });

  const pageSize = computed({
    get: () => pagingPayload.pageSize,
    set: (value) => {
      pagingPayload.pageSize = value;
      pagingPayload.pageNumber = 1;
    }
  });

  // Summary: Trích xuất mảng dữ liệu (rows) từ response trả về của API, hỗ trợ các cấu trúc response khác nhau.
  // Params: response (Object) - Kết quả từ API trả về.
  // Return: Array - Mảng các dòng dữ liệu.
  const getRowsFromResponse = (response) => {
    // Dạng 1: { data: [...] }
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    // Dạng 2: { data: { data: [...] } }
    return response?.data?.data || [];
  };

  // Summary: Lấy tổng số bản ghi từ response API để phục vụ phân trang.
  // Params: response (Object) - Kết quả từ API trả về.
  // Return: Number - Tổng số bản ghi.
  const getTotalFromResponse = (response) => {
    return response?.totalRecords ?? response?.data?.totalRecords ?? 0;
  };

  // Summary: Chuẩn hóa dữ liệu mảng (map giá trị Enum sang Text, hoặc format custom) trước khi hiển thị.
  // Params: rows (Array) - Mảng dữ liệu thô.
  // Return: Array - Mảng dữ liệu đã chuẩn hóa.
  const normalizeRows = (rows) => {
    let normalizedRows = rows;

    // Map enum nếu màn hình có khai báo enumConfigs.
    if (Array.isArray(options.enumConfigs) && options.enumConfigs.length > 0) {
      normalizedRows = mapEnumFieldsForList(normalizedRows, options.enumConfigs);
    }

    // Cho từng màn format thêm nếu cần, ví dụ null -> "-".
    if (typeof options.normalizeRow === 'function') {
      normalizedRows = normalizedRows.map(options.normalizeRow);
    }

    return normalizedRows;
  };

  // Summary: Gọi API lấy dữ liệu bảng dựa trên trạng thái phân trang, tìm kiếm, lọc hiện tại.
  // Params: customPayload (Object) - Payload bổ sung ghi đè hoặc thêm vào (nếu có).
  // Return: Promise<void>
  const fetchData = async (customPayload = {}) => {
    try {
      isLoading.value = true;

      const response = await service.getPaging({
        ...pagingPayload,
        ...customPayload
      });

      const rows = getRowsFromResponse(response);

      tableData.value = normalizeRows(rows);
      totalRecords.value = getTotalFromResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu GridData:', error);

      tableData.value = [];
      totalRecords.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  // Summary: Đưa số trang về 1 và gọi API load lại dữ liệu (dùng khi search hoặc đổi filter).
  // Params: None
  // Return: Promise<void>
  const resetToFirstPageAndFetch = async () => {
    const isAlreadyFirstPage = pagingPayload.pageNumber === 1;

    pagingPayload.pageNumber = 1;

    // Nếu đang ở trang 1 thì watch(pageNumber) sẽ không chạy,
    // nên phải tự gọi fetchData.
    // Nếu đang ở trang khác, watch(pageNumber) sẽ tự fetch.
    if (isAlreadyFirstPage) {
      await fetchData();
    }
  };

  // Summary: Gọi API lấy danh sách gợi ý tìm kiếm (chưa cập nhật bảng chính).
  // Params: keyword (String) - Từ khóa người dùng nhập.
  // Return: Promise<void>
  const fetchSearchSuggestions = async (keyword) => {
    const searchTerm = keyword?.trim() || '';

    if (!searchTerm) {
      searchResults.value = [];
      pagingPayload.searchTerm = '';

      await resetToFirstPageAndFetch();
      return;
    }

    try {
      // Search dropdown chỉ lấy gợi ý, chưa thay đổi dữ liệu chính của bảng.
      const response = await service.getPaging({
        ...pagingPayload,
        searchTerm,
        pageNumber: 1,
        pageSize: options.searchPageSize || 10
      });

      searchResults.value = normalizeRows(getRowsFromResponse(response));
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu gợi ý tìm kiếm:', error);
      searchResults.value = [];
    }
  };

  // Summary: Xử lý khi người dùng chọn một mục trong danh sách gợi ý tìm kiếm, gán lại từ khóa và gọi fetchData.
  // Params: item (Object) - Dòng dữ liệu được chọn.
  // Return: Promise<void>
  const selectSearchItem = async (item) => {
    searchResults.value = [];

    // Mỗi màn có thể tự quyết định lấy field nào làm searchTerm.
    pagingPayload.searchTerm = typeof options.getSearchTermFromItem === 'function'
      ? options.getSearchTermFromItem(item)
      : item?.name || item?.code || item?.compositionName || item?.compositionCode || '';

    await resetToFirstPageAndFetch();
  };

  // Summary: Xóa kết quả và từ khóa tìm kiếm, sau đó load lại bảng.
  // Params: None
  // Return: Promise<void>
  const clearSearch = async () => {
    searchResults.value = [];
    pagingPayload.searchTerm = '';

    await resetToFirstPageAndFetch();
  };

  // Summary: Ghi đè các filter cũ của một thuộc tính bằng danh sách filter mới và load lại bảng.
  // Params: property (String) - Tên trường, newFilters (Array) - Mảng các điều kiện lọc mới.
  // Return: Promise<void>
  const replaceFiltersByProperty = async (property, newFilters) => {
    // Xóa toàn bộ filter cũ của cùng property,
    // sau đó thay bằng danh sách filter mới.
    const otherFilters = pagingPayload.filters.filter(
      filter => filter.property !== property
    );

    pagingPayload.filters = [
      ...otherFilters,
      ...newFilters
    ];

    await resetToFirstPageAndFetch();
  };

  // Summary: Xóa hoàn toàn điều kiện lọc của một thuộc tính.
  // Params: property (String) - Tên cột/trường cần xóa lọc.
  // Return: Promise<void>
  const removeFilter = async (property) => {
    await replaceFiltersByProperty(property, []);
  };

  // Summary: Thiết lập một điều kiện lọc đơn (một giá trị) cho một thuộc tính.
  // Params: Object chứa property, value, operator, dataType.
  // Return: Promise<void>
  const setFilter = async ({
    property,
    value,
    operator = '=',
    dataType = 'string'
  }) => {
    // Dùng cho filter 1 giá trị, ví dụ status = 1.
    await replaceFiltersByProperty(property, [
      {
        property,
        value,
        operator,
        dataType
      }
    ]);
  };

  // Summary: Thiết lập điều kiện lọc có giá trị mặc định ("Tất cả"). Xóa lọc nếu chọn mặc định.
  // Params: Object chứa property, value, defaultValue, operator, dataType.
  // Return: Promise<void>
  const setDefaultableFilter = async ({
    property,
    value,
    defaultValue,
    operator = '=',
    dataType = 'string'
  }) => {
    // Dùng cho case có "Tất cả", ví dụ status = 99.
    // Nếu đang chọn default thì nghĩa là không lọc property đó.
    if (value === defaultValue) {
      await removeFilter(property);
      return;
    }

    await setFilter({
      property,
      value,
      operator,
      dataType
    });
  };

  // Summary: Thiết lập nhiều điều kiện lọc cho cùng một thuộc tính (VD: chọn nhiều phòng ban).
  // Params: Object chứa property, values (Array), operator, dataType.
  // Return: Promise<void>
  const setMultiValueFilter = async ({
    property,
    values,
    operator = '=',
    dataType = 'string'
  }) => {
    // Dùng cho filter nhiều giá trị cùng một property,
    // ví dụ organization_id = A, organization_id = B.
    // Nếu values rỗng thì xóa toàn bộ filter của property đó.
    const filters = Array.isArray(values)
      ? values.map(value => ({
          property,
          value,
          operator,
          dataType
        }))
      : [];

    await replaceFiltersByProperty(property, filters);
  };

  // Đổi trang hoặc page size thì tự gọi lại API.
  watch(
    [() => pagingPayload.pageNumber, () => pagingPayload.pageSize],
    () => {
      fetchData();
    }
  );

  return {
    tableData,
    totalRecords,
    searchResults,
    isLoading,

    pagingPayload,
    currentPage,
    pageSize,

    fetchData,
    fetchSearchSuggestions,
    selectSearchItem,
    clearSearch,

    setFilter,
    removeFilter,
    setDefaultableFilter,
    setMultiValueFilter
  };
}
