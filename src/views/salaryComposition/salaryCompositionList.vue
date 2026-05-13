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
        class="tool_bar"
        @search="handleSearch"
        v-model:statusFilterValue="currentStatus"
        v-model:unitFilterValue="currentUnit"
        :statusOptions="statusOptions"
        :unitOptions="unitOptions"
        placeholder="Tất cả đơn vị"  
      />
      
          <GridData :columns="tableColumns" :data="tableData" :actionButtons="actionButtons">
            
            <template #valueExpressionTemplate="{ value }">
              <prism-editor 
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
  <SalaryCompositionForm v-else @back="isShowingForm = false" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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
const currentStatus = ref('');
const currentUnit = ref([]);
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

const tableData = ref([]);
// Phân trang
const totalRecords = ref(0);
const currentPage = ref(1);
const pageSize = ref(15);
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

const fetchGridData = async () => {
  try {
    const payload = {
      pageNumber: currentPage.value,
      pageSize: pageSize.value,
      searchTerm: "",
      filters: []
    };
    const res = await salaryCompositionService.getPaging(payload);
    // Giả sử res trả về data.data theo cấu trúc đã cung cấp
    if (res && res.data) {
      // res.data có thể là mảng trực tiếp hoặc nằm trong res.data.data
      tableData.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
      totalRecords.value = res.totalRecords || 0;
    }
  } catch(error) {
    console.error("Lỗi khi lấy dữ liệu Grid:", error);
  }
}
// Gọi lại api khi thay đổi số trang hoặc bản ghi
watch([currentPage, pageSize], () => {
  fetchGridData();
})

onMounted(() => {
  fetchStatusOptions();
  fetchUnitOptions();
  fetchGridData();
});

const handleSearch = (keyword) => {
  console.log("Tìm kiếm:", keyword);
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