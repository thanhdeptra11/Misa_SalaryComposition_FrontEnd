<template>
  <!-- Hiển thị danh sách thành phần lương -->
  <div class="salary_composition_layout" v-if="!isShowingForm">
    <Header class="header" title="Thành phần lương">
      <template #right>
        <BaseButton @click="goToSystemList" variant="primary" iconClass="icon_scale" buttonText="Danh mục của hệ thống" />
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
              <div class="add_menu_item" @click="openSystemPicker">
                Chọn từ danh mục của hệ thống
              </div>
            </div>
        </div>
      </template>
    </Header>

    <div class="table_container">
      <GridDataToolbar 
        :searchResults="searchResults"
        class="tool_bar"
        :selectedCount="selectedCount"
        @clearSelection="handleClearSelection"
        @search="handleSearch"
        @selectSearchItem="handleSelectSearchItem"
        @openColumnSetting="isShowColumnSetting = true"
        v-model:selectedItem="currentStatus"
        v-model:unitFilterValue="currentUnits"
        :dropdownOptions="statusOptions"
        :unitOptions="unitOptions"
        dropdownPlaceholder="Tất cả trạng thái"
        placeholder="Tất cả đơn vị"  
        labelKey="compositionName"
      >
        <template #search-item="{ item }">
          <span>{{ item.compositionCode + ' - ' + item.compositionName }}</span>
        </template>
        <template #selection-actions>
          <div class="bulk_actions">
            
                <BaseButton 
                variant="outline-color"
                iconClass="icon_minus_yellow"
                buttonText="Ngừng theo dõi"
                buttonColor="#f90"
                @click="openBulkStatusConfirm(0)" />
                <BaseButton 
                variant="outline-color"
                iconClass="icon_check_green"
                buttonText="Đang theo dõi"
                buttonColor="#34b057"
                @click="openBulkStatusConfirm(1)"
                />
                <BaseButton 
                variant="outline-color"
                iconClass="icon_trash_red"
                buttonText="Xóa"
                buttonColor="#ff6161"
                @click="openBulkDeleteConfirm"
                />
          </div>
        </template>
      </GridDataToolbar>
      
          <GridData :columns="visibleColumns" 
          :data="tableData" 
          :actionButtons="actionButtons"
          @selectionChanged="setSelectedRows"
          ref="gridRef">
            
            <template #valueExpressionTemplate="{ value }">
              <!-- Nếu công thức rỗng thì hiển thị dấu -, không render editor trống -->
              <span v-if="value === null || value === undefined || String(value).trim() === ''">
                -
              </span>  
              <prism-editor 
                v-else
                class="excel-formula-editor" 
                :modelValue="value || ''" 
                :highlight="highlighter" 
                :readonly="true" 
              />
            </template>

            <template #statusTemplate="{ value }">
              <span
                v-if="value === 'Đang theo dõi'"
                style="color: #00a85a; display: flex; align-items: start; gap: 4px;"
              >
                Đang theo dõi
              </span>
              <span
                v-else-if="value === 'Ngừng theo dõi'"
                style="color: #ff9800; display: flex; align-items: start; gap: 4px;"
              >
                Ngừng theo dõi
              </span>
              <span v-else>-</span>
            </template>
          </GridData>
          
      
      <GridDataFooter 
        v-model:currentPage="currentPage"
        v-model:pageSize="pageSize"
        :totalRecords="totalRecords"
      />
    </div>
  </div>
  <!-- Hiển thị form -->
  <SalaryCompositionForm v-else
  :mode="formMode"
  :editing-item="editingItem"
  @back="handleCloseForm"
  @saved="handleFormSaved"
  />
  <BaseConfirmModal
  v-model="isShowDeleteConfirmModal"
  title="Thông báo"
  :message="`Bạn có chắc chắn muốn xóa thành phần lương ${salaryCompositionToDelete?.compositionName || ''} không?`"
  cancelText="Hủy"
  confirmText="Xóa"
  :showSecondary="false"
  confirmButtonClass="delete-confirm-button"
  width="500px"
  @confirm="handleConfirmDelete"
/>
<BaseConfirmModal
  v-model="isShowStatusConfirmModal"
  title="Chuyển trạng thái"
  :message="statusConfirmMessage"
  cancelText="Hủy bỏ"
  confirmText="Đồng ý"
  :showSecondary="false"
  width="500px"
  @confirm="handleConfirmToggleStatus"
/>
<BaseConfirmModal
  v-model="isShowSystemDeleteWarningModal"
  title="Thông báo"
  message="Đây là thành phần lương mặc định của hệ thống nên không thể xóa. Vui lòng kiểm tra lại."
  confirmText="Đóng"
  @confirm="isShowSystemDeleteWarningModal = false"
  :showCancel="false"
  :showSecondary="false"
  width="500px"
/>
<BaseConfirmModal
  v-model="isShowBulkStatusConfirmModal"
  title="Chuyển trạng thái"
  :message="bulkStatusConfirmMessage"
  cancelText="Hủy bỏ"
  confirmText="Đồng ý"
  :showSecondary="false"
  width="500px"
  @confirm="handleConfirmBulkStatus"
/>
<BaseConfirmModal
  v-model="isShowBulkDeleteConfirmModal"
  title="Xóa thành phần lương"
  :message="bulkDeleteConfirmMessage"
  cancelText="Hủy"
  confirmText="Xóa"
  :showCancel="bulkDeletableRows.length > 0"
  :showSecondary="false"
  confirmButtonClass="delete-confirm-button"
  width="500px"
  @confirm="handleConfirmBulkDelete"
/>
  <SalaryCompositionSystemPickerModal
  v-model="isShowSystemPickerModal"
  @saved="fetchData"
/>
<ColumnSettingModal
v-model="isShowColumnSetting"
  parent-id="btnSettingColumn"
  :columns="tableColumns"
  @save="handleSaveColumnConfig"
  @reset="handleResetColumnConfig"
/>
</template>

<script setup>
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/components/base/composables/useToast.js'
import { useGridData } from '@/components/base/composables/useGridData.js'
import { ENUM_NAMES } from '@/constants/enumDisplayConstants'
import Header from '@/components/mainViewComponents/Header.vue'
import GridDataToolbar from '@/components/base/baseGridData/GridDataToolbar.vue'
import GridData from '@/components/base/baseGridData/GridData.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'
import GridDataFooter from '@/components/base/baseGridData/GridDataFooter.vue'
import SalaryCompositionForm from './salaryCompositionForm.vue'
import BaseConfirmModal from '@/components/base/baseModal/BaseConfirmModal.vue'
import SalaryCompositionSystemPickerModal from './SalaryCompositionSystemPickerModal.vue';
import ColumnSettingModal from '@/components/base/baseGridData/ColumnSettingModal.vue'
// Import cho Prism Editor
import { highlight } from 'prismjs/components/prism-core'
import Prism from '../../utils/prismExcel.js'
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'

import { GLOBAL_CONSTANTS } from '@/constants/globalConstants'
import organizationService from '@/services/organizationService'
import salaryCompositionService from '@/services/salaryCompositionService'
import { t } from '@/utils/resourseReader'
import { useGridFormActions } from '@/components/base/composables/useGridFormActions.js';
import { useGridSelection } from '@/components/base/composables/useGridSelection.js';
import { useGridColumns } from '@/components/base/composables/useGridColumn.js'
const {
  isShowingForm,
  formMode,
  editingItem,
  handleCreate,
  handleEdit,
  handleClone,
  handleCloseForm
} = useGridFormActions();
const {
  selectedRows,
  selectedCount,
  setSelectedRows,
  clearSelection
} = useGridSelection();

// -- Table config --
const defaultTableColumns = [
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
]

const {
  columns: tableColumns,
  visibleColumns,
  loadColumnConfig,
  saveColumns,
  resetColumns
} = useGridColumns(defaultTableColumns, {
  userId: GLOBAL_CONSTANTS.DEFAULT_USER_CONFIG_ID,
  gridId: GLOBAL_CONSTANTS.DEFAULT_DATA_TABLE_ID
})

const isShowColumnSetting = ref(false)
// Hàm highlight syntax cho Prism
const highlighter = (code) => {
  if (!code) return '';
  return highlight(code, Prism.languages.excel, 'excel'); 
};
const gridRef = ref(null);
/*
clearSelection() trong composable chỉ làm selectedRows = []
State của checkbox thật trong DataGrid
*/ 
const handleClearSelection = () => {
  clearSelection();              // xóa state ngoài toolbar
  gridRef.value?.clearSelection(); // bỏ tick thật trong grid
};
const { showSuccess, showError } = useToast();
// State modal xóa
const isShowDeleteConfirmModal = ref(false);
const salaryCompositionToDelete = ref(null);
const isDeleting = ref(false);
// State modal chuyển trạng thái
const isShowStatusConfirmModal = ref(false);
const salaryCompositionToToggle = ref(null);
const isUpdatingStatus = ref(false);
const isTracking = (status) => status === 1 || status === true;

const nextStatus = computed(() => {
  // Computed đã theo dõi biến reactive salaryCompositionToToggle
  if (!salaryCompositionToToggle.value) return 1;
  return isTracking(salaryCompositionToToggle.value.status) ? 0 : 1;
});

const nextStatusText = computed(() =>
  nextStatus.value === 1 ? 'đang theo dõi' : 'ngừng theo dõi'
);
const statusConfirmMessage = computed(() => {
  // Computed đã theo dõi biến reactive salaryCompositionToToggle
  const name = salaryCompositionToToggle.value?.compositionName || '';

  return GLOBAL_CONSTANTS.STATUS_CHANGE_CONFIRM_MESSAGE(
    name,
    nextStatusText.value
  );
});
// Hàm mở modal
const handleToggleStatus = (row) => {
  salaryCompositionToToggle.value = row;
  isShowStatusConfirmModal.value = true;
};
// Hàm build payload
const buildToggleStatusPayload = (row, status) => ({
  id: row.id || row.salaryCompositionId,
  organizationId: row.organizationId,
  systemCompositionId: row.systemCompositionId,
  compositionCode: row.compositionCode,
  compositionName: row.compositionName,
  compositionType: row.compositionType,
  property: row.property,
  taxableType: row.taxableType,
  taxDeductionType: row.taxDeductionType,
  norm: row.norm,
  valueType: row.valueType,
  valueExpression: row.valueExpression,
  description: row.description,
  showOnPayslip: row.showOnPayslip,
  creationSource: row.creationSource,
  status: status === 1
});
// Hàm confirm update status
const handleConfirmToggleStatus = async () => {
  if (isUpdatingStatus.value || !salaryCompositionToToggle.value) return;

  try {
    isUpdatingStatus.value = true;

    const payload = buildToggleStatusPayload(
      salaryCompositionToToggle.value,
      nextStatus.value
    );

    await salaryCompositionService.update(payload);

    showSuccess(t('message.activities.updateSuccess'));

    isShowStatusConfirmModal.value = false;
    salaryCompositionToToggle.value = null;

    await fetchData();
  } catch (error) {
    showError(error?.message || t('message.activities.updateError'));
  } finally {
    isUpdatingStatus.value = false;
  }
};
const router = useRouter();
// -- Toolbar states --
const currentStatus = ref(99);
const currentUnits = ref([]);
const statusOptions = ref([]);
const unitOptions = ref([]);
const fetchStatusOptions = async () => {
  try {
    const data = await enumService.getEnumByName('FollowStatus');
    if (data && Array.isArray(data)) {
      statusOptions.value = data.map(item => ({
        label: item.description,
        value: item.value
      }));
      // Cập nhật giá trị hiện tại nếu giá trị đang có không nằm trong danh sách
      if (statusOptions.value.length > 0 && !statusOptions.value.some(o => o.value === currentStatus.value)) {
        currentStatus.value = statusOptions.value[0].value;
      }
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu FollowStatus:", error);
  }
};

// Bấm icon trash mở modal
const isShowSystemDeleteWarningModal = ref(false);
const handleDelete = (row) => {
  if (row.systemCompositionId) {
    isShowSystemDeleteWarningModal.value = true;
    return;
  }
  salaryCompositionToDelete.value = row;
  isShowDeleteConfirmModal.value = true;
};
// Hàm xác nhận xóa
const handleConfirmDelete = async () => {
  if (isDeleting.value || !salaryCompositionToDelete.value) return;

  const deleteId =
    salaryCompositionToDelete.value.id ||
    salaryCompositionToDelete.value.salaryCompositionId;

  if (!deleteId) {
    showError(error.message || t('message.activities.deleteError'));
    isShowDeleteConfirmModal.value = false;
    return;
  }

  try {
    isDeleting.value = true;

    await salaryCompositionService.delete(deleteId);

    showSuccess(t('message.activities.deleteSuccess'));

    isShowDeleteConfirmModal.value = false;
    salaryCompositionToDelete.value = null;

    if (tableData.value.length === 1 && pagingPayload.pageNumber > 1) {
      pagingPayload.pageNumber -= 1;
    }

    await fetchData();
  } catch (error) {
    showError(error?.message || t('message.activities.deleteError'));
  } finally {
    isDeleting.value = false;
  }
};

const fetchUnitOptions = async () => {
  try {
    const data = await organizationService.getOrganizations();
    if (data && Array.isArray(data)) {
      unitOptions.value = data;
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu phòng ban:", error);
  }
};
const handleFormSaved = async (mode) => {
  // Reset về trang đầu để bản ghi mới/cập nhật dễ thấy hơn
  pagingPayload.pageNumber = 1;
  // Gọi lại API để lấy danh sách mới nhất
  await fetchData();
  
  if (mode === 'clone') {
    return; // giữ nguyên form, không quay về list
  }
  // Sau khi thêm/sửa thành công thì đóng form
  handleCloseForm();
};

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
  setMultiValueFilter
} = useGridData(salaryCompositionService, {
  defaultPageNumber: 1,
  defaultPageSize: 15,
  getSearchTermFromItem: (item) => item.compositionCode,
  enumConfigs: [
    {
      enumName: ENUM_NAMES.COMPOSITION_TYPE,
      sourceField: 'compositionType',
      targetField: 'compositionTypeDesc',
      fallback: '-'
    },
    {
      enumName: ENUM_NAMES.FOLLOW_STATUS,
      sourceField: 'status',
      targetField: 'statusDesc',
      fallback: '-'
    },
    {
      enumName: ENUM_NAMES.COMPOSITION_PROPERTY,
      sourceField: 'property',
      targetField: 'propertyDesc',
      fallback: '-'
    },
    {
      enumName: ENUM_NAMES.TAX_APPLIED_TYPE,
      sourceField: 'taxableType',
      targetField: 'taxableTypeDesc',
      fallback: '-'
    },
    {
      enumName: ENUM_NAMES.MI_VALUE_TYPE,
      sourceField: 'valueType',
      targetField: 'valueTypeDesc',
      fallback: '-'
    },
    {
      enumName: ENUM_NAMES.DISPLAY_PAYROLL_TYPE,
      sourceField: 'showOnPayslip',
      targetField: 'showOnPayslipDesc',
      fallback: '-'
    }
  ]
})

const handleSearch = fetchSearchSuggestions
const handleSelectSearchItem = selectSearchItem

const actionButtons = [
  {
    hint: (row) => isTracking(row.status) ? 'Ngừng theo dõi' : 'Theo dõi',
    icon: (row) => isTracking(row.status) ? 'icon_minus_yellow' : 'icon_check_green',
    onClick: (row) => {
      handleToggleStatus(row);
    }
  },
  {
    hint: 'Nhân bản',
    icon: 'icon_copy_primary',
    onClick: (row) => {
      handleClone(row);
    }
  },
  {
    hint: 'Sửa',
    icon: 'icon_pencil',
    onClick: (row) => {
      handleEdit(row);
    }
  },
  {
    hint: 'Xóa',
    icon: 'icon_trash_red',
    onClick: (row) => {
      handleDelete(row);
    }
  }
];


// Computed tính toán để chỉ lấy id các đơn vị cấp cao nhất
const highestSelectedIds = computed(() => {
  const selectedSet = new Set(currentUnits.value)

  const orgMap = new Map(
    unitOptions.value.map(org => [org.id, org])
  )

  return currentUnits.value.filter(id => {
    const org = orgMap.get(id)

    return org && !selectedSet.has(org.parentId)
  })
})
// Mở và xử lí form chọn từ danh mục của hệ thống
  const isShowAddMenu = ref(false);
  const isShowSystemPickerModal = ref(false);

  const toggleAddMenu = () => {
    isShowAddMenu.value = !isShowAddMenu.value;
  };

  const openSystemPicker = () => {
    isShowAddMenu.value = false;
    isShowSystemPickerModal.value = true;
  };
  // Xử lí hiển thị modal khi click nút setting cột
  const handleSaveColumnConfig = async (draftColumns) => {
  await saveColumns(draftColumns)
  isShowColumnSetting.value = false
}
/*==================Xử lí các bulk actions============================
*/ 
/* Xử lí bulk theo dõi*/
const isShowBulkStatusConfirmModal = ref(false)
const bulkTargetStatus = ref(null)
const isUpdatingBulkStatus = ref(false)

const bulkStatusText = computed(() =>
  bulkTargetStatus.value === 1 ? 'đang theo dõi' : 'ngừng theo dõi'
)
// Lấy giá trị text
const bulkStatusConfirmMessage = computed(() =>
  `Bạn có chắc chắn muốn chuyển trạng thái thành phần lương đã chọn sang ${bulkStatusText.value} không?`
)
// Mở modal xác nhận bulk theo dõi
const openBulkStatusConfirm = (status) => {
  if (!selectedRows.value.length) return

  bulkTargetStatus.value = status
  isShowBulkStatusConfirmModal.value = true
}
// Build payload cho bulk theo dõi
const buildBulkStatusPayload = (status) =>
  selectedRows.value.map((row) => ({
    ...buildToggleStatusPayload(row, status),
    state: 2
  }))

// Xử lí confirm bulk theo dõi
const handleConfirmBulkStatus = async () => {
  if (
    isUpdatingBulkStatus.value ||
    bulkTargetStatus.value === null ||
    !selectedRows.value.length
  ) {
    return
  }

  try {
    isUpdatingBulkStatus.value = true

    await salaryCompositionService.saveData(
      buildBulkStatusPayload(bulkTargetStatus.value)
    )

    showSuccess(t('message.activities.updateSuccess'))

    isShowBulkStatusConfirmModal.value = false
    bulkTargetStatus.value = null

    handleClearSelection()
    await fetchData()
  } catch (error) {
    showError(error?.message || t('message.activities.updateError'))
  } finally {
    isUpdatingBulkStatus.value = false
  }
}
/* =========================Xử lí bulk theo dõi==================*/
/* Xử lí bulk xóa*/
const isShowBulkDeleteConfirmModal = ref(false)
const bulkSystemRows = ref([])
const bulkDeletableRows = ref([])
const isBulkDeleting = ref(false)
// Hàm xử lí content của modal
const bulkDeleteConfirmMessage = computed(() => {
  const systemNames = bulkSystemRows.value
    .map(row => row.compositionName)
    .filter(Boolean)
    .join(', ')

  if (bulkSystemRows.value.length && bulkDeletableRows.value.length) {
    return `${systemNames} là giá trị mặc định của hệ thống nên không thể xóa. Bạn có muốn xóa các bản ghi còn lại không?`
  }

  if (bulkSystemRows.value.length && !bulkDeletableRows.value.length) {
    return `${systemNames} là giá trị mặc định của hệ thống nên không thể xóa.`
  }

  return `Bạn có chắc chắn muốn xóa ${bulkDeletableRows.value.length} thành phần lương đã chọn không?`
})
// Mở modal xác nhận bulk xóa
const openBulkDeleteConfirm = () => {
  if (!selectedRows.value.length) return

  bulkSystemRows.value = selectedRows.value.filter(
    row => row.systemCompositionId
  )

  bulkDeletableRows.value = selectedRows.value.filter(
    row => !row.systemCompositionId
  )

  isShowBulkDeleteConfirmModal.value = true
}
// Hàm confirm bulk xóa
const handleConfirmBulkDelete = async () => {
  if (isBulkDeleting.value || !bulkDeletableRows.value.length) return

  const deleteIds = bulkDeletableRows.value
    .map(row => row.id || row.salaryCompositionId)
    .filter(Boolean)

  if (!deleteIds.length) return

  try {
    isBulkDeleting.value = true

    await salaryCompositionService.deleteMultiple(deleteIds)

    showSuccess(t('message.activities.deleteSuccess'))

    isShowBulkDeleteConfirmModal.value = false
    bulkSystemRows.value = []
    bulkDeletableRows.value = []

    handleClearSelection()
    await fetchData()
  } catch (error) {
    showError(error?.message || t('message.activities.deleteError'))
  } finally {
    isBulkDeleting.value = false
  }
}
/*===================Xử lí bulk xóa==============*/


/*==================Xử lí các bulk actions=====================================================
*/ 
const handleResetColumnConfig = async () => {
  await resetColumns()
  isShowColumnSetting.value = false
}
// Watch để theo dõi đơn vị để build filter cho một list param cùng property
watch(highestSelectedIds, async (newVals) => {
  await setMultiValueFilter({
    property: 'organization_id',
    values: newVals,
    dataType: 'string'
  })
})
// Watch để theo dõi trạng thái để build filter
watch(currentStatus, async (newVal) => {
  await setDefaultableFilter({
    property: 'status',
    value: newVal,
    defaultValue: GLOBAL_CONSTANTS.DEFAULT_STATUS_FILTER,
    dataType: 'number'
  })
})
onMounted(() => {
  fetchStatusOptions();
  fetchUnitOptions();
  fetchData();
  loadColumnConfig()
});





// Xử lí chuyển sang danh mục hệ thống
const goToSystemList = () => {
  router.push('/payroll/salarycomposition/system-category');
};
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
.header{
  padding-bottom: 16px;
}
.tool_bar{
  padding: 12px 20px;
}
.table_container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Tùy chỉnh editor cho công thức */
.excel-formula-editor {
  background: transparent;
  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
  font-size: 13px;
  max-height: 100px;
}
// Đồng bộ style của texarea và editor do cơ chế của prism
:deep(.prism-editor__textarea),
:deep(.prism-editor__editor) {
  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace !important;
  outline: none !important;
}
.bulk_actions{
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
  background-color: #E54848 !important;
}

.delete-confirm-button.base_button--secondary:hover {
  background-color: #D93B3B !important;
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, .12);
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
