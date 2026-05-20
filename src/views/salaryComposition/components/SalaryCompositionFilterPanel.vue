<template>
  <aside v-if="modelValue" class="salary_filter_panel">
    <div class="filter_header">
      <h3>Bộ lọc</h3>
      <div type="button" class="icon_close" @click="$emit('update:modelValue', false)"></div>
    </div>

    <div class="filter_search">
      <div class="icon_glass_search"></div>
      <input
        :value="keyword"
        type="text"
        placeholder="Tìm kiếm"
        @input="$emit('update:keyword', $event.target.value)"
      />
    </div>

    <div class="filter_list">
      <div
        v-for="field in filteredFields"
        :key="field.property"
        class="filter_item"
        :class="{ 'filter_item--active': activeProperty === field.property }"
      >
        <label class="filter_checkbox">
          <input
            type="checkbox"
            :checked="draftFilters[field.property]?.enabled"
            @change="$emit('toggle-field', field.property, $event.target.checked)"
          />
          <span
            class="filter_checkbox_icon"
            :class="
              draftFilters[field.property]?.enabled
                ? 'icon_square_check_primary'
                : 'icon_square_default'
            "
          ></span>
          <span @click.prevent="$emit('select-field', field.property)">
            {{ field.title }}
          </span>
        </label>

        <div
          v-if="activeProperty === field.property && draftFilters[field.property]?.enabled"
          class="filter_editor"
        >
          <BaseDropdown
            :model-value="draftFilters[field.property].operator"
            :options="operatorOptions"
            variant="default"
            placeholder="Chứa"
            @update:modelValue="$emit('update-filter', field.property, { operator: $event })"
          />

          <input
            class="filter_value_input"
            type="text"
            :value="draftFilters[field.property].value"
            @input="$emit('update-filter', field.property, { value: $event.target.value })"
          />
        </div>
      </div>
    </div>

    <div class="filter_footer">
      <BaseButton variant="primary" buttonText="Bỏ lọc" @click="$emit('reset')" />
      <BaseButton variant="secondary" buttonText="Áp dụng" @click="$emit('apply')" />
    </div>
  </aside>
</template>

<script setup>
import BaseButton from '@/components/base/baseButton/BaseButton.vue'
import BaseDropdown from '@/components/base/baseInput/BaseDropdown.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  filteredFields: { type: Array, default: () => [] },
  draftFilters: { type: Object, default: () => ({}) },
  keyword: { type: String, default: '' },
  activeProperty: { type: String, default: '' },
  operatorOptions: { type: Array, default: () => [] },
})

defineEmits([
  'update:modelValue',
  'update:keyword',
  'select-field',
  'toggle-field',
  'update-filter',
  'apply',
  'reset',
])
</script>
<style scoped lang="scss">
.salary_filter_panel {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
}

.filter_header {
  height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
}

.filter_close {
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #666666;
}

.filter_search {
  position: relative;
  margin: 0 24px 8px;

  .icon_glass_search {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
  }

  input {
    width: 100%;
    height: 32px;
    padding: 0 12px 0 36px;
    border: 1px solid #dddde4;
    border-radius: 4px;
    outline: none;
    box-sizing: border-box;
  }
}

.filter_list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
}

.filter_item {
  padding: 8px 12px;
  border-radius: 4px;
}

.filter_item--active {
  background: #eafbf2;
}

.filter_checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  input {
    display: none;
  }
}

.filter_checkbox_icon {
  flex-shrink: 0;
}

.filter_editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;

  :deep(.base_dropdown) {
    width: 100%;
  }
}

.filter_value_input {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dddde4;
  border-radius: 4px;
  outline: none;
}

.filter_footer {
  height: 56px;
  padding: 9px 20px;
  border-top: 1px solid #dddde4;
  background: #f1f2f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
