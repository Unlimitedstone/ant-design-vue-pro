<!--suppress ALL -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户名" style="width: 200px;" class="filter-item" clearable />
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="fetchData()">查询</el-button>
      <el-button v-if="permitCreate" class="filter-item" type="primary" @click="handleCreate()">新建</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :header-cell-style="{background:'#F2F6FC',color:'#555'}"
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="用户名" min-width="70" align="center">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="登录名" min-width="70" align="center">
        <template slot-scope="scope">
          {{ scope.row.loginame }}
        </template>
      </el-table-column>
      <el-table-column label="组织" min-width="150" align="center">
        <template slot-scope="scope">
          <el-tag v-for="org in scope.row.orgs" :key="org.id">{{ org.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="角色" min-width="150" align="center">
        <template slot-scope="scope">
          <el-tag v-for="role in scope.row.roles" :key="role.id">{{ role.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="业务" min-width="150" align="center">
        <template slot-scope="scope">
          <el-tag v-for="business in scope.row.businesses" :key="business.id">{{ business.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="permitUpdate||permitDelete" align="center" prop="created_at" label="操作" min-width="150">
        <template slot-scope="scope">
          <el-dropdown v-if="scope.row.id !== '000000000000000000000000'" trigger="click">
            <el-button type="primary" size="mini">
              操作<i class="el-icon-arrow-down el-icon--right"/>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="permitUpdate" @click.native="handleUpdate(scope.row)">修改</el-dropdown-item>
              <el-dropdown-item v-if="permitDelete" @click.native="handleDelete(scope.row)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="count > 0"
      :total="count"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.size"
      @pagination="fetchData()"
    />
    <el-dialog :visible.sync="dialogFormVisible" :title="textMap[dialogStatus]" width="600px">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="user"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:30px;"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" />
        </el-form-item>
        <el-form-item label="登录名" prop="loginame">
          <el-input v-model="user.loginame" />
        </el-form-item>
        <el-form-item label="组织" prop="orgs">
          <el-select v-model="user.orgs" value-key="id" multiple placeholder="请选择" style="width: 100%">
            <el-option
              v-for="org in orgs"
              :key="org.id"
              :label="org.name"
              :value="{id: org.id, name: org.name, remark: org.remark}"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="user.roles" value-key="id" multiple placeholder="请选择" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="{id: role.id, name: role.name, remark: role.remark}"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="业务" prop="businesses">
          <el-select v-model="user.businesses" value-key="id" multiple placeholder="请选择" style="width: 100%">
            <el-option
              v-for="business in businesses"
              :key="business.id"
              :label="business.name"
              :value="{id: business.id, name: business.name, code: business.code, desc: business.desc}"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dataOperation()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {createUser, deleteUser, getUsers, updateUser} from '@/api/user'
  import {getAllOrgs} from '@/api/org'
  import {getAllRoles} from '@/api/role'
  import {getAllBusinesses} from '@/api/business'
  import Pagination from '@/components/Pagination'
  import store from '@/store'

  export default {
    components: {Pagination},
    filters: {
      statusFilter(status) {
        const statusMap = {
          '1': 'success',
          '0': 'gray'
        }
        return statusMap[status]
      },
      statusLabel(status) {
        const statusMap = {
          '1': '是',
          '0': '否'
        }
        return statusMap[status]
      }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      dialogFormVisible: false,
      textMap: {
        create: '新建用户信息',
        update: '修改用户信息'
      },
      multipleSelection: [],
      count: 0,
      roles: [],
      orgs: [],
      businesses: [],
      listQuery: {
        username: '',
        page: 1,
        size: 20
      },
      user: {
        id: null,
        username: null,
        loginame: null,
        orgs: null,
        roles: null,
        businesses: null
      },
      rules: {
        username: [{required: true, message: '用户名不能为空', trigger: 'change'},
          {min: 1, max: 20, message: '长度必须为1~20', trigger: 'change'}],
        loginame: [{required: true, message: '登录名不能为空', trigger: 'change'},
          {min: 1, max: 20, message: '长度必须为1~20', trigger: 'change'}],
        orgs: [{required: true, message: '请选择组织', trigger: 'change'}],
        roles: [{required: true, message: '请选择角色', trigger: 'change'}],
        businesses: [{required: true, message: '请选择业务', trigger: 'change'}]
      },
      dialogStatus: 'create'
    }
  },
    computed: {
      permit() {
        return store.getters.route_permit_map.get(this.$route.path)
      },
      permitCreate() {
        return (this.permit & 8) === 8
      },
      permitDelete() {
        return (this.permit & 4) === 4
      },
      permitUpdate() {
        return (this.permit & 2) === 2
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      handleSelectionChange(rows) {
        this.multipleSelection = rows
      },
      fetchData() {
        this.listLoading = true
        getUsers(this.listQuery).then(res => {
        this.list = res.data.items
        this.count = res.data.count
      }).finally(() => {
        this.listLoading = false
      })
    },
    resetModel() {
      this.user = {}
      this.roles = []
      this.orgs = []
      this.businesses = []
    },
    async handleCreate() {
      this.resetModel()
      this.roles = (await getAllRoles()).data
      this.orgs = (await getAllOrgs()).data
      this.businesses = (await getAllBusinesses()).data
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async handleUpdate(row) {
      this.resetModel()
      this.roles = (await getAllRoles()).data
      this.orgs = (await getAllOrgs()).data
      this.businesses = (await getAllBusinesses()).data
      this.user = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('删除后不可恢复', '确定删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // let ids = this.multipleSelection.map(row => row.id)
        deleteUser([row.id]).then((res) => {
          if (res.code === 20000) {
            this.fetchData()
            this.$message({
              message: '删除用户成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: '删除用户失败',
              type: 'error'
            })
          }
        })
      })
    },
    dataOperation() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            createUser(this.user).then(res => {
              this.operationRes(res)
            })
          }
          if (this.dialogStatus === 'update') {
            updateUser(this.user).then(res => {
              this.operationRes(res)
            })
          }
        }
      })
    },
    operationRes(res) {
      if (res.code === 20000) {
        this.listQuery.username = ''
        this.fetchData()
        this.dialogFormVisible = false
        this.$message({
          message: this.textMap[this.dialogStatus] + '成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: this.textMap[this.dialogStatus] + '失败',
          type: 'error'
        })
      }
    },
    handleAuth(row) {
      // if (row.runningStatus === '1') {
      //   this.$message({ message: '当前Instance已处于启动状态！', type: 'error' })
      //   return
      // }
      // this.$confirm('启动Instance: ' + row.name, '确定启动Instance服务', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(() => {
      //   instanceStatus(row.id, 'start').then((res) => {
      //     if (res.data) {
      //       this.fetchData()
      //       this.$message({
      //         message: '启动成功, 稍后请刷新列表查看状态',
      //         type: 'success'
      //       })
      //     } else {
      //       this.$message({
      //         message: '启动Instance出现异常',
      //         type: 'error'
      //       })
      //     }
      //   })
      // })
    }
  }
}
</script>
