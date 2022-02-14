<template>
  <div>
    <!-- 缅方蟹导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        show-index
        border
        class="treeTable"
        index-text="#"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
      >
        <!-- 是否有效模板 -->
        <template slot="isok" scope="scope">
          <i
            class="el-icon-success"
            style="color: lightgreen"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: lightgreen" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" scope="scope">
          <el-tag sizi="min" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            sizi="min"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" sizi="min" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" scope="scope">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="removeCateById(scope.row)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- option 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover', ...cascaderProps }"
            @change="parentCateListCatChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <!-- 编辑分类文本框 -->
      <el-form
        :model="editCateForm"
        :rules="editCateRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部的按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 3
      },
      // 商品分类的数据列表
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示 将当前列定义为模板列
          type: 'template',
          // 表示 当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示 将当前列定义为模板列
          type: 'template',
          // 表示 当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示 将当前列定义为模板列
          type: 'template',
          // 表示 当前这一列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级 默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类表单验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: 'true'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制编辑分类的显示与隐藏
      editCateDialogVisible: false,
      // 编辑的分类数据对象
      editCateForm: {},
      // 编辑分类表单验证规则
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // 把数据列表，赋值给 catelist
      this.catelist = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听 page size 改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 page num 改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示添加分类对话框
    showAddCateDialog () {
      // 先获取父级分类数据列表
      this.getParentCateList()
      // 在展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
    },
    // 选中项发生变化触发这个函数
    parentCateListCatChanged () {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0 证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return true
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加新的分类
    addCate () {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return false
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 关闭对话框事件,重置表单数据
    addCateDialogClosed () {
      // 清空输入的分类
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击展开编辑分类
    async showEditCateDialog (cateInfo) {
      const { data: res } = await this.$http.get(
        `categories/${cateInfo.cat_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类名称失败')
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 点击按钮确定编辑分类
    async editCate () {
      const { data: res } = await this.$http.put(
        `categories/${this.editCateForm.cat_id}`,
        {
          cat_name: this.editCateForm.cat_name
        }
      )
      if (res.meta.status !== 200) return this.$message.error('编辑信息失败')
      this.$message.success('编辑信息成功！')
      this.editCateDialogVisible = false
      this.getCateList()
    },
    // 删除分类按钮
    async removeCateById (cateInfo) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消删除！')
      // 删除成功 发送请求
      const { data: res } = await this.$http.delete(
        'categories/' + cateInfo.cat_id
      )
      // 判断是否删除成功
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
