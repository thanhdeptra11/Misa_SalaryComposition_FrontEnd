<template>
  <component
    :is="rootTag"
    class="base_button"
    :class="`base_button--${variant}`"
    :title="title"
    :style="buttonStyle"
    @click="$emit('click', $event)"
  >
    <!--  -->
    <div v-if="iconClass" class="base_button__icon" :class="iconClass"></div>
    <div v-if="iconClass && variant === 'no-border'" class="base_button__icon--no-border" :class="iconClass"></div>
    <span v-if="variant !== 'icon-only'" class="base_button__text">{{ buttonText }}</span>
    
    <template v-if="variant === 'mixed' || variant === 'combo'">
      <div class="base_button__divider"></div>
      <div class="base_button__dropdown" @click.stop="$emit('click-dropdown', $event)">
        <div class="icon_down base_button__dropdown-icon"></div>
      </div>
    </template>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    required: true,
    validator: (v) => ['primary', 
    'secondary', 
    'icon', 
    'icon-only', 
    'mixed', 
    'combo', 
    "no-border",
    'outline-color',
    "text-color"].includes(v),
  },
  iconClass: {
    type: String,
    default: '',
  },
  buttonText: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: 'auto',
  },
  buttonColor: {
    type: String,
    default: '',
  }
})

defineEmits(['click', 'click-dropdown'])
const buttonStyle = computed(() => ({
  width: props.width,
  '--button-color': props.buttonColor || '#34b057'
}));
const rootTag = computed(() =>
  props.variant === 'icon' || props.variant === 'icon-only' ? 'div' : 'button',
)
</script>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;

// --- primary: nền trắng, viền xám, icon + text, hover chuyển xanh lá cây ---
.base_button--primary {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  border: 1px solid $border-gray;
  color: $main-text-color;

  background-color: #ffffff;
  font-weight: 500;
  font-size: 14px !important;
  min-width: 80px !important;
  width: auto;
  height: 36px !important;

  padding-left: 16px;
  padding-right: 16px;
  border-radius: 4px !important;
  cursor: pointer;

  .base_button__icon {
    transition: color 0.2s;
  }
  .base_button__text {
    transition: color 0.2s;
  }
  &:hover {
    color: $primary-green;
    border-color: $primary-green;
    .base_button__icon {
      background-color: $primary-green !important;
    }
  }
}

// --- secondary: nền xanh lá, text trắng, hover chuyển xanh lá cây ---
.base_button--secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px !important;
  flex-shrink: 0;

  background-color: $primary-green;
  color: #ffffff;
  border-color: transparent;

  width: auto;
  font-weight: 500;
  font-size: 14px;
  height: 36px;
  padding-left: 16px;
  padding-right: 16px;
  border-radius: 4px;
  cursor: pointer;

  .base_button__icon {
    background-color: #ffffff !important;
  }
  .base_button__text {
  }
  &:hover {
    transition: color 0.2s;
    background-color: $primary-hover-green !important;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1) !important;
  }
}

// --- icon:  ---
.base_button--icon {
  margin-left: 8px;
  background-color: #ffffff;
  height: 35px;
  padding: 8px;
  border: 1px solid #e0e6ec;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    border-color: $primary-green;
    background-color: $primary-background;
    .base_button__icon {
      background-color: $primary-green !important;
    }
  }
}
.base_button--no_border {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  border: none;
  outline: none;
  color: $main-text-color;

  background-color: #ffffff;
  font-weight: 500;
  font-size: 14px !important;

  width: 36px !important;
  height: 36px !important;

  padding: 6px 5px !important;
  border-radius: 4px !important;
  cursor: pointer;

  .base_button__icon {
    transition: color 0.2s;
  }
  .base_button__text {
    transition: color 0.2s;
  }
  &:hover {
    color: $primary-green;
    border-color: $primary-green;
    .base_button__icon {
      background-color: $icon-only-button-no-border-hover !important;
    }
  }
}


// --- icon-only: bare icon, no chrome (grid row actions).
// Kept unstyled to match the original OnlyIconButton behavior — the
// consumer passes the icon class (e.g. icon_edit_table) via the outer
// `class` attribute, which carries its own background/size.
.base_button--icon-only {
  cursor: pointer;
}
// --- mixed & combo: nền xanh lá, icon + text + divider + dropdown arrow ---
.base_button--mixed, .base_button--combo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 4px;

  background-color: $primary-green;
  color: #ffffff;
  border: none;
  
  height: 36px !important;
  border-radius: 4px !important;
  margin-left: 15px;
  padding: 0 8px 0 12px !important;
  cursor: pointer;

  font-weight: 500;
  font-size: 14px;

  .base_button__icon {
    background-color: #ffffff !important;
  }

  .base_button__divider {
    width: 1px;
    height: 20px;
    background-color: #ffffff;
    opacity: 0.8;
    margin-left: 4px;
  }

  .base_button__dropdown {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 4px;
  }

  .base_button__dropdown-icon {
    background-color: #ffffff !important;
  }

  &:hover {
    background-color: $primary-hover-green;
  }
  &:active {
    background-color: #198F3B;
  }
}

.base_button--outline-color {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;

  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--button-color);
  border-radius: 4px;
  background-color: #fff;
  color: var(--button-color);

  font-weight: 500;
  font-size: 14px;
  cursor: pointer;

  .base_button__icon {
    background-color: var(--button-color) !important;
  }

  &:hover {
    background-color: color-mix(in srgb, var(--button-color) 8%, #fff);
  }
}
.base_button--text-color {
  border: none;
  background: transparent;
  color: var(--button-color);
  padding: 0;
  min-width: auto !important;
  height: 36px !important;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
</style>
