<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 权限列表 -->
      <el-table :data="rightsData" style="width: 100%" border>
        <el-table-column prop="date" label="序号" width="80px" type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径" ></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">等级一</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">等级二</el-tag>
            <el-tag v-else-if="scope.row.level === '2'" type="warning">等级三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 用户权限数据
      rightsData:[]
    }
  },
  methods: {
    // 获取权限数据
    async getRightsList(){
      const {data:res} = await this.$http.get(`rights/list`)
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsData = res.data
    }
  },
  created() {
    this.getRightsList()
  },
}
</script>

<style lang="scss" scoped>
.el-breadcrumb {
  height: 40px;
  line-height: 40px;
  background-color: #fff;
  border-radius: 5px;
  padding-left: 10px;
  box-sizing: border-box;
}
</style>