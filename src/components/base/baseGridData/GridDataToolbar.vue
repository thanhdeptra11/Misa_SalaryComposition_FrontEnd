<template>
  <div class="grid_data_toolbar">
    <div class="toolbar-left">
      <BaseHeaderSearch 
        :results="props.searchResults"
        variant="table" 
        placeholder="Tìm kiếm" 
        :labelKey = "props.labelKey"
        @search="$emit('search', $event)" 
        @selectSearchItem = "$emit('selectSearchItem', $event)"
      >
        <template #search-item="{ item }">
          <slot name="search-item" :item="item" />
        </template>
      </BaseHeaderSearch>
      <!-- Bulk actions -->
      <div v-if="selectedCount > 0" class="selection-summary">
        <span>Đã chọn <b>{{ selectedCount }}</b></span>
        <button class="clear-selection" @click="$emit('clearSelection')">
          Bỏ chọn
        </button>
        <slot name="selection-actions" />
      </div>
    </div>
    <div class="toolbar-right" v-if="selectedCount === 0">
      <slot name="right-actions">
        <!-- Default items if nothing is passed -->
        <BaseDropdown 
          v-if="showStatusFilter"
          v-model="selectedItem"
          :options="dropdownOptions"
          variant="borderless"
          :dropdown-placeholder="placeholder"
        >
        </BaseDropdown>
       
        
        <BaseHierachyTree 
          v-if="showUnitFilter"
          v-model="internalUnit"
          :custom-data-source="unitOptions"
          display-expr="organizationName"
          :placeholder="placeholder"
          :dropDownBoxWidth= 370
        />
        
        <BaseButton id="btnFilter" v-if="showFilterBtn" variant="icon-only" class="icon icon_filter" />
        <BaseButton id="btnSettingColumn" v-if="showSettingBtn" variant="icon-only" class="icon icon_setting_column"
         @click="$emit('openColumnSetting')" />
      </slot>
    </div>
  </div>
      <BaseToolTip
            target="#btnFilter"
            content="Bộ lọc"
            />
        <BaseToolTip
        target="#btnSettingColumn"
        content="Thiết lập"
        />
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseHeaderSearch from '@/components/base/BaseHeaderSearch.vue'
import BaseDropdown from '@/components/base/baseInput/BaseDropdown.vue'
import BaseHierachyTree from '@/components/base/baseInput/BaseHierachyTree.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'
import BaseToolTip from '@/components/base/BaseToolTip.vue'

const props = defineProps({
  selectedItem: { type: [String, Number], default: '' },
  unitFilterValue: { type: [Array, String, Number], default: () => [] },
  
  // Controls what default elements to show
  showStatusFilter: { type: Boolean, default: true },
  showUnitFilter: { type: Boolean, default: true },
  showFilterBtn: { type: Boolean, default: true },
  showSettingBtn: { type: Boolean, default: true },
  labelKey: { type: String, default: '' },
  
  // Options for dropdowns
  dropdownOptions: { 
    type: Array, 
    default: () => [] 
  },
  unitOptions: { 
    type: Array, 
    default: () => [] 
  },
  placeholder: { 
    type: String, 
    default: '' 
  },
  dropdownPlaceholder: { 
    type: String, 
    default: '' 
  },
  searchResults: { 
    type: Array, 
    default: () => [] 
  },
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'search',
  'selectSearchItem', 
  'update:selectedItem', 
  'update:unitFilterValue',
  'clearSelection',
'openColumnSetting'])
const selectedItem = ref(props.selectedItem || (props.dropdownOptions && props.dropdownOptions[0]?.value) || '')
const internalUnit = ref(Array.isArray(props.unitFilterValue) ? props.unitFilterValue : [])

watch(selectedItem, (val) => emit('update:selectedItem', val))
watch(internalUnit, (val) => emit('update:unitFilterValue', val))

</script>

<style scoped lang="scss">
.grid_data_toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  .toolbar-left {
    display: flex;
    align-items: center;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .selection-summary{
    display: flex;
    gap: 8px;
    align-items: center;
    padding-left: 20px;
  }
  .clear-selection{
    background-color: transparent !important;
    border: none !important;
    color: #34b057 !important;
    font-size: 14px !important;
    font-weight: bold !important;
    cursor: pointer !important;
  }
}
</style>
