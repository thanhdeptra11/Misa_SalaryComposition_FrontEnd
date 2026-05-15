<template>
  <div class="system-list-layout">
    <!-- Header tự build theo style của BaseFormLayout -->
    <div class="system-list-header">
      <div class="header-left">
        <div class="back-bg">
          <div
            class="icon_arrow_left btn-back"
            @click="handleBack"
          ></div>
        </div>

        <div class="page-title">
          Danh mục thành phần lương của hệ thống
        </div>
      </div>
    </div>

    <!-- Body chứa toolbar + grid + footer -->
    <div class="system-list-body">
      <div class="table_container">
        <GridDataToolbar
          :searchResults="searchResults"
          class="tool_bar"
          labelKey="compositionName"
          :statusOptions="statusOptions"
          :show-unit-filter="false"
          :show-status-filter="true"
          @search="handleSearch"
          @selectSearchItem="handleSelectSearchItem"
        >
          <template #search-item="{ item }">
            <span>{{ item.compositionCode }} - {{ item.compositionName }}</span>
          </template>
        </GridDataToolbar>

        <GridData
          :columns="tableColumns"
          :data="displayTableData"
        >
          <template #valueExpressionTemplate="{ value }">
            <!-- Cột Giá trị dùng template riêng nên phải tự fallback dấu - -->
            <span v-if="isEmptyCellValue(value)">-</span>

            <prism-editor
              v-else
              class="excel-formula-editor"
              :modelValue="value"
              :highlight="highlighter"
              :readonly="true"
            />
          </template>
        </GridData>

        <GridDataFooter
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          :totalRecords="filteredTableData.length"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import GridData from '@/components/base/baseGridData/GridData.vue';
import GridDataToolbar from '@/components/base/baseGridData/GridDataToolbar.vue';
import GridDataFooter from '@/components/base/baseGridData/GridDataFooter.vue';
import salaryCompositionSystemService from '@/services/salaryCompositionSystemService';
import { GLOBAL_CONSTANTS } from '@/constants/globalConstants';
import enumService from '@/services/enumService';
import { highlight } from 'prismjs/components/prism-core';
import Prism from '@/utils/prismExcel.js';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';

const router = useRouter();

// Dữ liệu gốc lấy từ API getAll
const tableData = ref([]);

// Dữ liệu gợi ý khi search trên toolbar
const searchResults = ref([]);

// Từ khóa search hiện tại để filter client-side
const searchKeyword = ref('');

// Vì API getAll trả toàn bộ dữ liệu nên phân trang ở FE
const currentPage = ref(1);
const pageSize = ref(15);
// Lấy dữ liệu statusOptions
const statusOptions = ref([GLOBAL_CONSTANTS.DEFAULT_STATUS_FILTER]);
const tableColumns = ref([
  { field: 'compositionCode', title: 'Mã thành phần', minWidth: 260, fixed: true },
  { field: 'compositionName', title: 'Tên thành phần', minWidth: 320 },
  { field: 'compositionTypeDescription', title: 'Loại thành phần', width: 200 },
  { field: 'propertyDescription', title: 'Tính chất', width: 160 },
  { field: 'valueTypeDescription', title: 'Kiểu giá trị', width: 160 },
  { field: 'valueExpression', title: 'Giá trị', width: 260, cellTemplate: 'valueExpressionTemplate' }
]);

const highlighter = (code) => {
  // Prism editor cần chuỗi hợp lệ để highlight
  if (!code) return '';

  return highlight(code, Prism.languages.excel, 'excel');
};

const isEmptyCellValue = (value) => {
  // Chỉ coi null, undefined, chuỗi rỗng là không có dữ liệu
  return value === null || value === undefined || String(value).trim() === '';
};

const formatCellValue = (value) => {
  // Chuẩn hóa dữ liệu rỗng về "-" cho các cột không dùng template
  return isEmptyCellValue(value) ? '-' : value;
};

const normalizeSystemComposition = (item) => {
  // Chỉ format các cột đang hiển thị để tránh làm biến dạng dữ liệu gốc không dùng tới
  return {
    ...item,
    compositionCode: formatCellValue(item.compositionCode),
    compositionName: formatCellValue(item.compositionName),
    compositionTypeDescription: formatCellValue(item.compositionTypeDescription),
    propertyDescription: formatCellValue(item.propertyDescription),
    valueTypeDescription: formatCellValue(item.valueTypeDescription)
  };
};
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
}

const fetchData = async () => {
  try {
    // Màn danh mục hệ thống lấy dữ liệu từ API getAll
    const response = await salaryCompositionSystemService.getAll();

    tableData.value = Array.isArray(response)
      ? response.map(normalizeSystemComposition)
      : [];
  } catch (error) {
    console.error('Lỗi khi lấy danh mục thành phần lương hệ thống:', error);
    tableData.value = [];
  }
};

const filteredTableData = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  // Không có từ khóa thì hiển thị toàn bộ danh sách
  if (!keyword) return tableData.value;

  return tableData.value.filter((item) => {
    const compositionCode = String(item.compositionCode ?? '').toLowerCase();
    const compositionName = String(item.compositionName ?? '').toLowerCase();

    return compositionCode.includes(keyword) || compositionName.includes(keyword);
  });
});

const displayTableData = computed(() => {
  // Cắt dữ liệu theo trang hiện tại
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;

  return filteredTableData.value.slice(startIndex, endIndex);
});

const handleSearch = (keyword) => {
  // Search client-side vì API getAll đã có toàn bộ dữ liệu
  searchKeyword.value = keyword || '';
  currentPage.value = 1;

  if (!searchKeyword.value.trim()) {
    searchResults.value = [];
    return;
  }

  searchResults.value = filteredTableData.value.slice(0, 10);
};

const handleSelectSearchItem = (item) => {
  // Chọn suggestion thì dùng tên/mã của item làm từ khóa lọc
  searchKeyword.value = item?.compositionName || item?.compositionCode || '';
  searchResults.value = [];
  currentPage.value = 1;
};

const handleBack = () => {
  // Quay lại màn danh sách thành phần lương
  router.push('/payroll/salarycomposition');
};

onMounted(() => {
  fetchData();
  fetchStatusOptions();
});
</script>

<style scoped lang="scss">
.system-list-layout {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f1f2f1;
}

.system-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.back-bg {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;

  &:hover {
    border-radius: 50%;
    background-color: #dadce3;
  }
}

.btn-back {
  cursor: pointer;
  transition: opacity 0.2s;
}

.page-title {
  font-size: 20px;
  letter-spacing: 0.384px !important;
  color: #212121;
  font-weight: 700;
  margin-right: 8px;
}

.system-list-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table_container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.tool_bar {
  padding: 12px 20px;
}

.excel-formula-editor {
  background: transparent;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 13px;
  max-height: 100px;
}

:deep(.prism-editor__textarea),
:deep(.prism-editor__editor) {
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace !important;
  outline: none !important;
}
</style>
