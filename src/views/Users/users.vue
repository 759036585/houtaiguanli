<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="7">
          <el-input placeholder="请输入内容" clearable @clear="getUserList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search"  @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisibleUser">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="userList" border>
        <el-table-column type="index" label="序号" ></el-table-column>
        <el-table-column prop="username" label="姓名" ></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- 控制状态 -->
            <el-switch v-model="scope.row.mg_state" @change="changeStatus(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!-- 操作部分 -->
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size='mini' @click="editDialogVisibleUser(scope.row.id)"></el-button>
            <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size='mini' @click="allocUserDialogVisible(scope.row)"></el-button>
            </el-tooltip>
            <el-button type="danger" icon="el-icon-delete" size='mini' @click="delUserMessage(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 7, 9]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 弹出层 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      @close="addDialogVisibleClose"
      width="50%">
      <!-- 添加用户表单数据 -->
      <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      @close="editDialogVisibleClose" 
      width="50%">
      <el-form ref="editUserFormRef" :model="editUserForm" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editUserForm.email" clearable></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="editUserForm.mobile" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色弹出框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="userDialogVisible"
      width="30%">
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>
          <el-select v-model="userId" placeholder="请选择">
            <el-option
              v-for="item in userRoles"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import myBread from '@/components/myBread/myBread.vue'
export default {
  // components:{
  //   'my-bread':myBread
  // },
  data() {
    // 验证邮箱格式
    var checkEmail=(rule,value,callback)=> {
      let regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
      if(regEmail.test(value)) return callback()
      return callback(new Error('邮箱格式不正确'))
    }
    // 验证手机格式
    var checkMobile=(rule,value,callback)=>{
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/
      if(regMobile.test(value)) return callback()
      return callback(new Error('手机格式不正确'))
    }

    return {
      // 获取用户参数对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      // 用户列表数据
      userList: [],
      // 总数据条数
      total: 0,
      // 添加用户弹出层
      addDialogVisible:false,
      // 修改用户弹出层
      editDialogVisible: false,
      // 分配角色弹出框
      userDialogVisible: false,
      // 添加用户对象
      addUserForm: {
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      // 修改用户对象
      editUserForm: {
        email: null,
        mobile:null
      },
      // 添加用户验证
      addUserFormRules: {
        username:[
          {required: true,message:'请输入用户名',trigger:'blur'},
          {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
        ],
        password:[
          {required: true,message:'请输入密码',trigger:'blur'},
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
        ],
        email:[
          {validator: checkEmail,trigger:'blur'}
        ],
        mobile:[
          {validator: checkMobile,trigger:'blur'}
        ]
      },
      // 角色信息
      userInfo: {},
      // 角色描述列表
      userRoles:[],
      userId: ''
    }
  },
  methods: {
    // 获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get("/users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 切换每页显示多少条数据
    handleSizeChange(pageSize){
      this.queryInfo.pagesize = pageSize
      this.getUserList()
    },
    // 切换页码
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 修改状态
    async changeStatus(state){
      const {data:res} = await this.$http.put(`users/${state.id}/state/${state.mg_state}`)
      if(res.meta.status !== 200) {
        state.mg_state = !state.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success({message:res.meta.msg,duration: 1000})
    },
    // 添加用户弹出层
    addDialogVisibleUser() {
      this.addDialogVisible = true
    },
    // 关闭添加弹出框
    addDialogVisibleClose(){
      this.$refs.addUserFormRef.resetFields()
    },
    editDialogVisibleClose(){
      this.$refs.editUserFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if(!valid) return this.$message.error('验证不通过')
        const {data:res} = await this.$http.post('/users',this.addUserForm)
        if(res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success({message:res.meta.msg,duration: 1000})
        this.getUserList()
        this.addDialogVisible = false
      })
    },
    // 修改用户弹出框
    async editDialogVisibleUser(id) {
      this.editDialogVisible = true
      const {data:res} = await this.$http.get('/users/'+ id)
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editUserForm = res.data
    },
    // 修改用户
    async editUser(){
      const {data:res} = await this.$http.put(`users/${this.editUserForm.id}`,
      {mobile:this.editUserForm.mobile,email:this.editUserForm.email})
      if(res.meta.status!==200) return this.$message.error(res.meta.msg)
      this.getUserList()
      this.$message.success(res.meta.msg)
      this.editDialogVisible = false
    },
    // 删除用户弹出消息
    async delUserMessage(id){
      const res = await this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if(res !== 'confirm') return this.$message('您取消删除操作')
      const {data:result} = await this.$http.delete('users/'+id)
      if(result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.$message.success(result.meta.msg)
      this.getUserList()
    },
    // 分配角色弹出框
    async allocUserDialogVisible(role) {
      this.userInfo = role
      const {data:res} = await this.$http.get('roles')
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userRoles = res.data
      this.userDialogVisible = true
    },
    async allocUser(){
      const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.userId})
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getUserList()
      this.$message.success(res.meta.msg)
      this.userDialogVisible = false
    }
  },
  created() {
    this.getUserList();
  }
};
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