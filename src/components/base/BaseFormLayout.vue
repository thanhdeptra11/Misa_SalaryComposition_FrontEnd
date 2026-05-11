<template>
    <div class="base_form_layout">
        <!-- Header -->
         <div class="base_form_layout__header">
            <div class="header_left">
                <!-- Bg khi hover -->
                 <div class="bg_container">
                    <!-- Back về trang chính -->
                    <div class="icon_arrow_left btn_back"
                    @click="$emit('back')"></div>
                 </div>
                 <!-- Tên trang -->
                 <div class="page_title">{{ pageTitle }}</div>
            </div>
            <!-- Header right -->
             <div class="header_right">
                <!-- Action -->
                 <slot name="header-actions"></slot>
             </div>
         </div>
         <!-- Body scrollable -->
         <div class="base_form_layout__body">
            <div class="body_content">
                <!-- Nội dung của form -->
                 <slot></slot>
            </div>
         </div>
         <!-- Footer có thể có hoặc không -->
          <div class="base_form_layout__footer">
            <!-- Footer -->
            <slot name="footer"></slot>
          </div>
    </div>
</template>
<script setup>
defineProps({
    pageTitle: {
        type: String,
        default: ''
    }   
})
defineEmits(['back'])
</script>
<style lang="scss" scoped>
    .base_form_layout{
        padding: 16px 24px;
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: #f1f2f1;
        &__header{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 16px;
            .header_left{
                display: flex;
                align-items: center;
                .page_title {
                    font-size: 20px;
                    letter-spacing: .384px !important;
                    color: #212121;
                    font-weight: 700;
                    margin-right: 8px;
                }
                .bg_container {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-right: 8px;
                    &:hover {
                        border-radius: 50%;
                        background-color: #dadce3;
                    }
                }
                .btn_back {
                    cursor: pointer;
                    transition: opacity 0.2s;
                    &:hover {}
                }
            }
            .header_right{
                display: flex;
                align-items: center;
            }
        }
        &__body{
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            
            .body_content{
                background-color: #fff;
                min-height: 100%;
                border-radius: 4px;
                box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                padding: 40px;
            }
        }
        &_footer{
            flex-shrink: 0;
        }
    }
</style>