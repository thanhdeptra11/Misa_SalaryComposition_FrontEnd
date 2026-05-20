<template>
  <!-- Hiển thị danh sách thành phần lương -->
  <div class="salary_composition_layout" v-if="!isShowingForm">
    <Header class="header" title="Thành phần lương">
      <template #right>
        <BaseButton
          @click="goToSystemList"
          variant="primary"
          iconClass="icon_scale"
          buttonText="Danh mục của hệ thống"
        />
        <div class="add_button_wrapper">
          <BaseButton
            id="salary-composition-mixed-button"
            variant="mixed"
            iconClass="icon_add"
            buttonText="Thêm mới"
            @click="handleCreate"
            @click-dropdown="toggleAddMenu"
          />

          <div v-if="isShowAddMenu" class="add_menu">
            <div class="add_menu_item" @click="openSystemPicker">Chọn từ danh mục của hệ thống</div>
          </div>
        </div>
      </template>
    </Header>

    <div class="table_container">
      <div class="table_grid_content">
        <SalaryCompositionToolbar
          :searchResults="searchResults"
          :selectedCount="selectedCount"
          :selectedRows="selectedRows"
          @clear-selection="handleClearSelection"
          @search="fetchSearchSuggestions"
          @select-search-item="selectSearchItem"
          @open-column-setting="isShowColumnSetting = true"
          v-model:status="currentStatus"
          v-model:units="currentUnits"
          :statusOptions="statusOptions"
          :unitOptions="unitOptions"
          @bulk-status-click="openBulkStatusConfirm"
          @bulk-delete-click="openBulkDeleteConfirm"
          @open-filter="isShowAdvancedFilter = true"
        />

        <SalaryCompositionTable
          :columns="visibleColumns"
          :data="tableData"
          @selection-change="setSelectedRows"
          @row-action="handleRowAction"
          ref="gridRef"
        />

        <GridDataFooter
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          :totalRecords="totalRecords"
        />
      </div>
      <SalaryCompositionFilterPanel
        v-model="isShowAdvancedFilter"
        :filtered-fields="filteredAdvancedFilterFields"
        :draft-filters="advancedFilterDrafts"
        :keyword="advancedFilterKeyword"
        :active-property="activeAdvancedFilterProperty"
        :operator-options="advancedFilterOperatorOptions"
        @update:keyword="advancedFilterKeyword = $event"
        @select-field="setActiveAdvancedFilterField"
        @toggle-field="toggleAdvancedFilterField"
        @update-filter="updateAdvancedFilterDraft"
        @apply="applyAdvancedFilters"
        @reset="resetAdvancedFilters"
      />
    </div>
  </div>
  <!-- Hiển thị form -->
  <SalaryCompositionForm
    v-else
    :mode="formMode"
    :editing-item="editingItem"
    @back="handleCloseForm"
    @saved="handleFormSaved"
  />
  <SalaryCompositionDialogs
    v-model:isShowDeleteConfirmModal="isShowDeleteConfirmModal"
    v-model:isShowStatusConfirmModal="isShowStatusConfirmModal"
    v-model:isShowSystemDeleteWarningModal="isShowSystemDeleteWarningModal"
    v-model:isShowBulkStatusConfirmModal="isShowBulkStatusConfirmModal"
    v-model:isShowBulkDeleteConfirmModal="isShowBulkDeleteConfirmModal"
    v-model:isShowSystemPickerModal="isShowSystemPickerModal"
    v-model:isShowColumnSetting="isShowColumnSetting"
    :deleteItemName="salaryCompositionToDelete?.compositionName || ''"
    :statusMessage="statusConfirmMessage"
    :bulkStatusMessage="bulkStatusConfirmMessage"
    :bulkDeleteMessage="bulkDeleteConfirmMessage"
    :hasDeletableRows="bulkDeletableRows.length > 0"
    :columns="tableColumns"
    @confirm-delete="handleConfirmDelete"
    @confirm-status="handleConfirmToggleStatus"
    @confirm-bulk-status="handleConfirmBulkStatus"
    @confirm-bulk-delete="handleConfirmBulkDelete"
    @system-picker-saved="fetchData"
    @save-column="handleSaveColumnConfig"
    @reset-column="handleResetColumnConfig"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSalaryCompositionFilters } from './composables/useSalaryCompositionFilters.js'
import { useSalaryCompositionMutations } from './composables/useSalaryCompositionMutations.js'
import Header from '@/components/mainViewComponents/Header.vue'
import SalaryCompositionToolbar from './components/SalaryCompositionToolbar.vue'
import SalaryCompositionTable from './components/SalaryCompositionTable.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'
import GridDataFooter from '@/components/base/baseGridData/GridDataFooter.vue'
import SalaryCompositionForm from './salaryCompositionForm.vue'
import SalaryCompositionDialogs from './components/SalaryCompositionDialogs.vue'
import SalaryCompositionFilterPanel from './components/SalaryCompositionFilterPanel.vue'
import { GLOBAL_CONSTANTS } from '@/constants/globalConstants'
import { useSalaryCompositionAdvancedFilters } from './composables/useSalaryCompositionAdvancedFilters.js'
import { useGridFormActions } from '@/components/base/composables/useGridFormActions.js'
import { useSalaryCompositionSelection } from './composables/useSalaryCompositionSelection.js'
import { useGridColumns } from '@/components/base/composables/useGridColumn.js'
import { defaultTableColumns } from './constants/salaryCompositionColumns.js'
import { useGridData } from '@/components/base/composables/useGridData.js'
import salaryCompositionService from '@/services/salaryCompositionService.js'
import { enumConfigs } from '@/views/salaryComposition/constants/salaryCompositionEnums.js'
const {
  isShowingForm,
  formMode,
  editingItem,
  handleCreate,
  handleEdit,
  handleClone,
  handleCloseForm,
} = useGridFormActions()
const { selectedRows, selectedCount, setSelectedRows, handleClearSelection } =
  useSalaryCompositionSelection()

// -- Table config --

const {
  columns: tableColumns,
  visibleColumns,
  loadColumnConfig,
  saveColumns,
  resetColumns,
} = useGridColumns(defaultTableColumns, {
  userId: GLOBAL_CONSTANTS.DEFAULT_USER_CONFIG_ID,
  gridId: GLOBAL_CONSTANTS.DEFAULT_DATA_TABLE_ID,
})

const isShowColumnSetting = ref(false)
// Sử dụng list data composable
const {
  tableData,
  totalRecords,
  searchResults,
  pagingPayload,
  currentPage,
  pageSize,
  fetchData,
  fetchSearchSuggestions,
  selectSearchItem,
  setDefaultableFilter,
  setMultiValueFilter,
} = useGridData(salaryCompositionService, {
  defaultPageNumber: 1,
  defaultPageSize: 15,
  getSearchTermFromItem: (item) => item.compositionCode,
  enumConfigs,
})

const {
  isShowDeleteConfirmModal,
  isShowSystemDeleteWarningModal,
  salaryCompositionToDelete,
  handleDelete,
  handleConfirmDelete,

  isShowStatusConfirmModal,
  statusConfirmMessage,
  handleToggleStatus,
  handleConfirmToggleStatus,

  isShowBulkStatusConfirmModal,
  bulkStatusConfirmMessage,
  openBulkStatusConfirm,
  handleConfirmBulkStatus,

  isShowBulkDeleteConfirmModal,
  bulkDeleteConfirmMessage,
  bulkDeletableRows,
  openBulkDeleteConfirm,
  handleConfirmBulkDelete,
} = useSalaryCompositionMutations({
  selectedRows,
  tableData,
  pagingPayload,
  fetchData,
  handleClearSelection,
})
// -- Table advanced filters --
const {
  isShowAdvancedFilter,
  filteredAdvancedFilterFields,
  advancedFilterKeyword,
  activeAdvancedFilterProperty,
  advancedFilterDrafts,
  advancedFilterOperatorOptions,
  setActiveAdvancedFilterField,
  toggleAdvancedFilterField,
  updateAdvancedFilterDraft,
  applyAdvancedFilters,
  resetAdvancedFilters,
} = useSalaryCompositionAdvancedFilters({
  pagingPayload,
  fetchData,
})

const {
  currentStatus,
  currentUnits,
  statusOptions,
  unitOptions,
  fetchStatusOptions,
  fetchUnitOptions,
} = useSalaryCompositionFilters({
  setDefaultableFilter,
  setMultiValueFilter,
})

const router = useRouter()

const handleFormSaved = async (mode) => {
  // Reset về trang đầu để bản ghi mới/cập nhật dễ thấy hơn
  pagingPayload.pageNumber = 1
  // Gọi lại API để lấy danh sách mới nhất
  await fetchData()

  if (mode === 'clone') {
    return // giữ nguyên form, không quay về list
  }
  // Sau khi thêm/sửa thành công thì đóng form
  handleCloseForm()
}

const handleRowAction = ({ type, row }) => {
  switch (type) {
    case 'toggle-status':
      handleToggleStatus(row)
      break
    case 'clone':
      handleClone(row)
      break
    case 'edit':
      handleEdit(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// Mở và xử lí form chọn từ danh mục của hệ thống
const isShowAddMenu = ref(false)
const isShowSystemPickerModal = ref(false)

const toggleAddMenu = () => {
  isShowAddMenu.value = !isShowAddMenu.value
}

const openSystemPicker = () => {
  isShowAddMenu.value = false
  isShowSystemPickerModal.value = true
}
// Xử lí hiển thị modal khi click nút setting cột
const handleSaveColumnConfig = async (draftColumns) => {
  await saveColumns(draftColumns)
  isShowColumnSetting.value = false
}
const handleResetColumnConfig = async () => {
  await resetColumns()
  isShowColumnSetting.value = false
}

onMounted(() => {
  fetchStatusOptions()
  fetchUnitOptions()
  fetchData()
  loadColumnConfig()
})

// Xử lí chuyển sang danh mục hệ thống
const goToSystemList = () => {
  router.push('/payroll/salarycomposition/system-category')
}
</script>

<style lang="scss" scoped>
.salary_composition_layout {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #f4f5f8;
  padding: 16px 24px;
}
.header {
  padding-bottom: 16px;
}
.tool_bar {
  padding: 12px 20px;
}
.table_container {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.table_grid_content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* Tùy chỉnh editor cho công thức */
.excel-formula-editor {
  background: transparent;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 13px;
  max-height: 100px;
}
// Đồng bộ style của texarea và editor do cơ chế của prism
:deep(.prism-editor__textarea),
:deep(.prism-editor__editor) {
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace !important;
  outline: none !important;
}
.bulk_actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
<style lang="scss" scoped>
/* CSS hiện tại của màn list */
</style>

<style lang="scss">
/* CSS global riêng cho nút xóa trong modal */
.delete-confirm-button.base_button--secondary {
  background-color: #e54848 !important;
}

.delete-confirm-button.base_button--secondary:hover {
  background-color: #d93b3b !important;
}
.add_button_wrapper {
  position: relative;
}

.add_menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  height: 53px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  padding: 8px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  z-index: 20;
}

.add_menu_item {
  padding: 10px 16px;
  cursor: pointer;

  &:hover {
    background: #eafbf2;
  }
}
</style>
