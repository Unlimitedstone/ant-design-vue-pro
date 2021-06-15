<!--suppress ALL -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="组织名称" style="width: 200px;" class="filter-item" clearable />
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
    >
      <el-table-column label="组织名称" min-width="200" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="组织描述" min-width="300" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="permitUpdate||permitDelete" align="center" prop="created_at" label="操作" min-width="150">
        <template slot-scope="scope">
          <el-dropdown trigger="click">
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
      v-show="count>0"
      :total="count"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.size"
      @pagination="fetchData()"
    />
    <el-dialog :visible.sync="dialogFormVisible" :title="textMap[dialogStatus]" width="600px">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="org"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:30px;"
      >
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="org.name" />
        </el-form-item>
        <el-form-item label="组织描述" prop="remark">
          <el-input v-model="org.remark" />
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
  import {createOrg, deleteOrg, getOrgs, updateOrg} from '@/api/org'
  import Pagination from '@/components/Pagination'
  import store from '@/store'

  export default {
  components: { Pagination },
  data() {
    return {
      list: null,
      listLoading: true,
      listQuery: {
        name: '',
        page: 1,
        size: 20
      },
      dialogFormVisible: false,
      textMap: {
        create: '新建组织信息',
        update: '修改组织信息'
      },
      count: 0,
      org: {
        id: null,
        name: null,
        remark: null
      },
      rules: {
        name: [{ required: true, message: '组织名称不能为空', trigger: 'change' }, { max: 20, message: '组织名称不能超过20个字', trigger: 'change' }],
        remark: [{ max: 100, message: '描述不能超过100个字', trigger: 'change' }]
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
    queryData() {
      this.listQuery.page = 1
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      getOrgs(this.listQuery).then(res => {
        this.list = res.data.items
        this.count = res.data.count
      }).finally(() => {
        this.listLoading = false
      })
    },
    resetModel() {
      this.org = {
        id: null,
        name: null,
        remark: null
      }
    },
    handleCreate() {
      this.resetModel()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.resetModel()
      this.org = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('删除后不可恢复', '确定删除组织', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteOrg([row.id]).then((res) => {
          if (res.code === 20000) {
            this.fetchData()
            this.$message({
              message: '删除组织成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: '删除组织失败',
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
            createOrg(this.org).then(res => {
              this.operationRes(res)
            })
          }
          if (this.dialogStatus === 'update') {
            updateOrg(this.org).then(res => {
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
          message: this.textMap[this.dialogStatus] + ':' + res.msg,
          type: 'error'
        })
      }
    }
  }
}
</script>
