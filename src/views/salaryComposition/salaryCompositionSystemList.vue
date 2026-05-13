<template>
  <BaseFormLayout @back="handleBack" pageTitle="Danh mục thành phần lương của hệ thống">

  </BaseFormLayout>
</template>
<script>
import router from "@/router";
// Quay lại trang thành phần lương
const handleBack = () => {
  router.push({
    name: 'Salarycompositions'
  })
}
</script>
<style></style>