<!--suppress ALL -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="角色名称" style="width: 200px;" class="filter-item" clearable />
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="fetchData()">查询</el-button>
      <el-button v-if="permitCreate" class="filter-item" type="primary" @click="handleCreate()">新建</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="roles"
      row-key="id"
      border
      :header-cell-style="{background:'#F2F6FC',color:'#555'}"
    >
      <el-table-column align="center" prop="name" label="角色名称" min-width="100" />
      <el-table-column align="center" prop="remark" label="角色描述" min-width="100" />
      <el-table-column v-if="false" align="center" prop="resource" label="角色权限" min-width="100" />
      <el-table-column v-if="permitUpdate||permitDelete" align="center" prop="operation" label="操作" min-width="65">
        <template slot-scope="scope">
          <el-dropdown v-if="scope.row.id!=1 && scope.row.id!=11" trigger="click">
            <el-button type="primary" size="mini">
              操作<i class="el-icon-arrow-down el-icon--right" />
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
        :model="role"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:30px;"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="role.name" />
        </el-form-item>
        <el-form-item label="角色描述" prop="remark">
          <el-input v-model="role.remark" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleAuth()">权限</el-button>
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dataOperation()">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogTreeVisible" :title="'角色权限'" width="900px">
      <el-table
        ref="resourceTable"
        :data="resources"
        row-key="id"
      >
        <el-table-column
          prop="name"
          label="资源"
          width="200"
        />
        <el-table-column
          label="权限"
          width="400"
          align="center"
        >
          <template slot-scope="scope">
            <el-checkbox-group v-model="scope.row.checkList">
              <el-checkbox-button label="create" :disabled="scope.row.children.length>0 || scope.row.path.includes('member')">新增</el-checkbox-button>
              <el-checkbox-button label="delete" :disabled="scope.row.children.length>0 || scope.row.path.includes('member')">删除</el-checkbox-button>
              <el-checkbox-button label="update" :disabled="scope.row.children.length>0 || scope.row.path.includes('member')">修改</el-checkbox-button>
              <el-checkbox-button label="read">查询</el-checkbox-button>
            </el-checkbox-group>
          </template>
        </el-table-column>
        <el-table-column
          prop="permit"
          label="permit"
          width="60"
          align="center"
        />
        <el-table-column
          prop="checkList"
          label="checkList"
          width="200"
          align="center"
        />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTreeVisible = false">取消</el-button>
        <el-button type="primary" @click="authorization()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {createRole, deleteRole, getRoles, updateRole} from '@/api/role'
  import Pagination from '@/components/Pagination'
  import {getPermittedResourcesByRole} from '../../api/resource'
  import store from '@/store'

  export default {
  components: { Pagination },
  data() {
    return {
      // 权限分配表格中的资源树
      resources: [],
      listLoading: false,
      roles: [],
      count: 0,
      listQuery: {
        name: '',
        page: 1,
        size: 20
      },
      dialogFormVisible: false,
      dialogTreeVisible: false,
      textMap: {
        create: '新建角色信息',
        update: '修改角色信息'
      },
      role: {
        id: null,
        name: null,
        remark: null,
        // 权限分配表格所有row
        resource: []
      },
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'change' }]
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
    fetchData() {
      this.listLoading = true
      getRoles(this.listQuery).then(res => {
        this.roles = res.data.items
        this.count = res.data.count
      }).finally(() => {
        this.listLoading = false
      })
    },
    async handleAuth() {
      this.dialogTreeVisible = true
    },
    async handleCreate() {
      this.resetModel()
      this.resources = (await getPermittedResourcesByRole({ roleId: this.role.id })).data
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async handleUpdate(row) {
      this.resetModel()
      this.role = Object.assign({}, row)
      this.resources = (await getPermittedResourcesByRole({ roleId: this.role.id })).data
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('删除后不可恢复', '确定删除角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRole([row.id]).then((res) => {
          if (res.code === 20000) {
            this.fetchData()
            this.$message({
              message: '删除角色成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: '删除角色失败',
              type: 'error'
            })
          }
        })
      })
    },
    dataOperation() {
      this.role.resource = this.resources
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            createRole(this.role).then(res => {
              this.operationRes(res)
            })
          }
          if (this.dialogStatus === 'update') {
            updateRole(this.role).then(res => {
              this.operationRes(res)
            })
          }
        }
      })
    },
    operationRes(res) {
      if (res.code === 20000) {
        this.listQuery.name = ''
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
    authorization() {
      this.setPermit()
      // this.role.resource = this.resources
      this.dialogTreeVisible = false
    },
    resetModel() {
      this.role = {
        id: null,
        name: null,
        remark: null,
        resource: []
      }
      this.resources = []
    },
    setPermit() {
      for (var resource of this.resources) {
        resource.permit = this.calculatePermit(resource.checkList)
        if (resource.children && resource.children.length > 0) {
          for (var child of resource.children) this.setChildrenPermit(child)
        }
      }
    },
    setChildrenPermit(resource) {
      resource.permit = this.calculatePermit(resource.checkList)
      if (resource.children && resource.children.length > 0) {
        for (child of resource.children) this.setChildrenPermit(child)
      }
    },
    calculatePermit(checkList) {
      let permit = 0
      if (checkList.includes('read')) permit += 1
      if (checkList.includes('update')) permit += 2
      if (checkList.includes('delete')) permit += 4
      if (checkList.includes('create')) permit += 8
      return permit
    }
  }
}
</script>
