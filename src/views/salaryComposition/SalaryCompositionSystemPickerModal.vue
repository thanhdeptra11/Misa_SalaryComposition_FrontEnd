<template>
  <ModalBasis
    :model-value="modelValue"
    title="Thêm từ danh mục của hệ thống"
    width="1400px"
    maxHeight="90vh"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <div class="picker-content">
      <GridDataToolbar
        :searchResults="searchResults"
        dropdownPlaceholder="Tất cả thành phần"
        labelKey="compositionName"
        :dropdownOptions="compositionTypeOptions"
        v-model:selectedItem="currentCompositionType"
        :show-unit-filter="false"
        :show-status-filter="true"
        :selectedCount="selectedCount"
        @clearSelection="handleClearSelection"
        @search="handleSearch"
        @selectSearchItem="handleSelectSearchItem"
      >
        <template #search-item="{ item }">
          <span>{{ item.compositionCode }} - {{ item.compositionName }}</span>
        </template>
      </GridDataToolbar>

      <GridData
        ref="gridRef"
        :columns="tableColumns"
        :data="tableData"
        @selectionChanged="setSelectedRows"
      >
        <template #valueExpressionTemplate="{ value }">
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

    <template #footer>
      <BaseButton
        variant="primary"
        buttonText="Hủy bỏ"
        @click="handleClose"
      />

      <BaseButton
        variant="secondary"
        buttonText="Đồng ý"
        @click="handleConfirm"
      />
    </template>
  </ModalBasis>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

import ModalBasis from '@/components/base/baseModal/ModalBasis.vue';
import BaseButton from '@/components/base/baseButton/BaseButton.vue';
import GridData from '@/components/base/baseGridData/GridData.vue';
import GridDataToolbar from '@/components/base/baseGridData/GridDataToolbar.vue';
import GridDataFooter from '@/components/base/baseGridData/GridDataFooter.vue';

import { useGridData } from '@/components/base/composables/useGridData.js';
import { useGridSelection } from '@/components/base/composables/useGridSelection.js';
import { useToast } from '@/components/base/composables/useToast.js';

import salaryCompositionSystemService from '@/services/salaryCompositionSystemService';
import salaryCompositionService from '@/services/salaryCompositionService';

import { ENUM_NAMES, getEnumOptions } from '@/constants/enumDisplayConstants';
import { GLOBAL_CONSTANTS } from '@/constants/globalConstants';
import { t } from '@/utils/resourseReader';

import { highlight } from 'prismjs/components/prism-core';
import Prism from '@/utils/prismExcel.js';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const { showSuccess, showError } = useToast();

const {
  tableData,
  totalRecords,
  searchResults,
  currentPage,
  pageSize,
  fetchData,
  fetchSearchSuggestions,
  selectSearchItem,
  setDefaultableFilter
} = useGridData(salaryCompositionSystemService, {
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
    }
  ]
});

const {
  selectedRows,
  selectedCount,
  setSelectedRows,
  clearSelection
} = useGridSelection();

const gridRef = ref(null);
const compositionTypeOptions = ref([]);
const currentCompositionType = ref(GLOBAL_CONSTANTS.DEFAULT_STATUS_FILTER);

const tableColumns = ref([
  { field: 'compositionCode', title: 'Mã thành phần', minWidth: 820, fixed: true },
  { field: 'compositionName', title: 'Tên thành phần', minWidth: 260 },
  { field: 'compositionTypeDesc', title: 'Loại thành phần', width: 180 },
  { field: 'propertyDesc', title: 'Tính chất', width: 160 },
  { field: 'valueExpression', title: 'Giá trị', width: 200 },
]);

const highlighter = (code) => {
  if (!code) return '';
  return highlight(code, Prism.languages.excel, 'excel');
};

const handleSearch = fetchSearchSuggestions;
const handleSelectSearchItem = selectSearchItem;

const fetchCompositionTypeOptions = () => {
  compositionTypeOptions.value = getEnumOptions(
    ENUM_NAMES.COMPOSITION_TYPE,
    {
      value: GLOBAL_CONSTANTS.DEFAULT_STATUS_FILTER,
      label: 'Tất cả thành phần'
    }
  );
};

const handleClearSelection = () => {
  clearSelection();
  gridRef.value?.clearSelection();
};

const buildBatchEntities = () =>
  selectedRows.value.map((row) => ({
    id: GLOBAL_CONSTANTS.EMPTY_GUID,
    organizationId: null,
    systemCompositionId: row.id,
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
    creationSource: 'Hệ thống',
    status: true,
    state: 1
  }));

const handleConfirm = async () => {
  if (!selectedRows.value.length) return;

  try {
    await salaryCompositionService.saveData(buildBatchEntities());

    showSuccess(t('message.activities.createSuccess'));

    emit('saved');
    handleClose();
  } catch (error) {
    showError(error?.message || t('message.activities.createError'));
  }
};

const handleClose = () => {
  handleClearSelection();
  emit('update:modelValue', false);
};

watch(currentCompositionType, async (newVal) => {
  await setDefaultableFilter({
    property: 'composition_type',
    value: newVal,
    defaultValue: GLOBAL_CONSTANTS.DEFAULT_STATUS_FILTER,
    dataType: 'number'
  });
});

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      await fetchData();
    }
  }
);
onMounted(() => {
  fetchCompositionTypeOptions();
});

</script>

<style scoped lang="scss">
.picker-content {
  display: flex;
  flex-direction: column;
  height: 620px;
}

.excel-formula-editor {
  background: transparent;
  max-height: 100px;
}
</style>