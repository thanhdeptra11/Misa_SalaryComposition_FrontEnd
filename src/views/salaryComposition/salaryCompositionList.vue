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
        :statusOptions="statusOptions"
        :unitOptions="unitOptions"
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
import { ref, onMounted } from 'vue'
import Header from '@/components/mainViewComponents/Header.vue'
import GridDataToolbar from '@/components/base/baseGridData/GridDataToolbar.vue'
import GridData from '@/components/base/baseGridData/GridData.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'
import enumService from '@/services/enumService'
import organizationService from '@/services/organizationService'

// -- Toolbar states --
const currentStatus = ref('');
const currentUnit = ref([]);
const statusOptions = ref([]);
const unitOptions = ref([]);

const fetchStatusOptions = async () => {
  try {
    const data = await enumService.getEnumByName('FollowStatus');
    if (data && Array.isArray(data)) {
      statusOptions.value = data.map(item => ({
        label: item.description,
        value: item.value
      }));
      // Cập nhật giá trị hiện tại nếu giá trị đang có không nằm trong danh sách
      if (statusOptions.value.length > 0 && !statusOptions.value.some(o => o.value === currentStatus.value)) {
        currentStatus.value = statusOptions.value[0].value;
      }
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu FollowStatus:", error);
  }
};

const fetchUnitOptions = async () => {
  try {
    const data = await organizationService.getOrganizations();
    if (data && Array.isArray(data)) {
      unitOptions.value = data;
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu phòng ban:", error);
  }
};

onMounted(() => {
  fetchStatusOptions();
  fetchUnitOptions();
});

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

const tableData = ref([]);

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