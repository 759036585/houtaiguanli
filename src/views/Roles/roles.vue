<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addShowDialogVisible">添加</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesData" style="width: 100%" border>
        <el-table-column type="expand" width="80px">
          <template slot-scope="scope">
            <el-row :class="['bd', i1 === scope.row.children.length-1 ? 'bdBottom':'']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="['bd',i2===0?'bdTop':'',i2===item1.children.length-1?'bdBtm':'' ]">
                  <el-col :span="6">
                     <el-tag type="success">{{item2.authName}}</el-tag>
                     <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" @close="closeRoles(scope.row,item3.id)" closable v-for="item3 in item2.children" :key="item3.id">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index" width="80px"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" ></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" ></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size='mini' @click="editShowDialogVisible(scope.row.id)" >编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size='mini' @click="delRoles(scope.row.id)" >删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size='mini' @click="rightsDialogVisible(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色弹框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="30%">
      <el-form ref="form" :model="rolesForm" label-width="70px">
        <el-form-item label="角色名称">
          <el-input v-model="rolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="rolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色弹框 -->
      <el-dialog
      title="编辑角色"
      :visible.sync="editRolesDialogVisible"
      width="30%">
      <el-form ref="form" :model="editRolesForm" label-width="70px">
        <el-form-item label="角色名称">
          <el-input v-model="editRolesForm.roleName" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRolesForm.roleDesc" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限弹框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="rightsShowDialogVisible"
      width="40%">
      <el-tree ref="rightsRef" :data="rightsList" :props="defaultProps" :default-checked-keys="defKeys" show-checkbox node-key="id" default-expand-all></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsShowDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表数据
      rolesData: [],
      // 添加角色对象
      rolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色对象 
      editRolesForm: {
        id:null,
        roleName: '',
        roleDesc: ''
      },
      // 添加角色弹出框
      addRolesDialogVisible: false,
      // 编辑角色弹框
      editRolesDialogVisible: false,
      // 分配权限弹框
      rightsShowDialogVisible:false,
      // 权限列表
      rightsList: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认展开勾选权限
      defKeys:[],
      // 角色id
      roleId:''
    }
  },
  methods: {
    // 获取角色列表
    async getRolesList(){
      const {data:res} = await this.$http.get('/roles')
      if(res.meta.status !==200) return this.$message.error(res.meta.msg)
      this.rolesData = res.data
    },

    // 关闭三级权限触发
    async closeRoles(role,rightId) {
      const {data:res}= await this.$http.delete(`/roles/${role.id}/rights/${rightId}`)
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      role.children = res.data
      this.$message.success(res.meta.msg)
    },
    // 添加角色弹框
    addShowDialogVisible() {
      this.addRolesDialogVisible = true
    },

    // 编辑角色弹框
    async editShowDialogVisible(id) {
      this.editRolesDialogVisible = true
      const {data:res} = await this.$http.get('/roles/'+ id)
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editRolesForm = res.data
      this.editRolesForm.id = id
      
    },
    // 添加角色
    async addRoles(){
      const {data:res} = await this.$http.post('/roles',this.rolesForm)
      if(res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesList()
      this.addRolesDialogVisible = false
    },
    // 编辑角色
    async editRoles(){
      const {data:res} = await this.$http.put('/roles/'+this.editRolesForm.id,{
        roleName:this.editRolesForm.roleName,
        roleDesc:this.editRolesForm.roleDesc
      })
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('编辑成功')
      this.editRolesDialogVisible = false
      this.getRolesList()
    },
    // 删除角色
    async delRoles(id) {
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => error) 
      if(result !== 'confirm') return this.$message('已取消删除')
      const {data:res} = await this.$http.delete('/roles/'+id)
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesList()
    },
    // 分配权限弹框
    async rightsDialogVisible(role){
      this.roleId = role.id
      this.defKeys = []
      const {data:res} = await this.$http.get('/rights/tree')
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
      this.getDefKeys(role,this.defKeys)
      this.rightsShowDialogVisible = true
    },
    getDefKeys(node,arr) {
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getDefKeys(item,arr)
      })
    },
    // 分配权限
    async allocRights() {
      const strArr = [
        ...this.$refs.rightsRef.getCheckedKeys(),
        ...this.$refs.rightsRef.getHalfCheckedKeys()
      ]
      let strArr1 = strArr.join(',')
      const {data:res} = await this.$http.post(`/roles/${this.roleId}/rights`,{rids:strArr1})
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
       this.$message.success(res.meta.msg)
       this.getRolesList()
      this.rightsShowDialogVisible = false
      console.log(res)
    }
  },
  created() {
    this.getRolesList()
    
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
.bd {
  border: 1px solid #eee;
  border-bottom: none;
}
.bdBottom {
  border-bottom: 1px solid #eee;
}
.bdTop {
  border-top: none;
}
.bdbtm{
  border-bottom: none;
}
.el-tag {
  margin: 7px;
}
.el-row {
  display: flex;
  align-items: center;
}
</style>