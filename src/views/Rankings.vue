<template>
  <div class="rankings">
    <el-card style="max-width: 100%;max-height:100%" class="rankings-card">
        <template #header>
        <div class="card-header" style="text-align: center">
            <el-text tag="b" size="large">排行榜TOP10</el-text>
        </div>
        </template>
        <!-- 表格 -->
        <div class="rankings-table">
          <el-text size="large">
            <el-icon>
              <Avatar />
            </el-icon>
            您的昵称：{{ userData.nickName }}
          </el-text>
          <el-divider direction="vertical" />
          <el-button type="primary" @click="edit" link>修改</el-button>
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
    <!-- 修改昵称对话框 -->
        <el-dialog v-model="centerDialogVisible" title="修改昵称" width="300" align-center>
          <el-input v-model="newNickName" style="width: 270px" maxlength="10" placeholder="请输入要修改的昵称" show-word-limit
            type="text" />
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="centerDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="editNickName">确定</el-button>
            </div>
          </template>
        </el-dialog>
  </div>
  
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import router from '@/router';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus'

interface RankingsData {
  records: Array<{
    nickName: string;
    totalCount: string;
    averageSpeed: string;
  }>;
  total: number;
}
// 用户数据
interface UserData {
  openid: string
  sid: string
  avgSpeed: string
  sum: string
  mcount: string
  isPass: string
  nickName: string
}
const rankingsData = ref<RankingsData>({
  records: [],
  total: 0,
});
const pageNo = ref<number>(1);
const pageSize = ref<number>(10);
const userData = ref<UserData>({
  openid: '',
  sid: '',
  avgSpeed: '',
  sum: '',
  mcount: '',
  isPass: '',
  nickName: ''
});
const route = useRoute()
const newNickName = ref('');
// 修改昵称对话框
const centerDialogVisible = ref(false)

// 获取 URL 查询参数中的 uid
const getUidFromURL = () => {
  return route.query['uid'] == null ? '' : route.query['uid'].toString()
};
// 获取 URL 查询参数中的 sign
const getSignFromURL = () => {
  return route.query['sign'] == null ? '' : route.query['sign'].toString()
}
const formData = new FormData();
formData.append('uid', getUidFromURL());
formData.append('sign', getSignFromURL());
// 打开修改用户昵称对话框
const edit = () => {
  console.log("Edit button clicked"); // 添加这行
  centerDialogVisible.value = true
}
// 修改用户昵称
const editNickName = async () => {
  const formData = new FormData();
  formData.append('uid', getUidFromURL());
  formData.append('sign', getSignFromURL());
  formData.append('nickname', newNickName.value);
  try {
    const response = await axios.post(`http://coaixy.bluedog233.cn/front/change_nickname`, formData);
    if (response.data.code === 200) {
      ElMessage({ message: '昵称修改成功', type: 'success' });
      await getUserInfo();
      await fetchRankings();
      newNickName.value = '';
    } else {
      ElMessage.error('昵称修改失败');
    }
  } catch (error) {
    ElMessage.error('系统异常，请稍后再试~');
  } finally {
    centerDialogVisible.value = false
  }
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
  const timestamp = new Date().getTime();
  try {
    const response = await axios.get(`http://coaixy.bluedog233.cn/front/rankings?ts=${timestamp}`, {
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
// 获取用户数据
const getUserInfo = async () => {
  try {
    const response = await axios.post(`http://coaixy.bluedog233.cn/front/get_info`, formData);
    userData.value.nickName = response.data.data.nickName;
  } catch (error) {
    console.error("错误:", error);
  }
}
onMounted(() => {
  fetchRankings();
  getUserInfo();
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
