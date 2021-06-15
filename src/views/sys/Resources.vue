<!--suppress ALL -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-if="permitCreate" class="filter-item" type="primary" @click="handleCreate(null)">新建</el-button>
      <el-button class="filter-item" type="primary" plain icon="el-icon-arrow-up" @click="collapseAll()">收起</el-button>
      <el-button class="filter-item" type="primary" plain icon="el-icon-arrow-down" @click="expandAll()">展开</el-button>
    </div>
    <el-table
      ref="resouceTable"
      v-loading="listLoading"
      :data="resources"
      row-key="id"
      border
      default-expand-all
      :header-cell-style="{background:'#F2F6FC',color:'#555'}"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column align="left" prop="name" label="资源名称" min-width="100" />
      <el-table-column align="left" prop="path" label="路径" min-width="100" />
      <el-table-column align="left" prop="view" label="视图" min-width="100" />
      <el-table-column align="left" prop="redirect" label="跳转" min-width="100" />
      <el-table-column align="center" prop="rank" label="排序" min-width="35" />
      <el-table-column v-if="permitCreate||permitDelete||permitUpdate" align="center" prop="operation" label="操作" min-width="65">
        <template slot-scope="scope">
          <el-dropdown trigger="click">
            <el-button type="primary" size="mini">
              操作<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="scope.row.parentId === null && permitCreate" @click.native="handleCreate(scope.row.id)">添加</el-dropdown-item>
              <el-dropdown-item v-if="permitUpdate" @click.native="handleUpdate(scope.row)">修改</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.children.length <= 0 && permitUpdate" @click.native="handleDelete(scope.row)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogFormVisible" :title="textMap[dialogStatus]" width="600px">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="resource"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:30px;"
      >
        <el-form-item label="资源名称" prop="name">
          <el-input v-model="resource.name" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="resource.path" />
        </el-form-item>
        <el-form-item label="视图" prop="view">
          <el-input v-model="resource.view" />
        </el-form-item>
        <el-form-item label="跳转" prop="redirect">
          <el-input v-model="resource.redirect" />
        </el-form-item>
        <el-form-item label="排序" prop="rank">
          <el-input v-model="resource.rank" />
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
  import {createResource, deleteResource, getResources, updateResource} from '@/api/resource'
  import store from '@/store'

  export default {
    data() {
      return {
        listLoading: false,
        resources: [],
        isExpandAll: false,
        dialogFormVisible: false,
        textMap: {
          create: '新建资源信息',
          update: '修改资源信息'
        },
        resource: {},
        rules: {
          name: [{required: true, message: '名称不能为空', trigger: 'change'},
            {min: 1, max: 20, message: '长度必须为1~20', trigger: 'change'}],
          path: [{required: true, message: '路径不能为空', trigger: 'change'}],
          view: [{required: true, message: '视图不能为空', trigger: 'change'}],
          rank: [{required: true, message: '排序不能为空', trigger: 'change'},
            {type: 'string', pattern: '^[1-9]\\d*$', message: '必须为正整数', trigger: 'change'}]
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
      getResources().then(res => {
        this.resources = res.data
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleCreate(parentId) {
      this.resetModel()
      this.resource.parentId = parentId
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.resetModel()
      this.resource = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('删除后不可恢复', '确定删除资源', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteResource([row.id]).then((res) => {
          if (res.code === 20000) {
            this.fetchData()
            this.$message({
              message: '删除资源成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: '删除资源失败',
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
            createResource(this.resource).then(res => {
              this.operationRes(res)
            })
          }
          if (this.dialogStatus === 'update') {
            updateResource(this.resource).then(res => {
              this.operationRes(res)
            })
          }
        }
      })
    },
    operationRes(res) {
      if (res.code === 20000) {
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
    resetModel() {
      this.resource = {}
    },
    expandAll() { // 默认展开全部的话，首次加载需要在$nextTick下进行
      this.isExpandAll = true
      this.forArr(this.resources, this.isExpandAll)
    },
    collapseAll() { // 默认展开全部的话，首次加载需要在$nextTick下进行
      this.isExpandAll = false
      this.forArr(this.resources, this.isExpandAll)
    },
    forArr(arr, isExpand) {
      arr.forEach(i => {
        this.$refs.resouceTable.toggleRowExpansion(i, isExpand)
        if (i.children) {
          this.forArr(i.children, isExpand)
        }
      })
    }
  }
}
</script>
