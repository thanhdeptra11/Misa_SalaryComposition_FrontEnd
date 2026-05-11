<template>
<!-- Gọi Base layout lắng nghe sự kiện back -->
 <BaseFormLayout pageTitle="Thêm thành phần" @back="handleBack">
 <!-- Slot của actions -->
  <template #header-actions>
    <BaseButton
    variant="primary"
    buttonText="Hủy bỏ"
    />
     <BaseButton
    variant="primary"
    buttonText="Lưu và thêm"
    />
    <BaseButton
    variant="secondary"
    buttonText="Lưu"
    width="80px"
    />
  </template>
  <!-- Nội dung chính có thể cuộn -->
   <div class="salary_composition_inputs">
        <!-- Input nhập tên thành phần -->
        <BaseInput label="Tên thành phần" 
        labelWidth="150px" inputWidth="676px" required="true"
        />
        <!-- Input nhập Mã thành phần -->
        <BaseInput label="Mã thành phần" placeholder="Nhập mã viết liền"
        labelWidth="150px" inputWidth="676px" required="true"
        />
   </div>
 </BaseFormLayout>
</template>
<script setup>
import BaseButton from '@/components/base/baseButton/BaseButton.vue';
import BaseFormLayout from '@/components/base/BaseFormLayout.vue';
import BaseInput from '@/components/base/baseInput/BaseInput.vue';

const handleBack = () => {
    console.log('back');
    
}
</script>