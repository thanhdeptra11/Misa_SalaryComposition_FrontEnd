<template>
  <div class="table_scroll">
    <table class="grid_table">
      <thead>
        <tr>
          <th class="checkbox_header">
            <div class="icon_checkbox"></div>
          </th>
          <th
            v-for="(col, index) in columns"
            :key="col.key"
            :style="{ minWidth: col.width, width: col.width, maxWidth: col.width }"
          >
            {{ col.title }}
          </th>
          <th class="action_header"></th>
        </tr>
      </thead>
      <tbody>
        <tr class="table_row" v-for="(row, rowIndex) in data" :key="row.id">
          <td class="checkbox_row">
            <div class="icon_checkbox"></div>
          </td>
          <td
            v-for="(col, colIndex) in columns"
            :key="col.key"
            :style="{ minWidth: col.width, width: col.width, maxWidth: col.width }"
          >
            <!-- Slot động cho phép custom hiển thị dữ liệu của một cột bất kỳ (VD: Cột avatar, trạng thái...) -->
            <slot :name="`cell-${col.field}`" :row="row" :value="row[col.field]">
              {{ row[col.field] }}
            </slot>
          </td>
          <td class="action_row">
            <slot name="actions" :row="row">
              <BaseButton variant="icon-only" class="icon icon_edit_table" @click="$emit('editRowTable', row)" />
              <BaseButton variant="icon-only" class="icon icon_delete_table" @click="$emit('deleteRowTable', row)" />
            </slot>
          </td>
        </tr>
        <!-- Nơi hiển thị khi không có dữ liệu -->
        <tr v-if="!data || data.length === 0">
          <td :colspan="columns.length" class="text-center no-data">--</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>

defineProps({
  columns: {
    type: Array,
    required: true,
    type: Array,
    required: true,
    // Cấu trúc dự kiến: [{ id: 1, field: 'fullName', title: 'Họ và tên', width: '200px' }, ...]
  },
  data: {
    type: Array,
    default: () => [],
  },
})
</script>

<style lang="scss" scoped>
.table_scroll {
  width: 100%;
  height: 100%;
  overflow: auto;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;

  background-color: #fff;
  &::-webkit-scrollbar {
    width: 12px; /* Tăng kích thước bao ngoài để chứa thanh cuộn khi to ra */
    height: 12px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #cdd3d6;
    border-radius: 8px;
    /* Dùng viền trùng màu với track để thu nhỏ thanh cuộn lúc bình thường */
    border: 3px solid #f1f1f1;
    background-clip: padding-box;
    /* Thêm transition để tạo hiệu ứng mượt mà (chỉ trình duyệt hỗ trợ mới nhận) */
    transition: all 0.3s ease-in-out;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #929ea5; /* Đậm màu hơn */
    /* Thu nhỏ viền lại để phần lõi (thumb) phình to ra */
    border-width: 1px;
  }
}
.grid_table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  position: relative;

  thead {
    position: sticky;
    top: 0;
    box-sizing: border-box;
    background-color: #f9fafb;
    z-index: 3;
  }
  th {
    height: 48px;
    padding: 8px;
    box-sizing: border-box;
    text-align: left;
    border-bottom: 1px solid #ddd;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover {
      border-left: 1px solid #ddd !important;
      border-right: 1px solid #ddd !important;
    }
  }
  td {
    padding: 8px;
    box-sizing: border-box;
    text-align: left;
    border-bottom: 1px solid rgb(221, 221, 221);
    overflow: hidden;
    text-overflow: ellipsis;
    height: 48px;
    box-sizing: border-box;
  }
}
.table_row:hover {
  background-color: #e1eeff;
  cursor: pointer;
}
.action_header,
.action_row {
  min-width: 80px;
  height: 48px;
  box-sizing: border-box;
  position: sticky;
  right: 0;
  background-color: #fff;
}
.checkbox_header,
.checkbox_row {
  min-width: 50px;
  height: 48px;
  box-sizing: border-box;
  position: sticky;
  left: 0;
  background-color: #fff;
}

/* Đảm bảo 2 ô ở Header có màu nền đúng với Header và z-index cao nhất (cao hơn dòng) */
.action_header,
.checkbox_header {
  background-color: #f9fafb;
  z-index: 4;
}

/* Khi hover nguyên 1 dòng, 2 ô sticky ở dòng đó cũng phải đổi màu theo */
.table_row:hover .action_row,
.table_row:hover .checkbox_row {
  background-color: #e1eeff;
}
.action_row {
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 15px;
  opacity: 1;
}
.action_row .icon{
  opacity: 0;
}
.table_row:hover .icon{
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}
</style>
