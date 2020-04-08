<template>
  <div class="login">
    <!-- 登录卡片 -->
    <el-card class="login-box">
      <el-form ref="loginFormRef" :model="loginForm" :rules="rulesForm" class="login-box-form">
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
         <el-form-item>
          <el-button type="primary" style="width:100%" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单 
      loginForm: {
        // 用户名
        username: "admin",
        // 密码
        password: "123456"
      },
      // 登录验证
      rulesForm: {
        username:[
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password:[
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 登录方法
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if(!valid) return false
        const {data:res} = await this.$http.post('/login',this.loginForm)
        if(res.meta.status !== 200) {
          this.$message({message:res.meta.msg, type:'error', duration:1000})
          return false
        }
        this.$message({message:res.meta.msg, type:'success', duration:1000})
        // 登录成功 存取token到本地
        window.sessionStorage.setItem('token',res.data.token)
        // 登录成功跳转到首页
        this.$router.push('/')
      })
    }
    
  },
}
</script>

<style lang="scss" scoped>
.login {
  height: 100%;
  background: url(../../static/img/bg.jpg) no-repeat center/cover;
  &-box {
    width: 450px;
    height: 300px;
    border-radius: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    padding: 0 50px;
    box-sizing: border-box;
    position: relative;
    &-form {
      transform: translateY(30%);
    }
  }
}
</style>