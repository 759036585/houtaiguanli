<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addShowDialogVisible">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="categoryList" style="width: 100%" :tree-props="{children: 'children'}" border row-key="cat_id">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column prop="cat_deleted" label="是否有效">
          <template slot-scope="scope">
            <div class=""></div>
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
            <i class="el-icon-error" v-else style="color:lightgreen"></i>
          </template>
        </el-table-column>
        <el-table-column label="排序" >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.cat_level===0" type="success">一级</el-tag>
            <el-tag v-else-if="scope.row.cat_level===1">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
             <el-button icon="el-icon-edit" type='primary' size='mini' @click="editCateShowDialogVisible(scope.row)">编辑</el-button>
             <el-button type="danger" size='mini' icon="el-icon-delete" @click="delCate(scope.row)" >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码 -->
        <el-pagination
        @current-change="handleCurrentChange"
        :current-page.sync="categoryObj.pagenum"
        :page-size="categoryObj.pagesize"
          layout="total,prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 编辑分类 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editDialogVisible"
      width="40%">
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="form.categoryName" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加分类 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      @close="addDialogVisibleClose"
      width="40%">
      <el-form ref="addCateRef" :model="addCateForm" label-width="80px">
        <el-form-item label="活动名称">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader style="width:100%;"
            ref="addCascaderRef"
            v-model="cascaderProps.value"
            :options="optionsCascader"
            :props="cascaderProps"
            clearable
            @change="handleChange">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据
      categoryList: [],
      // 商品列表数据对象
      categoryObj: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 添加分类弹框
      addDialogVisible: false,
      // 编辑分类
      editDialogVisible: false,
      // 编辑分类名称
      form: {
       categoryName:'',
      },
      // 添加分类对象
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      optionsCascader:[],
      cascaderProps: {
        // emitPath: true,
        expandTrigger: 'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      editId: null
    }
  },
  methods: {
    // 获取商品列表数据
    async getCategoryList() {
      const { data: res } = await this.$http.get("/categories", {
        params: this.categoryObj
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.categoryList = res.data.result;
      this.total = res.data.total
    },
    // 更改页码
    handleCurrentChange(newPage){
      this.pagenum = newPage
      this.getCategoryList()
    },
    // 添加分类弹框
    addShowDialogVisible() {
      this.getAddCateList()
      this.addDialogVisible = true
    },
    // 获取级联选择数据
    async getAddCateList() {
      const {data:res} = await this.$http.get('/categories',{params: {type:2}})
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.optionsCascader = res.data
    },
    handleChange() {
      if(this.cascaderProps.value.length > 0){
        this.addCateForm.cat_pid = this.cascaderProps.value[this.cascaderProps.value.length-1]
        this.addCateForm.cat_level = this.cascaderProps.value.length
        console.log(this.cascaderProps.value)
      }else{
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 关闭添加分类清空
    addDialogVisibleClose() {
      this.$refs.addCateRef.resetFields()
      // this.cascaderProps.value = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level =0
    },
    // 添加分类
    async addCate() {
      const {data:res} = await this.$http.post('/categories',this.addCateForm)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
      this.getCategoryList()
      this.$message.success(res.meta.msg)
      this.addDialogVisible = false
    },
    // 删除分类 
    async delCate(scope) {
      const result =  await this.$confirm('此操作将永久删除该分类, 是否继续?', '删除分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error=> {return error})
      if(result !== 'confirm') return this.$message('已取消该操作')
      const {data:res} = await this.$http.delete('/categories/'+scope.cat_id)
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getCategoryList()
      this.$message.success(res.meta.msg)
    },
    // 编辑分类弹出层
    async editCateShowDialogVisible(scope) {
      this.editId = scope.cat_id
      const {data:res} = await this.$http.get('/categories/'+scope.cat_id)
      this.form.categoryName = res.data.cat_name
      this.editDialogVisible = true
    },
    // 编辑分类提交
    async editCate() {
      const {data:res} = await this.$http.put('/categories/'+this.editId,{cat_name:this.form.categoryName})
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getCategoryList()
      this.$message.success(res.meta.msg)
      this.editDialogVisible = false
    }
  },
  created() {
    this.getCategoryList();
  }
}
</script>

<style lang='scss' scoped>
.el-breadcrumb {
  height: 40px;
  line-height: 40px;
  background-color: #fff;
  border-radius: 5px;
  padding-left: 10px;
  box-sizing: border-box;
}
</style>