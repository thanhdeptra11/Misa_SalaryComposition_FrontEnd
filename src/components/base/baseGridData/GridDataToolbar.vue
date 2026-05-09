<template>
  <div class="grid_data_toolbar">
    <div class="toolbar-left">
      <BaseHeaderSearch 
        variant="table" 
        placeholder="Tìm kiếm" 
        @search="$emit('search', $event)" 
      />
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
        />
        
        <BaseDropdown 
          v-if="showUnitFilter"
          v-model="internalUnit"
          :options="unitOptions"
          variant="default"
          placeholder="Tất cả đơn vị"
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
import BaseButton from '@/components/base/baseButton/BaseButton.vue'

const props = defineProps({
  statusFilterValue: { type: [String, Number], default: '' },
  unitFilterValue: { type: [String, Number], default: '' },
  
  // Controls what default elements to show
  showStatusFilter: { type: Boolean, default: true },
  showUnitFilter: { type: Boolean, default: true },
  showFilterBtn: { type: Boolean, default: true },
  showSettingBtn: { type: Boolean, default: true },
  
  // Options for dropdowns
  statusOptions: { 
    type: Array, 
    default: () => [
      { label: 'Đang theo dõi', value: 'tracking' },
      { label: 'Ngừng theo dõi', value: 'untracking' }
    ] 
  },
  unitOptions: { 
    type: Array, 
    default: () => [
      { label: 'Tất cả đơn vị', value: 'all' },
      { label: 'Công ty Thí điểm AgentWork', value: 'agentwork' }
    ] 
  }
})

const emit = defineEmits(['search', 'update:statusFilterValue', 'update:unitFilterValue'])

const internalStatus = ref(props.statusFilterValue || (props.statusOptions[0]?.value))
const internalUnit = ref(props.unitFilterValue || (props.unitOptions[0]?.value))

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
