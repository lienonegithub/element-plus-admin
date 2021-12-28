vueini

<template>
  <svg class='basis-svg-icon' aria-hidden='true'>
    <use :xlink:href='iconName' />
  </svg>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent ({
  name: 'Iconfont',
  props: {
    name: {
      type: String,
      default: 'icon-xxx'
    }
  },
  setup(props) {
    const iconName = computed(() => `#${props.name}`)
    
    return {
      iconName
    }
  }
})
</script>

<style lang="scss" scoped>
.basis-svg-icon {
  fill: currentColor;
  height: 1em;
  overflow: hidden;
  vertical-align: -0.15em;
  width: 1em;
}
</style>
