<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="header-logo">
        <span>AUTO VUE</span>
      </div>
      <i class="iconfont icon-tuichu login-out" @click="loginOut"></i>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <!-- 侧边切换显示 -->
        <div class="toggle-button" @click="toggleSide">| | |</div>
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#333747"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse" 
          :collapse-transition="false"
        >
        <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 一级菜单图标 -->
              <i :class="iconObj[item.id]" style="margin-right:5px;"></i>
              <!-- 一级菜单文字 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="itemChild.id+''" v-for="itemChild in item.children" :key="itemChild.id">
               <template slot="title">
              <!-- 二级菜单图标 -->
              <i class="el-icon-menu"></i>
              <!-- 二级菜单文字 -->
              <span>{{itemChild.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 页面组件显示区域 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// import TopBar from '@/components/TopBar/TopBar.vue'
// import SideBar from '@/components/SideBar/SideBar.vue'
export default {
  data(){
    return {
      // 左侧菜单栏数据
      menuList:[],
      // 字体图标
      iconObj: {
        '125':"iconfont icon-yonghu",
        '103':"iconfont icon-quanxian",
        '101':"iconfont icon-xiazai",
        '102':"iconfont icon-dd",
        '145':"iconfont icon-shuju"
      },
      // 侧边栏切换
      isCollapse: false
    }
  },
  computed: {},
  // components: {
  //   'top-bar': TopBar,
  //   'side-bar': SideBar
  // }
  methods: {
    // 退出登录
    loginOut() {
      window.sessionStorage.removeItem("token");
      this.$router.push("/login");
      this.$message.success({ message: "退出登录成功", duration: 1000 });
    },
    // 获取左侧菜单数据
    async getMenuList(){
      const {data:res} = await this.$http.get('/menus')
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      console.log(res)
    },
    // 切换侧边栏
    toggleSide() {
      this.isCollapse = !this.isCollapse
    }
  },
  created() {
    this.getMenuList()
  },
}
</script>

<style lang="scss" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  line-height: 60px;
  padding-left: 25px;
  .header-logo {
    height: 100%;
    float: left;
    span {
      color: #fff;
      font-size: 26px;
      font-weight: 600;
    }
  }
  .login-out {
    float: right;
  }
  .login-out:hover {
    color: skyblue;
    cursor: pointer;
  }
  .iconfont {
    color: #fff;
    font-size: 26px;
  }
}
.el-aside {
  background-color: #333747;
  .el-menu {
    border-right: none;
  }
  .toggle-button {
    background-color: #4a5064;
    color: #fff;
    text-align: center;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eee;
  padding: 0;
}
</style>