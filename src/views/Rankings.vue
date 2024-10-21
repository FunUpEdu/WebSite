<template>
  <div class="rankings">
    <el-card style="max-width: 100%;max-height:100%" class="rankings-card">
        <template #header>
        <div class="card-header" style="text-align: center">
            <el-text tag="b" size="large">排行榜TOP10</el-text>
        </div>
        </template>
        <!-- 表格 -->
        <div>
            <el-table :data="rankingsData.records" style="width: 100%">
                <el-table-column label="排名" type="index" align="center" width="80"/>
                <el-table-column prop="nickName" label="昵称" align="center"/>
                <el-table-column prop="totalCount" label="总次数" align="center"/>
                <el-table-column prop="averageSpeed" label="平均速度" align="center"/>
            </el-table>
        </div>
        <el-text>注意：排名仅适用于已绑定用户</el-text>
        <template #footer >
            <div class="footer-buttons">
                <el-button type="primary" plain class="button" @click="goHome">我的数据</el-button>
                <el-button type="primary" plain class="button" @click="goToday">今日数据</el-button>
                <el-button type="primary" plain class="button" @click="goBind">重新绑定</el-button>
            </div>
            <br>
            <div style="text-align: center"><el-text size="small"> 悦动金职 © 2024 </el-text></div>
        </template>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import router from '@/router';
import { useRoute } from 'vue-router'

interface RankingsData {
  records: Array<{
    nickName: string;
    totalCount: string;
    averageSpeed: string;
  }>;
  total: number;
}

const rankingsData = ref<RankingsData>({
  records: [],
  total: 0,
});
const pageNo = ref<number>(1);
const pageSize = ref<number>(10);
const route = useRoute()
// 获取 URL 查询参数中的 uid
const getUidFromURL = () => {
  return route.query['uid'] == null ? '' : route.query['uid'].toString()
};
// 获取 URL 查询参数中的 sign
const getSignFromURL = () => {
  return route.query['sign'] == null ? '' : route.query['sign'].toString()
}

let uid = getUidFromURL();
let sign = getSignFromURL();
const goHome = () => {
  router.push(`/home?uid=${uid}&sign=${sign}`)
};

const goToday = () => {
  let uid = getUidFromURL();
  let sign = getSignFromURL();
  router.push(`/today?uid=${uid}&sign=${sign}`)
};
const goBind = () => {
  router.push(`/bind`)
};

const fetchRankings = async (page: number = 1) => {
  pageNo.value = page;
  try {
    const response = await axios.get('http://coaixy.bluedog233.cn/front/rankings', {
      params: {
        pageNum: pageNo.value,
        pageSize: pageSize.value,
      },
    });
    console.log('响应数据:', response.data);

    rankingsData.value = response.data.data;
  } catch (error) {
    console.error('获取排行榜失败', error);
  }
};

onMounted(() => {
  fetchRankings();
});
</script>

<style scoped>
.rankings {
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: linear-gradient(-225deg, #E3FDF5, #FFE6FA 100%);
}

.rankings-card {
  height: 100vh;
  width: 100vw;
  box-shadow: 0 0 10px #ccc;
  opacity: 0.8;
}

.footer-buttons {
  display: flex;
  justify-content: center; /* 居中对齐 */
  gap: 20px; /* 按钮之间的间隔 */
}

.button {
  flex: 1; /* 让按钮均匀分布 */
  max-width: 120px; /* 可选：限制按钮的最大宽度 */
}
</style>
