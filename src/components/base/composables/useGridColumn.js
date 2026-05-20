// Summary: Composable quản lý trạng thái, tải và lưu cấu hình ẩn/hiện, vị trí các cột của bảng (Grid).
// Params: defaultColumns (Array) - Cấu hình gốc, options (Object) - userId, gridId.
// Return: Object chứa state và các hàm xử lý cấu hình cột (loadColumnConfig, saveColumns, resetColumns, vv.)


import { computed, ref } from 'vue'
import gridConfigService from '@/services/gridConfigService.js'

const GRID_CONFIG_STATE = {
  INSERT: 1,
  UPDATE: 2,
  DELETE: 3
}
// Summary: Tạo bản sao sâu (clone) mảng cột để tránh thay đổi trực tiếp cấu hình gốc.
// Params: columns (Array) - Mảng cột cần clone.
// Return: Array - Mảng cột mới đã được clone.
const cloneColumns = (columns) => columns.map(column => ({ ...column }))

// Summary: Lấy mảng dữ liệu cấu hình từ response của API.
// Params: response (Object) - Dữ liệu trả về từ server.
// Return: Array - Mảng cấu hình cột.
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
  // Summary: Bổ sung các thuộc tính mặc định (visible, pinned, order...) cho cấu hình gốc.
  // Params: None
  // Return: Array - Mảng cấu hình gốc đã chuẩn hóa.
  const normalizeDefaultColumns = () =>
    defaultColumns.map((column, index) => ({
      ...column,
      visible: column.visible ?? true,
      pinned: column.pinned ?? column.fixed ?? false,
      pinPosition: column.pinPosition ?? column.fixedPosition ?? null,
      order: column.order ?? index,
      width: column.width ?? null
    }))

  // Summary: Kết hợp cấu hình lấy từ server với cấu hình gốc, ưu tiên dữ liệu từ server.
  // Params: configs (Array) - Cấu hình cột lưu trên server.
  // Return: Array - Mảng cột sau khi gộp và sắp xếp theo thứ tự.
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
  // Summary: Tải cấu hình cột từ server, kết hợp với mặc định và áp dụng vào giao diện.
  // Params: None
  // Return: Promise<void>
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
  // Summary: Xây dựng dữ liệu gửi lên server, đối chiếu cấu hình cũ để gán trạng thái INSERT hoặc UPDATE.
  // Params: draftColumns (Array) - Mảng cột vừa được người dùng chỉnh sửa.
  // Return: Array - Mảng payload.
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
  // Summary: Gửi dữ liệu cấu hình mới lên server và gọi hàm load lại cấu hình.
  // Params: draftColumns (Array) - Mảng cột vừa thay đổi.
  // Return: Promise<void>
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
  // Summary: Xóa toàn bộ cấu hình đã lưu trên server bằng state DELETE, đưa bảng về trạng thái mặc định.
  // Params: None
  // Return: Promise<void>
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