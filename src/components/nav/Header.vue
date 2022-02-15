<template>
  <div>
    <!-- 缅方蟹导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{ title1 }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ title2 }}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: 'Header',
  props: { title1: String, title2: String }
}
</script>

<style></style>
