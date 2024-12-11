<script lang="ts" setup>
import { StarFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import router from '../router'

// 跑步数据
interface RunData {
  runnerTime: string
  runnerPeriod: string
  runnerMileage: string
  runnerSpeed: string
  ok: string
}

// 用户数据
interface UserData {
  sid: string
  runs: RunData[]; // 改为数组以存储多条数据
}

onMounted(() => {
  getData()
  getUserInfo();
})

// 加载效果
const Loading = ref(true);
const tableData = ref<RunData[]>([]);
const UserData = ref<UserData>({
  sid: '',
  runs: [] // 初始化为空数组
});

// 获取用户数据
const getUserInfo = async () => {
  try {
    const response = await axios.post(`http://yuedong.diviner.fun/front/get_info`, formData);
    UserData.value.sid = response.data.data.username
  } catch (error) {
    console.error("错误:", error);
  }
}

// 类型标识 
const flag = ref(false);
const title = ref("加载中...");

const route = useRoute();

// 获取 URL 查询参数中的 uid
const getUidFromURL = () => {
  return route.query['uid'] == null ? '' : route.query['uid'].toString()
};

// 获取 URL 查询参数中的 sign
const getSignFromURL = () => {
  return route.query['sign'] == null ? '' : route.query['sign'].toString()
};

const formData = new FormData();
formData.append('uid', getUidFromURL());
formData.append('sign', getSignFromURL());

const goHome = () => {
  const uid = getUidFromURL();
  const sign = getSignFromURL();
  router.push(`/home?uid=${uid}&sign=${sign}`);
};

const getData = async () => {
  try {
    Loading.value = true;

    const verifyFlag = await axios.post(`http://yuedong.diviner.fun/front/verify_sign`, formData).then(res => {
      if (res.data.data !== true) {
        ElMessage.error('sign校验失败');
        return;
      }
    });

    const response = await axios.post(`http://yuedong.diviner.fun/front/get_all_data`, formData).then(res => {
      if (res.data.code === 200) {
        ElMessage({ message: '数据获取成功', type: 'success' });
        tableData.value = res.data.data.runnerDataList;

        // 清空用户数据
        UserData.value.runs = [];
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        // 收集当天所有跑步数据
        for (const item of tableData.value) {

          console.log(item.runnerTime);
          console.log(`${year}年${month}月${day}日`);
          if (item.runnerTime.includes(`${year}年${month}月${day}日`)) {
            UserData.value.runs.push(item);
            flag.value = true;
          }
        }

        if (!flag.value) {
          title.value = "今日无数据";
        }
      } else {
        ElMessage.error('数据获取失败，请重试~');
      }
    });
  } catch (error) {
    title.value = "请检查学号是否正确！";
    ElMessage.error('数据获取失败~');
  } finally {
    Loading.value = false;
  }
};
</script>
<template>
  <div class="common-layout">
    <el-container style="height: 100%">
      <el-header class="common-header">
        <div class="header-title" style="text-align: center;">今日数据</div>
        <el-row class="row">
          <el-col :span="18">
            <el-text size="large" style="margin-left: 5vw;">
              <el-icon>
                <StarFilled />
              </el-icon>
              学号：{{ UserData.sid }}
            </el-text>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" plain round size="small" @click="goHome">全部数据</el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <div v-loading="Loading" element-loading-text="数据加载中..."
          style="display: flex; flex-direction: column; gap: 16px;">
          <el-card v-for="(run, index) in UserData.runs" :key="index" style="max-width: 100%" class="main-card">
            <el-descriptions :column="1">
              <el-descriptions-item label="时间">{{ run.runnerTime }}</el-descriptions-item>
              <el-descriptions-item label="时段">{{ run.runnerPeriod }}</el-descriptions-item>
              <el-descriptions-item label="里程">{{ run.runnerMileage }}</el-descriptions-item>
              <el-descriptions-item label="速度">{{ run.runnerSpeed }}</el-descriptions-item>
              <el-descriptions-item label="是否有效">
                <el-tag :type="run.ok === '✔' ? 'success' : 'danger'">{{ run.ok }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
          <el-result v-if="!flag" icon="error" :title="title"></el-result>
        </div>
      </el-main>
      <el-footer class="common-footer">
        <div style="text-align: center"><el-text size="small"> 金职学创 © 2024 </el-text></div>
      </el-footer>
    </el-container>
  </div>
</template>
<style scoped>
.common-header {
  margin-top: 20px;
}

.header-title {
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 13px;
}

.common-layout {
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(-225deg, #E3FDF5, #FFE6FA 100%);
  height: 100vh;
}

.main-card {
  box-shadow: 0 0 10px #ccc;
  opacity: 0.9;
  border-radius: 10px;
}
</style>