<template>
  <!-- Hiển thị danh sách thành phần lương -->
  <div class="salary_composition_layout" v-if="!isShowingForm">
    <Header class="header" title="Thành phần lương">
      <template #right>
        <BaseButton @click="goToSystemList" variant="primary" iconClass="icon_scale" buttonText="Danh mục của hệ thống" />
        <BaseButton 
          variant="mixed" 
          iconClass="icon_add" 
          buttonText="Thêm mới" 
          @click="handleMainClick"
          @click-dropdown="handleDropdownClick" 
        />
      </template>
    </Header>

    <div class="table_container">
      <GridDataToolbar 
        :searchResults="searchResults"
        class="tool_bar"
        @search="handleSearch"
        @selectSearchItem="handleSelectSearchItem"
        v-model:selectedItem="currentStatus"
        v-model:unitFilterValue="currentUnits"
        :dropdownOptions="statusOptions"
        :unitOptions="unitOptions"
        placeholder="Tất cả đơn vị"  
        labelKey="compositionName"
      >
        <template #search-item="{ item }">
          <span>{{ item.compositionCode + ' - ' + item.compositionName }}</span>
        </template>
      </GridDataToolbar>
      
          <GridData :columns="tableColumns" :data="tableData" :actionButtons="actionButtons">
            
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
// Import cho Prism Editor
import { highlight } from 'prismjs/components/prism-core'
import Prism from '../../utils/prismExcel.js'
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'

import { GLOBAL_CONSTANTS } from '@/constants/globalConstants';
import enumService from '@/services/enumService'
import organizationService from '@/services/organizationService'
import salaryCompositionService from '@/services/salaryCompositionService'

// Hàm highlight syntax cho Prism
const highlighter = (code) => {
  if (!code) return '';
  return highlight(code, Prism.languages.excel, 'excel'); 
};
const { showSuccess, showError } = useToast();
// State modal xóa
const isShowDeleteConfirmModal = ref(false);
const salaryCompositionToDelete = ref(null);
const isDeleting = ref(false);

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
const handleDelete = (row) => {
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
    showError('Không tìm thấy bản ghi');
    isShowDeleteConfirmModal.value = false;
    return;
  }

  try {
    isDeleting.value = true;

    await salaryCompositionService.delete(deleteId);

    showSuccess('Xóa thành công');

    isShowDeleteConfirmModal.value = false;
    salaryCompositionToDelete.value = null;

    if (tableData.value.length === 1 && pagingPayload.pageNumber > 1) {
      pagingPayload.pageNumber -= 1;
    }

    await fetchData();
  } catch (error) {
    console.error('Lỗi khi xóa thành phần lương:', error);
    showError('Xóa thất bại');
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
const handleFormSaved = async () => {
  // Sau khi thêm/sửa thành công thì đóng form
  handleCloseForm();

  // Reset về trang đầu để bản ghi mới/cập nhật dễ thấy hơn
  pagingPayload.pageNumber = 1;

  // Gọi lại API để lấy danh sách mới nhất
  await fetchData();
};

const handleCloseForm = () => {
  // Đóng form và reset trạng thái về thêm mới
  isShowingForm.value = false;
  formMode.value = 'create';
  editingItem.value = null;
};

// -- Table config --
const tableColumns = ref([
  { field: 'compositionCode', title: 'Mã thành phần', width: 200, fixed: true },
  { field: 'organizationName', title: 'Đơn vị áp dụng', width: 250 },
  { field: 'compositionType', title: 'Loại thành phần', width: 200 },
  { field: 'property', title: 'Tính chất', width: 150 },
  { field: 'taxableType', title: 'Chịu thuế', width: 150 },
  { field: 'taxDeductionType', title: 'Giảm trừ khi tính thuế', width: 200 },
  { field: 'norm', title: 'Định mức', width: 150 },
  { field: 'valueType', title: 'Kiểu giá trị', width: 150 },
  { field: 'valueExpression', title: 'Giá trị', width: 250, cellTemplate: 'valueExpressionTemplate' },
  { field: 'description', title: 'Mô tả', width: 250 },
  { field: 'showOnPayslip', title: 'Hiển thị trên phiếu lương', width: 200 },
  { field: 'creationSource', title: 'Nguồn tạo', width: 150 },
  { field: 'status', title: 'Trạng thái', width: 150, cellTemplate: 'statusTemplate' },
  { field: 'compositionName', title: 'Tên thành phần', width: 250 }
]);
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
      targetField: 'compositionType',
      fallback: '-'
    },
    {
      enumName: ENUM_NAMES.FOLLOW_STATUS,
      sourceField: 'status',
      targetField: 'status',
      fallback: '-'
    },
    {
      enumName: ENUM_NAMES.COMPOSITION_PROPERTY,
      sourceField: 'property',
      targetField: 'property',
      fallback: '-'
    },
    {
      enumName: ENUM_NAMES.TAX_APPLIED_TYPE,
      sourceField: 'taxableType',
      targetField: 'taxableType',
      fallback: '-'
    },
    {
      enumName: ENUM_NAMES.MI_VALUE_TYPE,
      sourceField: 'valueType',
      targetField: 'valueType',
      fallback: '-'
    },
    {
      enumName: ENUM_NAMES.DISPLAY_PAYROLL_TYPE,
      sourceField: 'showOnPayslip',
      targetField: 'showOnPayslip',
      fallback: '-'
    }
  ]
})

const handleSearch = fetchSearchSuggestions
const handleSelectSearchItem = selectSearchItem

// State mode hiện tại của form
const formMode = ref('create');
// Dữ liệu dòng đang sửa, truyền xuống form để bind
const editingItem = ref(null);
const actionButtons = [
  {
    hint: 'Ngừng theo dõi',
    icon: 'icon_minus_yellow',
    onClick: (row) => {
      alert('Minus ' + row.compositionName)
    }
  },
  {
    hint: 'Nhân bản',
    icon: 'icon_copy_primary',
    onClick: (row) => {
      alert('Clone ' + row.compositionName)
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
// State trạng thái form
const isShowingForm = ref(false);

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
});


// Xử lý khi click vào phần chính của button (bên trái mũi tên)
const handleMainClick = () => {
  // Mở form ở chế độ thêm mới
  formMode.value = 'create';
  editingItem.value = null;
  isShowingForm.value = true;
};
// Xử lí khi click vào nút thêm
const handleEdit = (row) => {
  // Lưu row đang sửa để form bind dữ liệu
  editingItem.value = row;

  // Đổi form sang chế độ sửa
  formMode.value = 'edit';

  // Hiển thị form
  isShowingForm.value = true;
};
// Xử lý khi click vào phần mũi tên (dropdown)
const handleDropdownClick = () => {
  console.log('Dropdown clicked: Mở menu hành động');
};

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
</style>
