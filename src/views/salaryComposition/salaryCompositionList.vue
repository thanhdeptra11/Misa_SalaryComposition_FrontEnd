<template>
  <div class="salary_composition_layout">
    <Header class="header" title="Thành phần lương">
      <template #right>
        <BaseButton variant="primary" iconClass="icon_scale" buttonText="Danh mục của hệ thống" />
        <BaseButton 
          variant="mixed" 
          iconClass="icon_add" 
          buttonText="Thêm mới" 
          @click="handleMainClick"
          @click-dropdown="handleDropdownClick" 
        />
      </template>
    </Header>

    <div class="table_container">
      <GridDataToolbar 
        class="tool_bar"
        @search="handleSearch"
        v-model:statusFilterValue="currentStatus"
        v-model:unitFilterValue="currentUnit"
      />
      <GridData :columns="tableColumns" :data="tableData">
        <template #actions="{ row }">
          <BaseButton variant="icon-only" class="icon icon_close" @click="handleAction(row, 'remove')" />
          <BaseButton variant="icon-only" class="icon icon_copy" @click="handleAction(row, 'copy')" />
          <BaseButton variant="icon-only" class="icon icon_edit_table" @click="handleAction(row, 'edit')" />
          <BaseButton variant="icon-only" class="icon icon_delete_table" @click="handleAction(row, 'delete')" />
        </template>

        <template #cell-tinhChat="{ value }">
          <span class="text-property">{{ value }}</span>
        </template>
        
        <template #cell-loaiThanhPhan="{ value }">
          <span>{{ value }}</span>
        </template>
      </GridData>
      <!-- Footer or Pagination could go here -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '@/components/mainViewComponents/Header.vue'
import GridDataToolbar from '@/components/base/baseGridData/GridDataToolbar.vue'
import GridData from '@/components/base/baseGridData/GridData.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'

// -- Toolbar states --
const currentStatus = ref('tracking');
const currentUnit = ref('all');
const handleSearch = (keyword) => {
  console.log("Tìm kiếm:", keyword);
};

// -- Table config --
const tableColumns = ref([
  { field: 'maThanhPhan', title: 'Mã thành phần', width: '250px' },
  { field: 'donViApDung', title: 'Đơn vị áp dụng', width: '250px' },
  { field: 'loaiThanhPhan', title: 'Loại thành phần', width: '200px' },
  { field: 'tinhChat', title: 'Tính chất', width: '150px' },
  { field: 'chiuThue', title: 'Chịu thuế', width: '150px' }
]);

const tableData = ref([
  { id: 1, maThanhPhan: 'TONG_SO_LUONG_NHAN_VIEN_CUA_DON_VI', donViApDung: 'Công ty Thí điểm AgentWork', loaiThanhPhan: 'Khác', tinhChat: 'Khác', chiuThue: '-' },
  { id: 2, maThanhPhan: 'TRUY_THU_BHYT_CONG_TY_DONG', donViApDung: 'Công ty Thí điểm AgentWork', loaiThanhPhan: 'Bảo hiểm - Công đoàn', tinhChat: 'Khác', chiuThue: '-' },
  { id: 3, maThanhPhan: '__HT_DS', donViApDung: 'Công ty Thí điểm AgentWork', loaiThanhPhan: 'Lương', tinhChat: 'Thu nhập', chiuThue: 'Chịu thuế' },
  { id: 4, maThanhPhan: '__HT_DT', donViApDung: 'Công ty Thí điểm AgentWork', loaiThanhPhan: 'Khác', tinhChat: 'Thu nhập', chiuThue: 'Chịu thuế' },
  { id: 5, maThanhPhan: '__HTDS_KHOAN', donViApDung: 'Công ty Thí điểm AgentWork', loaiThanhPhan: 'Doanh số', tinhChat: 'Thu nhập', chiuThue: 'Chịu thuế' },
  { id: 6, maThanhPhan: '__HTDS_NHOM_1', donViApDung: 'Công ty Thí điểm AgentWork', loaiThanhPhan: 'Khác', tinhChat: 'Thu nhập', chiuThue: 'Chịu thuế' },
  { id: 7, maThanhPhan: '__THU_NHAP_KHONG_GOM_PHUC_LOI', donViApDung: 'Công ty Thí điểm AgentWork', loaiThanhPhan: 'Khác', tinhChat: 'Thu nhập', chiuThue: 'Chịu thuế' },
  { id: 8, maThanhPhan: '__THU_NO', donViApDung: 'Công ty Thí điểm AgentWork', loaiThanhPhan: 'Khác', tinhChat: 'Thu nhập', chiuThue: 'Chịu thuế' }
]);

const handleAction = (row, action) => {
  console.log('Action', action, 'on row', row);
};

// Xử lý khi click vào phần chính của button (bên trái mũi tên)
const handleMainClick = () => {
  console.log('Main button clicked: Thêm mới');
};

// Xử lý khi click vào phần mũi tên (dropdown)
const handleDropdownClick = () => {
  console.log('Dropdown clicked: Mở menu hành động');
};
</script>

<style lang="scss" scoped>
.salary_composition_layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f4f5f8;
  padding: 16px 24px;
}
.header{
  padding-bottom: 16px;
}
.tool_bar{
  padding: 12px 20px;
}
.table_container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.text-property {
  color: #111;
}
</style>