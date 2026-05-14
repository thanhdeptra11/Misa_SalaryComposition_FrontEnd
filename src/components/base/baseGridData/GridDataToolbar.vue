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
    </div>
    <div class="toolbar-right">
      <slot name="right-actions">
        <!-- Default items if nothing is passed -->
        <BaseDropdown 
          v-if="showStatusFilter"
          v-model="internalStatus"
          :options="statusOptions"
          variant="borderless"
          placeholder="Tất cả trạng thái"
        >
        </BaseDropdown>
       
        
        <BaseHierachyTree 
          v-if="showUnitFilter"
          v-model="internalUnit"
          :custom-data-source="unitOptions"
          display-expr="organizationName"
          :placeholder="placeholder"
          :dropDownBoxWidth="'370px'"
        />
        
        <BaseButton v-if="showFilterBtn" variant="icon-only" class="icon icon_filter" />
        <BaseButton v-if="showSettingBtn" variant="icon-only" class="icon icon_setting_column" />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseHeaderSearch from '@/components/base/BaseHeaderSearch.vue'
import BaseDropdown from '@/components/base/baseInput/BaseDropdown.vue'
import BaseHierachyTree from '@/components/base/baseInput/BaseHierachyTree.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'

const props = defineProps({
  statusFilterValue: { type: [String, Number], default: '' },
  unitFilterValue: { type: [Array, String, Number], default: () => [] },
  
  // Controls what default elements to show
  showStatusFilter: { type: Boolean, default: true },
  showUnitFilter: { type: Boolean, default: true },
  showFilterBtn: { type: Boolean, default: true },
  showSettingBtn: { type: Boolean, default: true },
  labelKey: { type: String, default: '' },
  
  // Options for dropdowns
  statusOptions: { 
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
  searchResults: { 
    type: Array, 
    default: () => [] 
  }
})

const emit = defineEmits(['search','selectSearchItem', 'update:statusFilterValue', 'update:unitFilterValue'])
const internalStatus = ref(props.statusFilterValue || (props.statusOptions && props.statusOptions[0]?.value) || '')
const internalUnit = ref(Array.isArray(props.unitFilterValue) ? props.unitFilterValue : [])

watch(internalStatus, (val) => emit('update:statusFilterValue', val))
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
}
</style>
