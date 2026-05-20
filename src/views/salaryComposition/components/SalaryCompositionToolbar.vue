<!-- Toolbar cho bảng dữ liệu thành phần lương.
 GridDataToolbar được truyền vào các props :searchResults (danh sách kết quả tìm kiếm).
 :selectedCount (số lượng mục đã chọn).
 Các sự kiện @: Khi người dùng gõ tìm kiếm (search) chọn kết quả tìm kiếm
 (slectedSearchItem), nhấn nút mở cấu hình cột (openColumnSetting), emit sự kiện lên cha để xử lý.
 Các Filter:
 Filter: theo trạng thái cha truyền trạng thái xuống (status), danh sách trạng thái (statusOptions),
  con truyền sự kiện update:selectedItem để cập nhật trạng thái khi người dùng chọn.
  Filter: theo đơn vị cha truyền danh sách đơn vị (unitOptions), con truyền sự kiện
  update:unitFilterValue để cập nhật đơn vị khi người dùng chọn.
  v-model:status="trangThaiHienTai" == :status="trangThaiHienTai" 
  @update:status="trangThaiHienTai = $event" 
  Vì vậy ở component cha muốn dùng v-model thì component con 
  phải emit sự kiện update:status với giá trị mới để cập nhật trạng thái nếu không vue sẽ báo lỗi
  bởi vì v-model của cha không tìm thấy cổng để gắn v-model vào.
 -->
<template>
  <GridDataToolbar
    :searchResults="searchResults"
    class="tool_bar"
    :selectedCount="selectedCount"
    @clearSelection="$emit('clear-selection')"
    @search="$emit('search', $event)"
    @selectSearchItem="$emit('select-search-item', $event)"
    @openColumnSetting="$emit('open-column-setting')"
    :selectedItem="status"
    @update:selectedItem="$emit('update:status', $event)"
    :unitFilterValue="units"
    @update:unitFilterValue="$emit('update:units', $event)"
    :dropdownOptions="statusOptions"
    :unitOptions="unitOptions"
    dropdownPlaceholder="Tất cả trạng thái"
    placeholder="Tất cả đơn vị"
    labelKey="compositionName"
  >
    <template #search-item="{ item }">
      <span>{{ item.compositionCode + ' - ' + item.compositionName }}</span>
    </template>
    <template #selection-actions>
      <div class="bulk_actions">
        <BaseButton
          variant="outline-color"
          iconClass="icon_minus_yellow"
          buttonText="Ngừng theo dõi"
          buttonColor="#f90"
          @click="$emit('bulk-status-click', 0)"
        />
        <BaseButton
          variant="outline-color"
          iconClass="icon_check_green"
          buttonText="Đang theo dõi"
          buttonColor="#34b057"
          @click="$emit('bulk-status-click', 1)"
        />
        <BaseButton
          variant="outline-color"
          iconClass="icon_trash_red"
          buttonText="Xóa"
          buttonColor="#ff6161"
          @click="$emit('bulk-delete-click')"
        />
      </div>
    </template>
  </GridDataToolbar>
</template>

<script setup>
import GridDataToolbar from '@/components/base/baseGridData/GridDataToolbar.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'
// Cổng vào
defineProps({
  searchResults: { type: Array, default: () => [] }, //Cha truyền mảng kết quả tìm kiếm xuống
  selectedCount: { type: Number, default: 0 }, //Cha truyền số lượng row đã chọn xuống
  status: { type: [Number, String], default: null }, // Trạng thái đang được chọn filter
  units: { type: Array, default: () => [] }, // Các phòng ban đang được chọn filter
  statusOptions: { type: Array, default: () => [] }, // Các tùy chọn trạng thái để hiển thị trong dropdown filter
  unitOptions: { type: Array, default: () => [] }, // Các tùy chọn phòng ban để hiển thị trong dropdown filter
})
// Cổng ra
defineEmits([
  'clear-selection', //Báo cáo cho cha khi người dùng nhấn nút bỏ chọn tất cả
  'search', //Báo cho cha khi người dùng gõ tìm kiếm
  'select-search-item', //Báo cho cha khi người dùng chọn một mục từ kết quả tìm kiếm
  'open-column-setting', //Báo cho cha khi người dùng nhấn nút mở cấu hình cột
  'update:status', //Báo cho cha khi người dùng chọn một trạng thái để lọc
  'update:units', //Báo cho cha khi người dùng chọn một hoặc nhiều phòng ban để lọc
  'bulk-status-click', //Báo cho cha khi người dùng nhấn nút cập nhật trạng thái hàng loạt
  'bulk-delete-click', //Báo cho cha khi người dùng nhấn nút xóa hàng loạt
])
</script>

<style scoped>
.bulk_actions {
  display: flex;
  gap: 8px;
}
</style>
