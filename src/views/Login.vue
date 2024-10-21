<script lang="ts" setup>
import axios from 'axios'
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import router from '../router'

const route = useRoute()
const ruleFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: ''
})
const rules = reactive({
  username: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
});

// 获取 URL 查询参数中的 uid
const getUidFromURL = () => {
  return route.query['uid'] == null ? '' : route.query['uid'].toString()
};

// 获取 URL 查询参数中的 sign
const getSignFromURL = () => {
  return route.query['sign'] == null ? '' : route.query['sign'].toString()
}

const login = async () => {
  let uid = getUidFromURL();
  let sign = getSignFromURL();

  // 表单验证
  if (!ruleFormRef.value) return
  ruleFormRef.value.validate((valid) => {
    if (!valid) {
      ElMessage.error('请填写所有必填字段')
      return
    }

  // 调试用
  //uid = 'of1jk6q6asDKnTaIBiarvxvrIFSM'
  //sign = '58ebdda238d69bfa616bd1ae9a873fe1'
    // 创建 URLSearchParams 对象
    const formData = new URLSearchParams();
    formData.append('uid', uid);
    formData.append('password', loginForm.password);
    formData.append('sign', sign);
    formData.append('sid', loginForm.username);

    // 发送 POST 请求
    axios.post('http://coaixy.bluedog233.cn/front/bind', formData)
      .then(res => {
        console.log('Response:', res)
        if (res.data.code === 200) {
          ElMessage.success('登录成功')
          // 跳转到home页面
          router.push(`/home?uid=${uid}&sign=${sign}`)
        } else {
          ElMessage.error('登录失败，请重试')
        }
      })
      .catch(error => {
        ElMessage.error('系统繁忙，请稍后再试')
        console.error(error)
      })
  })
}
</script>

<template>
  <div class="login-container">
    <el-card style="max-width: 100%" class="login-card">
      <template #header>
        <div class="card-header">
          <span>登录阳光长跑</span>
        </div>
      </template>
      <el-form ref="ruleFormRef" :model="loginForm" style="max-width: 600px" status-icon :rules="rules"
        label-width="auto">
        <el-form-item label="学号" prop="username" style="width: 320px">
          <el-input v-model="loginForm.username" clearable placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="密码" prop="password" style="width: 320px">
          <el-input v-model="loginForm.password" clearable placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-text>注意：账号密码与通识教育相同</el-text>
        </el-form-item>
        <el-button type="primary" class="login-btn" @click="login">登录</el-button>
      </el-form>
      <template #footer>
        <div style="text-align: center"><el-text size="small"> 悦动金职 © 2024 </el-text></div>
      </template>
    </el-card>
  </div>
</template>

<style scoped>

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-image: linear-gradient(-225deg, #E3FDF5, #FFE6FA 100%);
}

.login-card {
  box-shadow: 0 0 10px #ccc;
  opacity: 0.7;
}

.login-btn {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
