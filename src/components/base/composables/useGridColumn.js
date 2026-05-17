import { computed, ref } from 'vue'
import gridConfigService from '@/services/gridConfigService.js'

const GRID_CONFIG_STATE = {
  INSERT: 1,
  UPDATE: 2,
  DELETE: 3
}

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

  const visibleColumns = computed(() =>
    columns.value
      .filter(column => column.visible !== false)
      .sort((a, b) => a.order - b.order)
  )

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

  const loadColumnConfig = async () => {
    try {
      isLoadingColumnConfig.value = true

      const response = await gridConfigService.getByUserAndGrid(userId, gridId)
      const configs = getRowsFromResponse(response)

      serverConfigs.value = configs
      columns.value = mergeConfigWithDefaultColumns(configs)
    } catch (error) {
      console.error('Lỗi khi tải cấu hình cột:', error)
      columns.value = normalizeDefaultColumns()
    } finally {
      isLoadingColumnConfig.value = false
    }
  }

  const buildSavePayload = (draftColumns) => {
    const existingConfigMap = new Map(
      serverConfigs.value.map(config => [config.columnField, config])
    )

    return draftColumns.map((column, index) => {
      const oldConfig = existingConfigMap.get(column.field)

      const commonData = {
        organizationId: null,
        userId,
        gridId,
        columnField: column.field,
        isVisible: column.visible !== false,
        isPinned: column.pinned ?? false,
        pinPosition: column.pinPosition ?? null,
        columnOrder: index,
        columnWidth: column.width ?? null
      }

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

  const resetColumns = async () => {
    if (serverConfigs.value.length > 0) {
      const payload = serverConfigs.value.map(config => ({
        ...config,
        state: GRID_CONFIG_STATE.DELETE
      }))

      await gridConfigService.saveData(payload)
    }

    serverConfigs.value = []
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