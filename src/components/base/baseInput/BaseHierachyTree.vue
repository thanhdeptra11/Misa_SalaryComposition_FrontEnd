<template>
  <div class="base-organization-tree">
    <DxDropDownBox
      v-model:value="treeBoxValue"
      v-model:opened="isTreeBoxOpened"
      :show-clear-button="false"
      :data-source="customDataSource"
      value-expr="id"
      :display-expr="displayExpr"
      placeholder="Tất cả đơn vị"
      field-template="customField"
      content-template="content"
      @value-changed="syncTreeViewSelection"
    >
    <!-- Custom tagItems -->
      <template #customField="{ data }">
        <div class="custom-tags-container">
          <!-- Bắt buộc phải có DxTextBox ẩn để DevExtreme không báo lỗi E1010 -->
          <DxTextBox
            class="hidden-dx-textbox"
            :read-only="true"
            :hover-state-enabled="false"
            :focus-state-enabled="false"
          />
          <!-- Chưa chọn hiện placeholder -->
          <div v-if="!treeBoxValue || treeBoxValue.length === 0" class="custom-placeholder">
            Tất cả đơn vị
          </div>
          <!-- Đã chọn hiện thẻ -->
          <div v-else class="custom-tags-wrapper">
             <div v-for="tag in displayTags" :key="tag.id" class="misa-tag">
                <span class="misa-tag-text">{{ tag.text }}</span>
                <!-- stop ngăn event lan lên cha -->
                <div class="misa-tag-remove" @click.stop="removeSelectedItem(tag.id)">
                  <i class="icon_close_small"></i>
                </div>
             </div>
          </div>
        </div>
      </template>

      <template #content="{ data }">
        <DxTreeView
          class="custom-misa-treeview"
          ref="treeViewRef"
          :data-source="customDataSource"
          :select-by-click="true"
          data-structure="plain"
          key-expr="id"
          :parent-id-expr="parentIdExpr"
          :root-value="rootValue"
          selection-mode="multiple"
          show-check-boxes-mode="normal"
          :select-nodes-recursive="true"
          :display-expr="displayExpr"
          :search-enabled="true"
          search-mode="contains"
          :search-editor-options="{ placeholder: 'Tìm kiếm' }"
          @content-ready="treeViewContentReady"
          @item-selection-changed="treeViewItemSelectionChanged"
        />
      </template>
    </DxDropDownBox>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { DxDropDownBox } from 'devextreme-vue/drop-down-box';
import { DxTreeView } from 'devextreme-vue/tree-view';
import { DxTextBox } from 'devextreme-vue/text-box';
import { GLOBAL_CONSTANTS } from '@/constants/globalConstants';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  rootValue: {
    type: String,
    default: GLOBAL_CONSTANTS.EMPTY_GUID
  },
  displayExpr: {
    type: String,
    default: ''
  },
  parentIdExpr: {
    type: String,
    default: 'parentId'
  },
  customDataSource: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const treeBoxValue = ref([...props.modelValue]);
const isTreeBoxOpened = ref(false);
const treeViewRef = ref(null);

watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(treeBoxValue.value)) {
    treeBoxValue.value = [...newVal];
  }
});

watch(treeBoxValue, (newVal) => {
  emit('update:modelValue', newVal);
});

const syncTreeViewSelection = () => {
  const treeView = treeViewRef.value?.instance;
  if (!treeView) return;

  if (!treeBoxValue.value || treeBoxValue.value.length === 0) {
    treeView.unselectAll();
  } else {
    treeBoxValue.value.forEach((key) => {
      treeView.selectItem(key);
    });
  }
};

const isTreeExpanded = ref(false);

watch(() => props.customDataSource, () => {
  isTreeExpanded.value = false;
}, { deep: true });

const treeViewContentReady = (e) => {
  if (!e.component) return;
  
  if (!isTreeExpanded.value) {
    const rootNodes = e.component.getNodes();
    rootNodes.forEach(node => {
      e.component.expandItem(node.key);
    });
    isTreeExpanded.value = true;
  }
  
  syncTreeViewSelection();
};

/* ---------------------------------------------------
   LOGIC CHO TAGBOX (HIỂN THỊ ITEM ĐÃ CHỌN THÀNH TAG)
   --------------------------------------------------- */
const displayTags = computed(() => {
  if (!treeBoxValue.value || treeBoxValue.value.length === 0) return [];
  
  const selectedSet = new Set(treeBoxValue.value);
  const result = [];
  
  for (const id of treeBoxValue.value) {
    const item = props.customDataSource.find(x => x.id === id);
    if (item) {
      // Chỉ hiển thị tag nếu là root hoặc cha của nó KHÔNG được chọn
      const parentId = item[props.parentIdExpr];
      if (!parentId || parentId === props.rootValue || !selectedSet.has(parentId)) {
        result.push({ id: item.id, text: item[props.displayExpr] });
      }
    }
  }
  return result;
});

const removeSelectedItem = (id) => {
  const treeView = treeViewRef.value?.instance;
  if (treeView) {
    treeView.unselectItem(id); // Sẽ tự động unselect luôn cả các con của nó
  } else {
    treeBoxValue.value = treeBoxValue.value.filter(val => val !== id);
  }
};

const treeViewItemSelectionChanged = (e) => {
  const treeView = e.component;
  const selectedNodes = treeView.getSelectedNodes();
  
  // Chỉ lấy ID của các nodes được check
  treeBoxValue.value = selectedNodes.map(node => node.key);
};
</script>
<!-- Bỏ scoped đoạn này vì Treeview bị đẩy ra khỏi phạm vi body -->
<style lang="scss">
@import 'devextreme/dist/css/dx.light.css';
@import '@/assets/variables.scss';

/* ---------------------------------------------------
   CUSTOM SEARCH BOX BÊN TRONG TREEVIEW (GIỐNG HÌNH 2)
   --------------------------------------------------- */
/* Bo góc và đổi viền xanh lá khi focus/hover cho ô tìm kiếm */
.custom-misa-treeview .dx-treeview-search {
  border-radius: 4px;
  height: 36px;
  border: 1px solid #dddde4;
}
.custom-misa-treeview .dx-treeview-search.dx-state-hover,
.custom-misa-treeview .dx-treeview-search.dx-state-focused,
.custom-misa-treeview .dx-treeview-search.dx-state-active {
  border-color: $primary-green !important;
}

/* Chỉnh chữ ô tìm kiếm */
.custom-misa-treeview .dx-treeview-search .dx-texteditor-input {
  padding-left: 32px !important; /* Dịch chữ sang phải để nhường chỗ cho icon */
  color: #111;
}

/* Ẩn icon mặc định của DevExtreme */
.custom-misa-treeview .dx-treeview-search .dx-icon-search::before {
  content: none !important;
}

/* Gắn icon_glass_search */
.custom-misa-treeview .dx-treeview-search .dx-icon-search {
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  -webkit-mask-repeat: no-repeat !important;
  background-color: #6e737a !important;
  -webkit-mask-image: url('https://amisplatform.misacdn.net/apps/payroll/static/img/Icon.c487640.svg') !important;
  -webkit-mask-position: 0 0 !important;
  display: block !important;
  position: absolute;
  left: 8px; /* Căn lề trái */
  top: 70%;
}

/* Style item của cây phân cấp */
.custom-misa-treeview .dx-treeview-item.dx-state-hover {
  background-color: $primary-background !important;
}
.custom-misa-treeview .dx-treeview-node.dx-state-selected > .dx-treeview-item,
.custom-misa-treeview .dx-treeview-item:has(.dx-checkbox-checked) {
  background-color: $primary-background !important;
}

.custom-misa-treeview .dx-treeview-node.dx-state-selected > .dx-treeview-item .dx-treeview-item-content,
.custom-misa-treeview .dx-treeview-item:has(.dx-checkbox-checked) .dx-treeview-item-content {
  color: $primary-green !important;
}

/* Tắt toàn bộ viền và checkmark mặc định của DevExtreme */
.custom-misa-treeview .dx-checkbox-icon::before,
.custom-misa-treeview .dx-checkbox-icon::after {
  content: none !important;
  background: none !important;
  border: none !important;
}

/* Khung checkbox mặc định (icon_square_default) */
.custom-misa-treeview .dx-checkbox-icon {
  width: 20px !important;
  height: 20px !important;
  border: none !important;
  background: url('https://amisplatform.misacdn.net/apps/payroll/static/img/Icon.c487640.svg') -240px 0 no-repeat !important;
}

/* Trạng thái đã tick (icon_square_check_primary) */
.custom-misa-treeview .dx-checkbox-checked .dx-checkbox-icon,
.custom-misa-treeview .dx-checkbox-indeterminate .dx-checkbox-icon {
  background: url('https://amisplatform.misacdn.net/apps/payroll/static/img/Icon.c487640.svg') -260px 0 no-repeat !important;
}
/* ---------------------------------------------------
   CUSTOM TOGGLE ICON (MỞ RỘNG / THU GỌN)
   --------------------------------------------------- */
/* Tắt mũi tên xoay mặc định của DevExtreme và vẽ lại bằng ::before */
.custom-misa-treeview .dx-treeview-toggle-item-visibility {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Icon mặc định khi thu gọn (dấu cộng - icon_toggle_plus) */
.custom-misa-treeview .dx-treeview-toggle-item-visibility::before {
  content: "" !important;
  display: block !important;
  width: 20px !important;
  height: 20px !important;
  -webkit-mask-image: url('https://amisplatform.misacdn.net/apps/payroll/static/img/Icon.c487640.svg') !important;
  -webkit-mask-position: -120px -40px !important; /* Đổi thành số ÂM vì tọa độ sprite luôn là số âm */
  -webkit-mask-repeat: no-repeat !important;
  background-color: #666 !important;
  transform: none !important; /* Xóa transform xoay mặc định của DX */
}

/* Icon khi đã mở rộng (dấu trừ - icon_toggle_minus) */
.custom-misa-treeview .dx-treeview-toggle-item-visibility.dx-treeview-toggle-item-visibility-opened::before {
  -webkit-mask-position: -100px -40px !important; /* Dự đoán tọa độ của dấu trừ, bạn có thể chỉnh lại cho đúng */
  transform: none !important;
}

</style>

<style lang="scss" scoped>
@import '@/assets/variables.scss';
.base-organization-tree {
  min-width: 250px;
}

/* Customizing the DevExtreme DropDownBox to match MISA Design System */
:deep(.dx-texteditor) {
  border: 1px solid #dddde4;
  border-radius: 4px;
  height: 36px;
  background-color: #fff;
  transition: border-color 0.2s;
}

/* Hover and Focus states */
:deep(.dx-texteditor.dx-state-hover) {
  border-color: $primary-green;
}

:deep(.dx-texteditor.dx-state-focused),
:deep(.dx-dropdowneditor-active) {
  border-color: $primary-green;
}

/* Text styling */
:deep(.dx-texteditor-input) {
  color: #111;
  font-size: 14px;
  padding-left: 12px;
}

/* ---------------------------------------------------
   CUSTOM TAGBOX TEMPLATE (HIỂN THỊ ITEM ĐÃ CHỌN)
   --------------------------------------------------- */
/* Ẩn textbox giả mạo dùng để lừa DevExtreme khỏi lỗi E1010 */
.hidden-dx-textbox {
  position: absolute !important;
  opacity: 0 !important;
  z-index: -1 !important;
  width: 0 !important;
  height: 0 !important;
  pointer-events: none !important;
}

.custom-tags-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.custom-tags-wrapper {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  align-items: center;
  width: 100%;
  padding-left: 8px;
  scrollbar-width: none;
}
.custom-tags-wrapper::-webkit-scrollbar {
  display: none;
}

.misa-tag {
  display: flex;
  align-items: center;
  background-color: #f0f2f4; /* Nền xám nhạt giống hình */
  border-radius: 4px;
  padding: 0 4px 0 8px;
  white-space: nowrap;
  height: 24px;
}

.misa-tag-text {
  font-size: 13px;
  color: #111;
  margin-right: 4px;
}

.misa-tag-remove {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.misa-tag-remove:hover {
  background-color: #e0e0e0;
}

.custom-placeholder {
  color: #9ca6b5;
  padding-left: 12px;
}

/* Ghi đè triệt để icon mặc định của DevExtreme (vì DevExtreme dùng font chữ) */
:deep(.dx-dropdowneditor-icon::before) {
  content: none !important; 
}

/* Áp dụng SVG Mask trực tiếp, dùng !important để tránh DevExtreme đè lại khi hover */
:deep(.dx-dropdowneditor-icon) {
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  -webkit-mask-repeat: no-repeat !important;
  background-color: #7a8188 !important; /* Dùng màu xám chuẩn, cấm hover đổi màu */
  -webkit-mask-image: url('@/assets/ICON.svg') !important;
  -webkit-mask-position: -32px -48px !important;
  transition: transform 0.2s ease !important;
  display: block !important;
  margin: auto !important; /* Tự động căn giữa trong nút */
  opacity: 1 !important; /* Cấm DevExtreme làm mờ khi hover */
  border-radius: 0 !important;
}

/* Khóa luôn việc DevExtreme tự động đổi màu background của icon khi hover */
:deep(.dx-dropdowneditor-button.dx-state-hover .dx-dropdowneditor-icon),
:deep(.dx-dropdowneditor-button.dx-state-active .dx-dropdowneditor-icon) {
  background-color: #7a8188 !important;
  opacity: 1 !important;
  transform: none; /* Khóa việc thu nhỏ nếu có */
}

/* Tắt màu nền xám nhạt của toàn bộ nút (button) khi hover/active */
:deep(.dx-dropdowneditor-button),
:deep(.dx-dropdowneditor-button.dx-state-hover),
:deep(.dx-dropdowneditor-button.dx-state-active) {
  background-color: transparent !important;
}


</style>
