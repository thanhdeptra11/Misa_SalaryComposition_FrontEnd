/**
 * useGridColumns - Composable quản lý cấu hình cột của grid (bảng dữ liệu)
 *
 * @param {Array} defaultColumns - Danh sách cột mặc định 
 * @param {Object} options - Tùy chọn cấu hình
 * @param {string|number} options.userId  - ID của user đang đăng nhập
 * @param {string} options.gridId  - ID định danh grid cụ thể (mỗi grid một ID)
 *
 * @returns {Object}
 *   - columns {Ref<Array>} Danh sách cột hiện tại (đã merge config)
 *   - visibleColumns {ComputedRef} Chỉ các cột đang visible, đã sort theo order
 *   - isLoadingColumnConfig {Ref<boolean>} Trạng thái đang tải config từ server
 *   - loadColumnConfig {Function} Tải config từ server và apply vào columns
 *   - saveColumns {Function} Lưu cấu hình cột mới lên server
 *   - resetColumns {Function} Xóa config đã lưu, về lại mặc định
 */


import { computed, ref } from 'vue'
import gridConfigService from '@/services/gridConfigService.js'

const GRID_CONFIG_STATE = {
  INSERT: 1,
  UPDATE: 2,
  DELETE: 3
}
// columns: reactive list cột đang được dùng trên UI (clone từ defaultColumns để không mutate prop gốc)
const cloneColumns = (columns) => columns.map(column => ({ ...column }))

const getRowsFromResponse = (response) => {
  if (Array.isArray(response?.data)) {
    return response.data
  }

  return response?.data?.data || []
}

export function useGridColumns(defaultColumns, options) {
  const {
    userId,
    gridId
  } = options
  const columns = ref(cloneColumns(defaultColumns))
  const serverConfigs = ref([])
  const isLoadingColumnConfig = ref(false)
  /**
   * visibleColumns
   * Lọc ra các cột có visible !== false, rồi sort theo thuộc tính `order` tăng dần
   */
  const visibleColumns = computed(() =>
    columns.value
      .filter(column => column.visible !== false) // Loại bỏ cột bị ẩn
      .sort((a, b) => a.order - b.order) // Sắp xếp theo thứ tự
  )
/*
- normalizeDefaultColumns
  * Tạo một bản sao của defaultColumns (để không mutate prop)
  * Với mỗi column, set giá trị mặc định nếu chưa có
*/ 
  const normalizeDefaultColumns = () =>
    defaultColumns.map((column, index) => ({
      ...column,
      visible: column.visible ?? true,
      pinned: column.pinned ?? column.fixed ?? false,
      pinPosition: column.pinPosition ?? column.fixedPosition ?? null,
      order: column.order ?? index,
      width: column.width ?? null
    }))

  const mergeConfigWithDefaultColumns = (configs) => {
    const configMap = new Map(
      configs.map(config => [config.columnField, config])
    )

    return normalizeDefaultColumns()
      .map((column, index) => {
        const config = configMap.get(column.field)

        return {
          ...column,
          visible: config?.isVisible ?? column.visible,
          pinned: config?.isPinned ?? column.pinned,
          pinPosition: config?.pinPosition ?? column.pinPosition,
          order: config?.columnOrder ?? column.order ?? index,
          width: config?.columnWidth ?? column.width
        }
      })
      .sort((a, b) => a.order - b.order)
  }
/**
   * loadColumnConfig
   * Tải cấu hình cột từ server và apply vào state
   * Được gọi khi component mount hoặc cần refresh config
   * @returns {Promise<void>}
   */
  const loadColumnConfig = async () => {
    try {
      isLoadingColumnConfig.value = true

      const response = await gridConfigService.getByUserAndGrid(userId, gridId)
      const configs = getRowsFromResponse(response) // Chuẩn hóa format response

      serverConfigs.value = configs // Cache lại để dùng khi save
      columns.value = mergeConfigWithDefaultColumns(configs) // Apply vào UI
    } catch (error) {
      console.error('Lỗi khi tải cấu hình cột:', error)
      columns.value = normalizeDefaultColumns() // Fallback về default nếu lỗi
    } finally {
      isLoadingColumnConfig.value = false // Luôn tắt loading dù thành công hay thất bại
    }
  }
  /**
   * buildSavePayload
   * Xây dựng payload để gửi lên server khi lưu cấu hình cột
   * So sánh với serverConfigs để quyết định INSERT hay UPDATE từng cột
   * @param {Array} draftColumns - Mảng cột người dùng vừa chỉnh sửa (thứ tự mới, visibility mới, ...)
   * @returns {Array} Mảng payload với state INSERT/UPDATE cho từng cột
   */
  const buildSavePayload = (draftColumns) => {
    // Map để kiểm tra cột nào đã có config trên server
    const existingConfigMap = new Map(
      serverConfigs.value.map(config => [config.columnField, config]) // Tìm config cũ nếu có
    )

    return draftColumns.map((column, index) => {
      const oldConfig = existingConfigMap.get(column.field)
// Dữ liệu chung cho cả INSERT và UPDATE
      const commonData = {
        organizationId: null,
        userId,
        gridId,
        columnField: column.field,
        isVisible: column.visible !== false, // Ép kiểu: undefined/true → true
        isPinned: column.pinned ?? false,
        pinPosition: column.pinPosition ?? null,
        columnOrder: index, // Thứ tự mới sau khi kéo thả
        columnWidth: column.width ?? null
      }
      // Đã tồn tại trên server → UPDATE, thêm id để server biết record nào
      if (oldConfig) {
        return {
          ...commonData,
          id: oldConfig.id,
          state: GRID_CONFIG_STATE.UPDATE
        }
      }

      return {
        ...commonData,
        state: GRID_CONFIG_STATE.INSERT
      }
    })
  }
/**
   * saveColumns
   * Lưu cấu hình cột mới lên server, rồi reload lại config
   * @param {Array} draftColumns - Mảng cột với trạng thái mới (sau khi user kéo thả, ẩn/hiện, ...)
   * @returns {Promise<void>}
   */
  const saveColumns = async (draftColumns) => {
    const normalizedColumns = draftColumns.map((column, index) => ({
      ...column,
      order: index
    }))

    const payload = buildSavePayload(normalizedColumns)

    await gridConfigService.saveData(payload)

    columns.value = normalizedColumns
    await loadColumnConfig()
  }
/**
   * resetColumns
   * Xóa toàn bộ config đã lưu trên server, đưa cột về trạng thái mặc định
   * @returns {Promise<void>}
   */
  const resetColumns = async () => {
    // Đánh dấu toàn bộ config hiện có là DELETE
    if (serverConfigs.value.length > 0) {
      const payload = serverConfigs.value.map(config => ({
        ...config,
        state: GRID_CONFIG_STATE.DELETE
      }))

      await gridConfigService.saveData(payload)
    }
    // Xóa cache
    serverConfigs.value = []
    // Reset về trạng thái default của dev
    columns.value = normalizeDefaultColumns()
  }

  return {
    columns,
    visibleColumns,
    isLoadingColumnConfig,
    loadColumnConfig,
    saveColumns,
    resetColumns
  }
}