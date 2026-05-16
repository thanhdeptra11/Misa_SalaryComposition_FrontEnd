import { computed, reactive, ref, watch } from 'vue';
import { mapEnumFieldsForList } from '@/constants/enumDisplayConstants';

/**
 * Composable dùng chung cho các màn dùng:
 * - GridData
 * - GridDataToolbar
 * - GridDataFooter
 * 
 * Nguyên tắc:
 * - Luôn lấy dữ liệu qua service.getPaging(payload).
 * - Hỗ trợ search, filter đơn giá trị, filter nhiều giá trị.
 * - Hỗ trợ map enum int -> text bằng enumDisplayConstants.js.
 */
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

  const getRowsFromResponse = (response) => {
    // Dạng 1: { data: [...] }
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    // Dạng 2: { data: { data: [...] } }
    return response?.data?.data || [];
  };

  const getTotalFromResponse = (response) => {
    return response?.totalRecords ?? response?.data?.totalRecords ?? 0;
  };

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

  const selectSearchItem = async (item) => {
    searchResults.value = [];

    // Mỗi màn có thể tự quyết định lấy field nào làm searchTerm.
    pagingPayload.searchTerm = typeof options.getSearchTermFromItem === 'function'
      ? options.getSearchTermFromItem(item)
      : item?.name || item?.code || item?.compositionName || item?.compositionCode || '';

    await resetToFirstPageAndFetch();
  };

  const clearSearch = async () => {
    searchResults.value = [];
    pagingPayload.searchTerm = '';

    await resetToFirstPageAndFetch();
  };

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

  const removeFilter = async (property) => {
    await replaceFiltersByProperty(property, []);
  };

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
