<template>
  <el-form
    ref='authFormRef'
    v-bind='$attrs'
    :model='formData'
    :rules='rules'
    label-width='0'
    label-position='top'
    @validate='onValidateForm'
  >
    <el-form-item v-if='hasName' prop='name'>
      <el-input v-model.trim='formData.name' placeholder='姓名' clearable>
        <template #prefix>
          <Iconfont name='icon-user' class='svg-icon' />
        </template>
      </el-input>
    </el-form-item>
    <template v-if='authType === "password"'>
      <el-form-item prop='account'>
        <el-input
          v-model.trim='formData.account'
          placeholder='账户名/手机号/邮箱'
          clearable
        >
          <template #prefix>
            <Iconfont name='icon-user' class='svg-icon' />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop='password'>
        <el-input
          v-model.trim='formData.password'
          type='password'
          autocomplete='off'
          show-password
          placeholder='密码'
          clearable
          @keyup.enter='submitForm'
        >
          <template #prefix>
            <Iconfont name='icon-lock' class='svg-icon' />
          </template>
        </el-input>
      </el-form-item>
    </template>
    <template v-else-if='authType === &apos;code&apos;'>
      <el-form-item prop='mobile' placeholder='手机号码'>
        <el-input v-model.trim='formData.mobile' placeholder='手机号' clearable>
          <template #prefix>
            <Iconfont name='icon-user' class='svg-icon' />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop='smsCode'>
        <el-input
          v-model.trim='formData.smsCode'
          autocomplete='off'
          placeholder='验证码'
          clearable
          @keyup.enter='submitForm'
        >
          <template #prefix>
            <Iconfont name='icon-captcha' class='svg-icon' />
          </template>
          <template #suffix>
            <sms-button
              :style='{ height: "100%" }'
              @send='getSmsCode'
            />
          </template>
        </el-input>
      </el-form-item>
      <template v-if='hasPassword'>
        <el-form-item prop='password'>
          <el-input
            v-model='formData.password'
            type='password'
            autocomplete='off'
            placeholder='密码'
            clearable
          >
            <template #prefix>
              <Iconfont name='icon-lock' class='svg-icon' />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label='' prop='checkPass'>
          <el-input
            v-model='formData.checkPass'
            type='password'
            autocomplete='off'
            placeholder='确认密码'
            clearable
          >
            <template #prefix>
              <Iconfont name='icon-lock' class='svg-icon' />
            </template>
          </el-input>
        </el-form-item>
      </template>
    </template>
    <el-form-item>
      <div style='margin-top: 38px;' @click.prevent='submitForm'>
        <slot name='button' :loading='loading'>
          <el-button
            :loading='loading'
            :style='{ width: "100%" }'
            type='primary'
          >
            登录
          </el-button>
        </slot>
      </div>
    </el-form-item>
    <slot name='extra' />
  </el-form>
</template>

<script lang="ts">
import { defineComponent, ref, unref, reactive, computed } from 'vue'
import { cloneDeep, isEmpty } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { } from 'element-plus/lib/components/form/index'
import { isEmail, isMobilePhone } from '/@/utils/validate'
import SmsButton from '../SmsButton.vue'
import Iconfont from '../Iconfont.vue'

export default defineComponent({
  name: 'UserAuthForm',
  components: { SmsButton, Iconfont },
  props: {
    hasName: {
      type: Boolean,
      default: false
    },
    hasPassword: {
      type: Boolean,
      default: false
    },
    authType: {
      type: String,
      default: 'password',
      validator: (value: string) => ['code', 'password'].includes(value)
    }
  },
  emits: ['submit'],
  setup(props,context) {
    const validateMobile = (rule, value, callback) => {
      if (isEmpty(value)) {
        callback(new Error('手机号不能为空'))
      } else if (!isMobilePhone(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    const validateAccount = (rule, value, callback) => {
      if (isEmpty(value)) {
        callback(new Error('请输入手机号或邮箱'))
      } else if (!isEmail(value) && !isMobilePhone(value)) {
        callback(new Error('格式错误！'))
      } else {
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (isEmpty(value)) {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }

    const authFormRef = ref()
    const loading = ref(false)
    const formData = reactive({
      name: '',
      account: '',
      email: '',
      password: '',
      checkPass: '',
      mobile: '',
      smsCode: ''
    })
		
    const validatePass1 = (rule, value, callback) => {
      const form = unref(authFormRef)
      if (isEmpty(value)) {
        callback(new Error('请输入密码'))
      } else {
        if (formData.checkPass !== '') {
          form.validateField('checkPass')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (isEmpty(value)) {
        callback(new Error('请再次输入密码'))
      } else if (value !== formData.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    const staticRules = {
      name: [{ validator: validatePass, trigger: 'blur' }],
      account: [{ validator: validateAccount, trigger: 'blur' }],
      mobile: [{ validator: validateMobile, trigger: 'blur' }],
      smsCode: [{ required: true, trigger: 'blur', message: '验证码不能为空' }]
    }
		
    const rules = computed(() => {
      if (props.hasPassword) {
        return {
          ...staticRules,
          password: [{ validator: validatePass1, trigger: 'blur' }],
          checkPass: [{ validator: validatePass2, trigger: 'blur' }]
        }
      } else {
        return {
          ...staticRules,
          password: [{ validator: validatePass, trigger: 'blur' }]
        }
      }
    })


    // 获取验证码
    const getSmsCode = (start: () => void , finish: () => void) => {
      const form = unref(authFormRef)
      form.validateField('mobile', async(err: string) => {
        if (!err) {
          start()
          const data = { mobile: formData.mobile }
          console.log({ data })
          // await SMS.send(data)
          ElMessage.success('已发送')
          finish()
        } else {
          return false
        }
      })
    }

    const submitForm = () => {
      const form = unref(authFormRef)
      form.validate((valid: string) => {
        if (valid) {
          loading.value = true
          let data = cloneDeep(formData)
          if (props.authType === 'password') {
            switch (true) {
            case isEmail(data.account):
              data.email = data.account
              break
            case isMobilePhone(data.account):
              data.mobile = data.account
              break
            default:
              break
            }
						
          }
          Object.freeze(data)
          context.emit('submit', data, () => {
            loading.value = false
          })
        } else {
          return false
        }
      })
    }
    const resetForm = () => {
      const form = unref(authFormRef)
      form.resetFields()
    }
    const onValidateForm = (field: string, isValid: boolean, message: string) => {
      if (!isValid) {
        console.log({ message })
      }
    }
    return {
      authFormRef,
      loading,
      formData,
      rules,
      getSmsCode,
      submitForm,
      resetForm,
      onValidateForm
    }
  }

})

// watch: {
//   authType(newVal, oldVal) {
//     if (newVal === 'password') {
//       const { mobile = '' } = this.formData
//       this.formData = { account: mobile }
//     } else {
//       const { account = '' } = this.formData
//       if (isMobilePhone(account)) {
//         this.formData = { mobile: account }
//       } else {
//         this.formData = {}
//       }
//     }
//   }
// },
// methods: {
//   getSmsCode(start, finish) {
//     this.$refs.authForm.validateField('mobile', async(err) => {
//       if (!err) {
//         start()
//         const data = { mobile: this.formData.mobile }
//         // console.log({ $api: this.$api })
//         await SMS.send(data)
//         this.$message.success('已发送')
//       } else {
//         return false
//       }
//     })
//   },
//   submitForm(formName) {
//     this.$refs[formName].validate((valid) => {
//       if (valid) {
//         this.loading = true
//         const data = cloneDeep(this.formData)
//         if (this.authType === 'password') {
//           switch (true) {
//           case isEmail(data.account):
//             data.email = data.account
//             break
//           case isMobilePhone(data.account):
//             data.mobile = data.account
//             break
//           default:
//             break
//           }
//           delete data.account
//         }
//         Object.freeze(data)
//         this.$emit('submit', data, () => {
//           this.loading = false
//         })
//       } else {
//         return false
//       }
//     })
//   },
//   resetForm(formName = 'authForm') {
//     this.$refs[formName].resetFields()
//   },
//   onValidateForm(field, isValid, message) {
//     if (!isValid) {
//       // console.warn(message)
//     }
//   }
// }
</script>

<style lang="scss" scoped>
  .svg-icon {
    height: 32px;
    width: 32px;
  }
</style>
