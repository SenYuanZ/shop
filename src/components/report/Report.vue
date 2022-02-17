<template>
  <div>
    <!-- 导航区域 -->
    <nav-header title1="数据统计" title2="数据报表"></nav-header>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 2. 为 ECharts 准备一个定义了宽高的 DOM -->
      <div id="main" style="width: 750px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// 1. 引入 echarts
// 注意：使用ES6的引入语法import 要加 * as echarts
// 就使用ComponentJS的语法引入
// const echarts = require('echarts')
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  name: 'Report',
  data () {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {},
  // 此时，页面上的元素，已经呗渲染完毕了
  async mounted () {
    // 3. 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败！')
    }

    // 4. 准备数据和配置项
    // 合并方式有2中 1.外部的一个插件
    // 2.Object.assign(target, ...sources)  该函数需要接收两个参数  target 目标对象。 sources 源对象
    // const result = Object.assign(this.options, res.data)
    const result = _.merge(res.data, this.options)

    // 5. 展示数据
    myChart.setOption(result)
  },
  methods: {}
}
</script>

<style lang="less" scoped></style>
>
