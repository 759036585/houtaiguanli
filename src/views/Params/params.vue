<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert show-icon title="注意: 只允许为第三级分类设置相关参数！" :closable="false" type="warning"></el-alert>
      <el-row style="margin: 15px 0">
        <el-col>
          <span style="margin-right:20px;">选择商品分类:</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="cateProps.value"
            :options="cateList"
            :props="cateProps"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签切换区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-row>
            <el-col>
              <el-button type="primary" size="small" :disabled="isBtnSelected" @click="addDialogVisible=true">添加参数</el-button>
            </el-col>
          </el-row>
          <!-- 动态参数表格 -->
          <el-table :data="manyTabData" border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable @close="handleClose(i,scope.row)" v-for="(item,i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="180px"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作" width="300px">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" @click="editShowDialog(scope.row.attr_id)" >编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="delParams(scope.row.attr_id)" >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-row>
            <el-col>
              <el-button type="primary" size="small" :disabled="isBtnSelected" @click="addDialogVisible=true">添加属性</el-button>
            </el-col>
          </el-row>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTabData" border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable @close="handleClose(i,scope.row)" v-for="(item,i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                 <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="180px"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作" width="300px">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" @click="editShowDialog(scope.row.attr_id)" >编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="delParams(scope.row.attr_id)" >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数弹框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      @close="addParamsClose"
      width="40%">
      <el-form ref="addFormRef" :model="addForm" label-width="80px">
        <el-form-item :label="titleText">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数弹框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      @close="editParamsClose"
      width="40%">
      <el-form ref="editFormRef" :model="editForm" label-width="80px">
        <el-form-item :label="titleText">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据
      cateList: [],
      // 配置级联选择
      cateProps: {
        expandTrigger: 'hover',
        label:'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // tab标签默认选择
      activeName:'many',
      // 动态参数数据
      manyTabData:[],
      // 静态属性数据
      onlyTabData:[],
      addDialogVisible: false,
      editDialogVisible: false,
      // 添加参数对象
      addForm:{
        attr_name:''
      },
      // 修改参数对象
      editForm: {
        attr_name:''
      },
      attrId:null
    }
  },
  computed: {
    // 按钮状态
    isBtnSelected() {
      if(this.cateProps.value.length !== 3){
        return true
      }else{
        return false
      }
    },
    cateId(){
      if(this.cateProps.value.length === 3) {
        return this.cateProps.value[2]
      }else{
        return null
      }
    },
    titleText() {
      if(this.activeName === 'many') {
        return '动态参数'
      }else{
        return '静态属性'
      }
    }
  },
  methods: {
    // 获取所有商品分类列表
    async getCateList() {
      const {data:res} = await this.$http.get('/categories')
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    // 级联选择触发
    handleChange() {
      this.getParasData()
    },
    // tab标签点击事件处理函数
    handleTabClick(){
      this.getParasData()

    },
    // 监听关闭弹出层
    addParamsClose(){
      this.$refs.addFormRef.resetFields()
    },
    editParamsClose(){
      this.$refs.editFormRef.resetFields()
    },
    async addParams(){
      const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
        attr_name: this.addForm.attr_name,
        attr_sel: this.activeName
        })
      if(res.meta.status !== 201) return this.$message.error(res.meta.msg)  
      this.getParasData()
      this.addDialogVisible=false
      this.$message.success(res.meta.msg)
    },
    // 获取参数数据
    async getParasData() {
      if(this.cateProps.value.length !== 3) {
        this.cateProps.value=[]
        this.manyTabData = []
        this.onlyTabData = []
        this.$message.error('请选择选择三级分类')
        return false
      }
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      res.data.forEach(item => {
        item.inputVisible = false
        item.inputValue = ''
        if(item.attr_vals.length === 0){
          item.attr_vals = []
        }else{
          item.attr_vals = item.attr_vals.split(' ')
        }
      })
      if(this.activeName === 'many'){
        this.manyTabData = res.data
      }else{
        this.onlyTabData = res.data
      }
    },
    // 修改参数弹框
    async editShowDialog(id) {
      this.attrId = id
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`,{
        params:{attr_sel:this.activeName}
      })
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm.attr_name = res.data.attr_name
      this.editDialogVisible = true
    },
    // 修改参数
    async editParams(){
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.attrId}`,{
        attr_name: this.editForm.attr_name,
        attr_sel:this.activeName
      })
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getParasData()
      this.editDialogVisible = false
      this.$message.success(res.meta.msg)
    },
    // 删除参数
    async delParams(attrId){
      const result = await this.$confirm('此操作将永久删除该参数, 是否继续?', this.titleText, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch((error) => {return error});
      if(result !== 'confirm') return this.$message('已取消该操作')
      const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      this.getParasData()
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
    },
    showInput(row) {
      console.log(row)
      row.inputVisible = true
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 添加参数 
    handleInputConfirm(row) {
      let inputValue = row.inputValue.trim();
        if (inputValue) {
          row.attr_vals.push(inputValue)
        }
      row.inputVisible = false
      row.inputValue = ''
      this.saveAttrVals(row)
    },
    handleClose(i,row) {
      console.log(111)
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    },
    async saveAttrVals(row){
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
    }
  },
  created() {
    this.getCateList()
  },
}
</script>

<style>
.el-breadcrumb {
  height: 40px;
  line-height: 40px;
  background-color: #fff;
  border-radius: 5px;
  padding-left: 10px;
  box-sizing: border-box;
}
.el-tag {
  margin-right: 5px;
}
.input-new-tag {
  width: 100px;
}
</style>