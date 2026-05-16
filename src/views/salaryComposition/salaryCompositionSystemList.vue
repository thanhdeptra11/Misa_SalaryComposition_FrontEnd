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
          :dropdownOptions="compositionTypeOptions"
          v-model:selectedItem="currentCompositionType"
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
          :data="tableData"
        >
          <template #valueExpressionTemplate="{ value }">
            <!-- Cột Giá trị dùng template riêng nên phải tự fallback dấu - -->
            <span v-if="!value || value === ''">-</span>

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
          :totalRecords="totalRecords"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGridData } from '@/components/base/composables/useGridData.js'
import { ENUM_NAMES, getEnumOptions } from '@/constants/enumDisplayConstants'
import GridData from '@/components/base/baseGridData/GridData.vue';
import GridDataToolbar from '@/components/base/baseGridData/GridDataToolbar.vue';
import GridDataFooter from '@/components/base/baseGridData/GridDataFooter.vue';
import salaryCompositionSystemService from '@/services/salaryCompositionSystemService';
import { GLOBAL_CONSTANTS } from '@/constants/globalConstants';
import { highlight } from 'prismjs/components/prism-core';
import Prism from '@/utils/prismExcel.js';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';

const router = useRouter();
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
} = useGridData(salaryCompositionSystemService, {
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
const compositionTypeOptions = ref([]);
const currentCompositionType = ref(GLOBAL_CONSTANTS.DEFAULT_STATUS_FILTER);
const fetchCompositionTypeOptions = () => {
  try {
    debugger
    compositionTypeOptions.value = getEnumOptions(ENUM_NAMES.COMPOSITION_TYPE,
      {value: GLOBAL_CONSTANTS.DEFAULT_STATUS_FILTER, label: "Tất cả thành phần"}
    );
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu thành phần:", error);
  }
};
const handleBack = () => {
  // Quay lại màn danh sách thành phần lương
  router.push('/payroll/salarycomposition');
};
// Watch để theo dõi trạng thái để build filter
watch(currentCompositionType, async (newVal) => {
  await setDefaultableFilter({
    property: 'composition_type',
    value: newVal,
    defaultValue: GLOBAL_CONSTANTS.DEFAULT_STATUS_FILTER,
    dataType: 'number'
  })
})
onMounted(() => {
  fetchData();
  fetchCompositionTypeOptions();
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
