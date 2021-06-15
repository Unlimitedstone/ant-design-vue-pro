<!--suppress ALL -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="配置名称" style="width: 150px;" class="filter-item" clearable />
      <el-input v-model="listQuery.key" placeholder="key" style="width: 150px;" class="filter-item" clearable />
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="fetchData()">查询</el-button>
      <el-button v-if="permitCreate" class="filter-item" type="primary" @click="handleCreate()">新建</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      :header-cell-style="{background:'#F2F6FC',color:'#555'}"
      highlight-current-row
    >
      <el-table-column label="配置名称" min-width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="key" min-width="80" align="center">
        <template slot-scope="scope">
          {{ scope.row.key }}
        </template>
      </el-table-column>
      <el-table-column label="value" min-width="300" align="center">
        <template slot-scope="scope">
          {{ scope.row.value }}
        </template>
      </el-table-column>
      <el-table-column label="分类" min-width="80" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="300" align="center">
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
      v-show="count > listQuery.size"
      :total="count"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.size"
      @pagination="fetchData()"
    />
    <el-dialog :visible.sync="dialogFormVisible" :title="textMap[dialogStatus]" width="600px">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="config"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:30px;"
      >
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="config.name" />
        </el-form-item>
        <el-form-item label="key" prop="name">
          <el-input v-model="config.key" />
        </el-form-item>
        <el-form-item label="value" prop="name">
          <el-input v-model="config.value" />
        </el-form-item>
        <el-form-item label="分类" prop="name">
          <el-input v-model="config.category" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="config.remark" />
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
  import {createConfig, deleteConfig, getConfigs, updateConfig} from '@/api/config'
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
        key: '',
        page: 1,
        size: 20
      },
      dialogFormVisible: false,
      textMap: {
        create: '新建系统配置',
        update: '修改系统配置'
      },
      count: 0,
      config: {
        id: null,
        name: null,
        key: null,
        value: null,
        category: null,
        remark: null
      },
      rules: {
        name: [{ required: true, message: '配置名称不能为空', trigger: 'change' }, { max: 20, message: '配置名称不能超过20个字', trigger: 'change' }],
        key: [{ required: true, message: 'key不能为空', trigger: 'change' }, { max: 20, message: 'key不能超过20个字', trigger: 'change' }],
        value: [{ required: true, message: 'value不能为空', trigger: 'change' }],
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
      getConfigs(this.listQuery).then(res => {
        this.list = res.data.items
        this.count = res.data.count
      }).finally(() => {
        this.listLoading = false
      })
    },
    resetModel() {
      this.config = {
        id: null,
        key: null,
        value: null,
        name: null,
        category: null,
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
      this.config = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('删除后不可恢复', '确定删除配置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteConfig([row.id]).then((res) => {
          if (res.code === 20000) {
            this.fetchData()
            this.$message({
              message: '删除配置成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: '删除配置失败',
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
            createConfig(this.config).then(res => {
              this.operationRes(res)
            })
          }
          if (this.dialogStatus === 'update') {
            updateConfig(this.config).then(res => {
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
    }
  }
}
</script>
