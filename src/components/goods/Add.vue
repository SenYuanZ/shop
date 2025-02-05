<template>
  <div>
    <nav-header title1="商品管理" title2="添加商品"></nav-header>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>

      <!-- 步骤条区域 -->
      <!-- "activeIndex -0" 隐式转换：将字符串转换为数字类型 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <!-- 基本信息表单区域 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.arrt_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到后台的APi地址  需要完整的地址 -->
            <el-upload
              :action="uploadURl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="PreviewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'Add',
  data () {
    return {
      // 控制步骤显示出哪一个
      activeIndex: '0',
      // 添加表单的数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      // 表单的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类数组列表
      catelist: [],
      // 级联选择器配置对象
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: { Authorization: window.sessionStorage.getItem('token') },
      // 要预览的url完整地址
      previewPath: '',
      // 控制图片预览对话框的显示与隐藏
      PreviewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.message.console.error('获取商品分类数据失败！')
      }
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器选中项 变化 会触发这个事件
    handleChange () {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 控制tabs标签页的切换 函数接收两个参数 activeName 和 oldActiveName
    // activeName:即将离开的标签页名字    oldActiveName:即将进入标签页的名字
    beforeTabLeave (activeName, oldActiveName) {
      /*  console.log('即将离开的标签页名字' + oldActiveName)
      console.log('即将进入的标签页名字' + activeName) */
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品的分类')
        return false
      }
    },
    // 封装请求获取参数列表
    async getCateParan (cateId, paranStr, msg) {
      const { data: res } = await this.$http.get(
        `categories/${cateId}/attributes`,
        {
          params: { sel: paranStr }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(`${msg}`)
      }
      return res.data
    },
    // tabs被选中时触发
    async tabClicked () {
      // console.log(this.activeIndex)
      // 证明访问的时动态参数面板
      if (this.activeIndex === '1') {
        const resData = await this.getCateParan(
          this.cateId,
          'many',
          '获取动态参数列表失败！'
        )
        console.log(resData)
        resData.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = resData
      } else if (this.activeIndex === '2') {
        const resData = await this.getCateParan(
          this.cateId,
          'only',
          '获取静态属性失败!'
        )
        this.onlyTableData = resData
        console.log(this.onlyTableData)
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.PreviewVisible = true
    },
    // 处理移出图片的操作
    handleRemove (file) {
      // 1. 获取将要删除的图片临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从pics 数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath)
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移出
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功
    handleSuccess (response) {
      console.log(response)
      // 1. 拼接得到一个图片信息对杨
      const picInfo = { pic: response.data.tmp_path }
      // 2. 将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(response)
      console.log(this.addForm)
    },
    // 添加商品事件
    add () {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写必要的表单项！')

        // lodash   cloneDeep(obj)
        // 执行添加业务逻辑
        // JSON 的方式处理
        // const form = JSON.parse(JSON.stringify(this.addForm))
        // lodash 进行深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理 动态参数 和 静态属性
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)

        // 发起添加商品请求
        // 商品的名，称必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }

        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0px 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
