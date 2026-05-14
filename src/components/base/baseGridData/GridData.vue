<template>
  <div class="table_scroll">
    <DxDataGrid
      id="gridContainer"
      :data-source="data"
      :show-borders="false"
      key-expr="id"
      :hover-state-enabled="true"
      class="custom-grid"
      :column-auto-width="true"
      :allow-column-resizing="true"
      :show-row-lines="true"
      :show-column-lines="false"
      @row-click="onRowClick"
    >
      <DxPaging :enabled="false"/>
      <DxSelection mode="multiple" show-check-boxes-mode="always" />
      <DxScrolling show-scrollbar="always" />
      
      <!-- Render dynamic columns -->
      <DxColumn
        v-for="col in columns"
        :key="col.field"
        :data-field="col.field"
        :caption="col.title"
        :width="col.width"
        :min-width="col.minWidth"
        :fixed="col.fixed"
        :fixed-position="col.fixedPosition"
        :cell-template="col.cellTemplate"
        :alignment="col.alignment || 'left'"
      />

      <!-- Fixed action column -->
      <DxColumn
        v-if="actionButtons && actionButtons.length > 0"
        :width="200"
        :fixed="true"
        fixed-position="right"
        css-class="action-column"
        cell-template="actionTemplate"
      />

      <!-- Custom action column template -->
      <template #actionTemplate="{ data }">
        <div class="misa-action-buttons">
          <BaseButton
            v-for="(btn, index) in actionButtons"
            :key="index"
            variant="icon-only"
            :icon-class="btn.icon"
            :title="btn.hint"
            @click.stop="btn.onClick(data)"
          />
        </div>
      </template>

      <!-- Custom slot rendering -->
      <template v-for="col in columnsWithTemplates" :key="col.field" #[col.cellTemplate]="{ data }">
        <slot :name="col.cellTemplate" :row="data.data" :value="data.value" />
      </template>

    </DxDataGrid>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxSelection,
  DxScrolling
} from 'devextreme-vue/data-grid';
import BaseButton from '@/components/base/baseButton/BaseButton.vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    default: () => [],
  },
  actionButtons: {
    type: Array,
    default: () => [],
  }
});

const emit = defineEmits(['rowClick']);

const columnsWithTemplates = computed(() => {
  return props.columns.filter(col => col.cellTemplate);
});

const onRowClick = (e) => {
  emit('rowClick', e.data);
};
</script>

<style lang="scss">
@import '@/assets/variables.scss';
.table_scroll {
  width: 100%;
  flex: 1;
  min-height: 0;
  border-top: 1px solid #e0e0e0;
}
.custom-grid{
  height: 100%;
}
.dx-datagrid-headers {
  border-bottom: 1px solid #e0e0e0 !important;
}
.dx-datagrid-headers .dx-header-row > td {
  background-color: #f4f5f8 !important;
  border-bottom: none !important;
}

.dx-datagrid-text-content {
    color: $text-primary-color !important; /* Màu chữ header #757575 theo MISA Design */
    font-weight: 700;
}
.dx-checkbox-icon{
 width: 20px !important;
  height: 20px !important;
  border: none !important;
  background: url('https://amisplatform.misacdn.net/apps/payroll/static/img/Icon.c487640.svg') -240px 0 no-repeat !important;
}
.dx-checkbox-checked .dx-checkbox-icon {
     background: url('https://amisplatform.misacdn.net/apps/payroll/static/img/Icon.c487640.svg') -260px 0 no-repeat !important;;
}
.dx-checkbox-checked .dx-checkbox-icon::before {
  display: none !important;
}

/* Xóa các đường kẻ dọc do cột ghim (fixed columns) tạo ra */
.dx-datagrid-table td.dx-datagrid-sticky-column-border-right {
  border-right: none !important;
}
.dx-datagrid-table td.dx-datagrid-sticky-column-border-left {
  border-left: none !important;
}

/* Custom Scrollbar Styles */
.dx-scrollable-scrollbar {
  border-radius: 8px !important;
}
.dx-scrollable-scrollbar .dx-scrollable-scroll {
  border-radius: 8px !important;
  background-color: #c0c0c0 !important;
}
.dx-scrollbar-hoverable:hover .dx-scrollable-scroll,
.dx-scrollable-scrollbar-active .dx-scrollable-scroll,
.dx-scrollable-scrollbar.dx-state-hover .dx-scrollable-scroll {
  background-color: #757575 !important;
}
/* Optional: Background for the scrollbar track so it looks prominent */
.dx-scrollbar-horizontal,
.dx-scrollbar-vertical {
  background-color: transparent !important;
}

/* Đổi màu background khi hover vào dòng */
.dx-datagrid-table .dx-data-row.dx-state-hover > td {
  background-color: #eafbf2 !important;
}

/* Ẩn hiện các nút action khi hover và căn phải */
.misa-action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Căn phải */
  padding-right: 10px; /* Cách mép phải 10px */
  gap: 10px; /* Khoảng cách giữa các icon là 10px */
  visibility: hidden;
}

.dx-data-row.dx-state-hover .misa-action-buttons {
  visibility: visible;
}
</style>