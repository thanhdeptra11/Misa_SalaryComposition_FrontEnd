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
        v-model:statusFilterValue="currentStatus"
        v-model:unitFilterValue="currentUnits"
        :statusOptions="statusOptions"
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
              <span v-if="value == 1" style="color: #00a85a; display: flex; align-items: start; gap: 4px;">
                Đang theo dõi
              </span>
              <span v-else style="color: #ff9800; display: flex; align-items: start; gap: 4px;">
                Ngừng theo dõi
              </span>
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
  <SalaryCompositionForm v-else @back="isShowingForm = false" @saved="handleFormSaved" />
  
</template>

<script setup>
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/mainViewComponents/Header.vue'
import GridDataToolbar from '@/components/base/baseGridData/GridDataToolbar.vue'
import GridData from '@/components/base/baseGridData/GridData.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'
import GridDataFooter from '@/components/base/baseGridData/GridDataFooter.vue'
import SalaryCompositionForm from './salaryCompositionForm.vue'
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
  // Reset về trang đầu để bản ghi mới có khả năng xuất hiện ngay
  pagingPayload.pageNumber = 1;

  // Gọi lại API để lấy danh sách mới nhất
  await fetchData();
};
// -- Table config --
const tableColumns = ref([
  { field: 'compositionCode', title: 'Mã thành phần', width: 200, fixed: true },
  { field: 'organizationName', title: 'Đơn vị áp dụng', width: 250 },
  { field: 'compositionTypeDescription', title: 'Loại thành phần', width: 200 },
  { field: 'propertyDescription', title: 'Tính chất', width: 150 },
  { field: 'taxableTypeDescription', title: 'Chịu thuế', width: 150 },
  { field: 'taxDeductionType', title: 'Giảm trừ khi tính thuế', width: 200 },
  { field: 'norm', title: 'Định mức', width: 150 },
  { field: 'valueTypeDescription', title: 'Kiểu giá trị', width: 150 },
  { field: 'valueExpression', title: 'Giá trị', width: 250, cellTemplate: 'valueExpressionTemplate' },
  { field: 'description', title: 'Mô tả', width: 250 },
  { field: 'showOnPayslipDescription', title: 'Hiển thị trên phiếu lương', width: 200 },
  { field: 'creationSource', title: 'Nguồn tạo', width: 150 },
  { field: 'status', title: 'Trạng thái', width: 150, cellTemplate: 'statusTemplate' },
  { field: 'compositionName', title: 'Tên thành phần', width: 250 }
]);

const tableData = ref([]);
// Phân trang
const totalRecords = ref(0);
// State cho searchDropdown
const searchResults = ref([]);
const actionButtons = [
  {
    hint: 'Ngừng theo dõi',
    icon: 'icon_minus_yellow',
    onClick: (e) => {
      alert('Minus ' + e.row.data.compositionName)
    }
  },
  {
    hint: 'Nhân bản',
    icon: 'icon_copy_primary',
    onClick: (e) => {
      alert('Clone ' + e.row.data.compositionName)
    }
  },
  {
    hint: 'Sửa',
    icon: 'icon_pencil',
    onClick: (e) => {
      alert('Edit ' + e.row.data.compositionName)
    }
  },
  {
    hint: 'Xóa',
    icon: 'icon_trash_red',
    onClick: (e) => {
      alert('Delete ' + e.row.data.compositionName)
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
// Watch để theo dõi gọi api để fetch lại dùng cho đơn vị
watch(highestSelectedIds, async (newVals) => {
  pagingPayload.pageNumber = 1
  // Giữ filter trạng thái (nếu có), thay thế filter đơn vị
  const statusFilter = pagingPayload.filters.filter(f => f.property === 'status')
  pagingPayload.filters = [
    ...statusFilter,
    ...newVals.map(id => ({
      dataType: "string",
      value: id,
      operator: "=",
      property: "organization_id"
    }))
  ]
  await fetchData()
})

// Nguồn sự thật duy nhất cho phân trang và filter
const pagingPayload = reactive({
  pageNumber: 1,
  pageSize: 15,
  searchTerm: "",
  filters: []
})

// Computed để đồng bộ với GridDataFooter (v-model)
const currentPage = computed({
  get: () => pagingPayload.pageNumber,
  set: (val) => { pagingPayload.pageNumber = val }
})
const pageSize = computed({
  get: () => pagingPayload.pageSize,
  set: (val) => {
    pagingPayload.pageSize = val
    pagingPayload.pageNumber = 1 // Reset về trang 1 khi đổi pageSize
  }
})

// Hàm fetch duy nhất - luôn dùng pagingPayload
const fetchData = async () => {
  try {
    const res = await salaryCompositionService.getPaging({ ...pagingPayload })
    if (res && res.data) {
      tableData.value = Array.isArray(res.data) ? res.data : (res.data.data || [])
      totalRecords.value = res.totalRecords || 0
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu Grid:", error)
  }
}

// Gọi lại api khi thay đổi trang hoặc số bản ghi/trang
watch([() => pagingPayload.pageNumber, () => pagingPayload.pageSize], () => {
  fetchData()
})

// Gọi api khi thay đổi giá trị trạng thái
watch(currentStatus, (status) => {
  handleFilterByStatus(status)
})

onMounted(() => {
  fetchStatusOptions();
  fetchUnitOptions();
  fetchData();
});

const handleSearch = async (keyword) => {
  if (!keyword?.trim()) {
    searchResults.value = []
    pagingPayload.searchTerm = ''
    pagingPayload.pageNumber = 1
    fetchData()
    return
  }
  try {
    // Tìm kiếm gợi ý (dropdown) dùng payload tạm, không ảnh hưởng phân trang
    const res = await salaryCompositionService.getPaging({ ...pagingPayload, searchTerm: keyword, pageNumber: 1 })
    searchResults.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  } catch (error) {
    console.error(error)
  }
};

// Xử lý khi click vào phần chính của button (bên trái mũi tên)
const handleMainClick = () => {
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
// Xử lí khi chọn 1 item từ search
const handleSelectSearchItem = (item) => {
  searchResults.value = []

  tableData.value = [item]

  totalRecords.value = 1
}
// Xử lí khi lọc theo trạng thái
const handleFilterByStatus = async (status) => {
  try {
    pagingPayload.pageNumber = 1
    if (status === GLOBAL_CONSTANTS.DEFAULT_STATUS_FILTER) {
      // Xóa filter trạng thái, giữ lại các filter khác (đơn vị...)
      pagingPayload.filters = pagingPayload.filters.filter(f => f.property !== 'status')
    } else {
      // Thay thế filter trạng thái hiện tại
      const otherFilters = pagingPayload.filters.filter(f => f.property !== 'status')
      pagingPayload.filters = [
        ...otherFilters,
        { dataType: 'int', value: status, operator: '=', property: 'status' }
      ]
    }
    await fetchData()
  } catch (error) {
    console.error("Lỗi khi lọc theo trạng thái:", error)
  }
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