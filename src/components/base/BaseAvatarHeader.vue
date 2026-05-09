<template>
  <div class="base_avatar_header">
    <div class="avatar" :class="[{ 'avatar--clickable': clickable }]">
      <img class="avatar_image" v-if="src" :src="src" :alt="alt" />
      <span v-else class="avatar--fallback">
        {{ initals }}
      </span>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
const props = defineProps({
  src: String,
  alt: String,
  name: String,
  clickable: {
    type: Boolean,
    default: false,
  },
})
const initals = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
})
</script>

<style lang="scss" scoped>
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #9ea7b4;
  font-weight: bold;
  &--clickable {
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  &--fallback {
    font-size: 14px;
  }
}
.avatar_image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
