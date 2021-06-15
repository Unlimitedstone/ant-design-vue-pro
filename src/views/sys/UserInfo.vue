<!--suppress ALL -->
<template>
  <div class="app-container" style="width: 600px;">
    <el-form ref="form" :rules="rules" :model="form" label-width="120px">
      <el-form-item v-if="false" label="用户ID" prop="id">
        <el-input v-model="form.id" style="width: 200px;" readonly/>
      </el-form-item>
      <el-form-item label="登录名" prop="loginame">
        <el-input v-model="form.loginame" style="width: 200px; " readonly/>
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" style="width: 200px;" readonly/>
      </el-form-item>
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model="form.oldPassword" type="password" style="width: 200px;"/>
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input v-model="form.password" placeholder="输入新密码" type="password" style="width: 200px;"/>
      </el-form-item>
      <el-form-item label="密码确认" prop="confirmation">
        <el-input v-model="form.confirmation" placeholder="再次确认密码" type="password" style="width: 200px;"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">修改</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {getInfo, updateUser} from '@/api/user'
  import {getToken} from '@/utils/auth'
  import md5 from 'js-md5'

  export default {
    data() {
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.form.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        form: {
          id: '',
          loginame: '',
          username: '',
          oldPassword: '',
          password: '',
          confirmation: ''
        },
        rules: {
          oldPassword: [{required: true, message: '旧密码不能为空', trigger: 'change'}],
          password: [{required: true, message: '新密码不能为空', trigger: 'change'},
            {min: 6, max: 14, message: '长度必须为6~14', trigger: 'change'},
            {type: 'string', pattern: '^.*(?=.*\\d)(?=.*[a-zA-Z]{1,}).*$', message: '必须含有字母和数字', trigger: 'change'}],
          confirmation: [{required: true, message: '确认密码不能为空', trigger: 'change'},
            { required: true, validator: validatePass, trigger: 'blur' }]
        }
      }
    },
    created() {
      this.fetchUserInfo()
    },
    methods: {
      fetchUserInfo() {
        getInfo(getToken()).then(res => {
          this.form.loginame = res.data.loginame
          this.form.id = res.data.id
          this.form.username = res.data.username
        })
      },
      onSubmit() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.form.oldPassword = md5.hex(this.form.oldPassword)
            this.form.password = md5.hex(this.form.password)
            this.form.confirmation = md5.hex(this.form.confirmation)
            updateUser(this.form).then(res => {

              if (res.code === 20000) {
                this.form.oldPassword = ''
                this.form.password = ''
                this.form.confirmation = ''
                this.$nextTick(() => {
                  this.$refs['form'].clearValidate()
                })
                this.$message({
                  message: '修改用户信息成功',
                  type: 'success'
                })
              } else {
                this.$message({
                  message: '修改用户信息失败',
                  type: 'error'
                })
              }
              })
          }
        })
      },
    onCancel() {
      history.go(-1)
    },
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

