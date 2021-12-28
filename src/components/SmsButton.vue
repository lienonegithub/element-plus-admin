<template>
  <el-button
    :disabled='state.start'
    type='text'
    :class='state.start ? "captcha-time" : "captcha-button"'
    @click='sendSmsCode'
  >
    {{ (!state.start && '获取验证码') || state.time + '秒后重新获取' }}
  </el-button>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

export default defineComponent({
  name: 'SmsButton',
  emits: ['send'],
  setup(props, context) { 
    const time = ref(60)
    const start = ref(false)
    const state = reactive({
      time,
      start
    })

    const sendSmsCode = () => {
      const interval = window.setInterval(() => {
        if (state.time-- <= 0) {
          state.time = 60
          state.start = false
          window.clearInterval(interval)
        }
      }, 1000)
      context.emit(
        'send',
        () => {
          state.start = true
        },
        () => {
          clearInterval(interval)
          state.time = 60
          state.start = false
        }
      )
    }
    return {
      state,
      sendSmsCode
    }

  }
})
</script>

<style lang="scss" scoped>
.captcha {
  &-button {
    text-decoration: underline;
  }

  &-text {
    text-decoration: none;
  }
}
</style>
