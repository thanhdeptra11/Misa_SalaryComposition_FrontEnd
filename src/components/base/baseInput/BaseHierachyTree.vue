<template>
  <div class="base-organization-tree">
    <DxDropDownBox
      v-model:value="treeBoxValue"
      v-model:opened="isTreeBoxOpened"
      :show-clear-button="false"
      :data-source="customDataSource"
      value-expr="id"
      :display-expr="displayExpr"
      :placeholder="placeholder"
      field-template="customField"
      content-template="content"
      :width="dropDownBoxWidth"
      :drop-down-options="{
        wrapperAttr: { class: 'tree-popup' },
      }"
      @value-changed="syncTreeViewSelection"
    >
      <template #customField="{ data }">
        <DxTextBox
          class="hidden-dx-textbox"
          :read-only="true"
          :hover-state-enabled="false"
          :focus-state-enabled="false"
        />
        <div v-if="displayTags.length === 0" class="misa-tree-placeholder">
          {{ placeholder }}
        </div>
        <DxTagBox
          v-else
          class="misa-tree-tagbox"
          :data-source="displayTags"
          :value="displayTagIds"
          display-expr="text"
          value-expr="id"
          :show-drop-down-button="false"
          :open-on-field-click="false"
          :search-enabled="false"
          :max-displayed-tags="2"
          :show-multi-tag-only="false"
          :multiline="false"
          tag-template="tagTemplate"
          @multi-tag-preparing="onMultiTagPreparing"
          @value-changed="onTagBoxValueChanged"
        >
          <template #tagTemplate="{ data }">
            <div class="misa-tree-tag-content" :title="data.text">
              <span class="misa-tree-tag-text">{{ data.text }}</span>
              <div class="dx-tag-remove-button"></div>
            </div>
          </template>
        </DxTagBox>
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
        >
        </DxTreeView>
      </template>
    </DxDropDownBox>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { DxDropDownBox } from 'devextreme-vue/drop-down-box'
import { DxTreeView } from 'devextreme-vue/tree-view'
import { DxTextBox } from 'devextreme-vue/text-box'
import { DxTagBox } from 'devextreme-vue/tag-box'
import { GLOBAL_CONSTANTS } from '@/constants/globalConstants'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  rootValue: {
    type: String,
    default: GLOBAL_CONSTANTS.EMPTY_GUID,
  },
  displayExpr: {
    type: String,
    default: '',
  },
  parentIdExpr: {
    type: String,
    default: 'parentId',
  },
  customDataSource: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  dropDownBoxWidth: {
    type: Number,
    default: '250px',
  },
})

const emit = defineEmits(['update:modelValue'])
const treeBoxValue = ref([...props.modelValue])
const isTreeBoxOpened = ref(false)
const treeViewRef = ref(null)
const isTreeExpanded = ref(false)

// Summary: Đồng bộ giá trị từ v-model bên ngoài (Cha truyền vào) xuống component con
watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(treeBoxValue.value)) {
      treeBoxValue.value = [...newVal]
    }
  },
)

// Summary: Phát sự kiện cập nhật v-model ra bên ngoài khi danh sách chọn thay đổi
watch(treeBoxValue, (newVal) => {
  emit('update:modelValue', newVal)
})

// Summary: Reset trạng thái expand khi data nguồn thay đổi
watch(
  () => props.customDataSource,
  () => {
    isTreeExpanded.value = false
  },
  { deep: true },
)

// Summary: Đồng bộ UI TreeView (tích checkbox) với danh sách ID đang chọn (treeBoxValue).
// Params: None
// Return: void
const syncTreeViewSelection = () => {
  const treeView = treeViewRef.value?.instance
  if (!treeView) return

  if (!treeBoxValue.value || treeBoxValue.value.length === 0) {
    treeView.unselectAll()
  } else {
    treeBoxValue.value.forEach((key) => treeView.selectItem(key))
  }
}

// Summary: Xử lý sự kiện khi TreeView load xong giao diện. Tự động mở rộng (expand) tất cả các node.
// Params: e (Object) - Event object từ DevExtreme
// Return: void
const treeViewContentReady = (e) => {
  if (!e.component) return
  if (!isTreeExpanded.value) {
    e.component.getNodes().forEach((node) => e.component.expandItem(node.key))
    isTreeExpanded.value = true
  }
  syncTreeViewSelection()
}

// Summary: Cập nhật lại mảng treeBoxValue khi người dùng tick/bỏ tick trực tiếp trên TreeView.
// Params: e (Object) - Event object từ DevExtreme
// Return: void
const treeViewItemSelectionChanged = (e) => {
  treeBoxValue.value = e.component.getSelectedNodes().map((node) => node.key)
}

/* ---------------------------------------------------
   LOGIC CHO TAGBOX (HIỂN THỊ ITEM ĐÃ CHỌN THÀNH TAG)
   --------------------------------------------------- */

// Summary: Tính toán danh sách các tag hiển thị lên ô input. Chỉ hiển thị node nếu node cha của nó KHÔNG ĐƯỢC CHỌN (gom nhóm tối ưu).
// Params: None
// Return: Array<Object> - Mảng gồm {id, text} của các tag hợp lệ
const displayTags = computed(() => {
  if (!treeBoxValue.value?.length) return []

  const selectedSet = new Set(treeBoxValue.value)
  return treeBoxValue.value.reduce((acc, id) => {
    const item = props.customDataSource.find((x) => x.id === id)
    if (item) {
      const parentId = item[props.parentIdExpr]
      // Nếu không có parent, hoặc parent là root, hoặc parent CHƯA được chọn -> Hiển thị nó làm đại diện
      if (!parentId || parentId === props.rootValue || !selectedSet.has(parentId)) {
        acc.push({ id: item.id, text: item[props.displayExpr] })
      }
    }
    return acc
  }, [])
})

// Summary: Lấy danh sách ID để binding vào ô TagBox
const displayTagIds = computed(() => displayTags.value.map((tag) => tag.id))

// Summary: Xử lý sự kiện khi người dùng bấm nút "X" để xóa tag trên TagBox. Nó sẽ tìm và unselect trên cây, hoặc tự động xóa khỏi mảng nếu cây chưa render.
// Params: e (Object) - Event từ DevExtreme TagBox
// Return: void
const onTagBoxValueChanged = (e) => {
  // Lọc ra danh sách id vừa bị người dùng xóa
  const removedIds = e.previousValue.filter((id) => !e.value.includes(id))
  const treeView = treeViewRef.value?.instance

  removedIds.forEach((id) => {
    if (treeView) {
      treeView.unselectItem(id) // Bỏ tích trên cây
    } else {
      treeBoxValue.value = treeBoxValue.value.filter((val) => val !== id) // Xóa trực tiếp khỏi mảng
    }
  })
}

// Summary: Định dạng text hiển thị khi số lượng tag vượt quá mức cho phép (VD: +3)
// Params: e (Object) - Event từ DevExtreme
// Return: void
const onMultiTagPreparing = (e) => {
  e.text = `+${e.selectedItems.length}`
}
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
.dx-treeview-expander-icon-stub {
  display: none;
}
.tree-popup .dx-overlay-content.dx-state-focused {
  border: transparent;
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

.custom-misa-treeview
  .dx-treeview-node.dx-state-selected
  > .dx-treeview-item
  .dx-treeview-item-content,
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
  background: url('https://amisplatform.misacdn.net/apps/payroll/static/img/Icon.c487640.svg') -240px
    0 no-repeat !important;
}

/* Trạng thái đã tick (icon_square_check_primary) */
.custom-misa-treeview .dx-checkbox-checked .dx-checkbox-icon,
.custom-misa-treeview .dx-checkbox-indeterminate .dx-checkbox-icon {
  background: url('https://amisplatform.misacdn.net/apps/payroll/static/img/Icon.c487640.svg') -260px
    0 no-repeat !important;
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
  content: '' !important;
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
.custom-misa-treeview
  .dx-treeview-toggle-item-visibility.dx-treeview-toggle-item-visibility-opened::before {
  -webkit-mask-position: -100px -40px !important; /* Dự đoán tọa độ của dấu trừ, bạn có thể chỉnh lại cho đúng */
  transform: none !important;
}
// Căn vị trí các phần tử trong container Tagbox
.dx-selectbox-container {
  position: relative;
  display: flex;
  align-items: center;
}
.dx-dropdowneditor-input-wrapper {
  display: flex;
  align-items: center;
}
// Styles cho tagBox
.dx-tag {
  padding: 5px 23px 5px 5px !important;
  margin: 0px !important;
}
.dx-texteditor {
  align-self: center;
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

/* Custom placeholder hiển thị khi không có tag nào được chọn */
.misa-tree-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 12px;
  color: #999;
  font-size: 14px;
  pointer-events: none; /* Xuyên click xuống DropDownBox */
}

/* Ghi đè triệt để icon mặc định của DevExtreme (vì DevExtreme dùng font chữ) */
:deep(.dx-dropdowneditor-icon::before) {
  content: none !important;
}

/* Áp dụng SVG Mask trực tiếp, dùng !important để tránh DevExtreme đè lại khi hover */
:deep(.dx-dropdowneditor-icon) {
  width: 20px !important;
  height: 20px !important;
  -webkit-mask-image: url(https://amisplatform.misacdn.net/apps/payroll/static/img/Icon.c487640.svg) !important;
  -webkit-mask-position: -100px 0 !important;
  background-color: #6e737a !important;
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

/* ---------------------------------------------------
   CUSTOM TAGBOX TEMPLATE (HIỂN THỊ ITEM ĐÃ CHỌN)
   --------------------------------------------------- */
/* Ẩn dấu nháy chuột và đổi con trỏ thành bàn tay để giống ô chọn */
:deep(.misa-tree-tagbox .dx-texteditor-input) {
  cursor: pointer;
  caret-color: transparent; /* Ẩn con trỏ nhấp nháy */
}

/* Bỏ viền của DxTagBox vì DxDropDownBox đã có viền */
:deep(.misa-tree-tagbox) {
  border: none !important;
  background-color: transparent !important;
}

/* Chỉnh style cho thẻ tag giống màu nền của MISA Design System */
:deep(.misa-tree-tagbox .dx-tag) {
  color: #111;
  background-color: #eaedf1; /* Màu nền xám nhạt như hình 2 */
  border-radius: 4px; /* Bo góc nhẹ hơn */
  margin: 2px 4px 2px 0; /* Cách đều các tag */
}

:deep(.misa-tree-tagbox .dx-tag-content) {
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 3px 26px 3px 8px; /* Tăng padding-right để chừa chỗ cho icon X (icon X dùng position absolute) */
  white-space: nowrap; /* Không cho chữ bị xuống dòng */
}

/* Container của nút xóa */
:deep(.misa-tree-tagbox .dx-tag-remove-button) {
  width: 20px !important;
  height: 20px !important;
  cursor: pointer;
  background: none !important;
  border: none !important;
  margin-left: 2px; /* Cách chữ một chút */
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.misa-tree-tagbox .dx-tag-remove-button::after) {
  content: none !important;
  display: none !important;
}

/* Sử dụng .icon_close_small cho pseudo-element thay vì icon mặc định */
:deep(.misa-tree-tagbox .dx-tag-remove-button::before) {
  content: '' !important; /* Ghi đè chữ "x" mặc định */
  position: absolute;
  left: -4px;
  top: 8px;
  display: block !important;
  width: 20px !important;
  height: 20px !important;
  -webkit-mask-image: url('https://amisplatform.misacdn.net/apps/payroll/static/img/Icon.c487640.svg') !important;
  -webkit-mask-position: -140px -80px !important;
  -webkit-mask-repeat: no-repeat !important;
  background-color: #6e737a !important; /* Màu của icon X */
  transform: none !important; /* Xóa các transform xoay mặc định của DevExtreme nếu có */
}
</style>
