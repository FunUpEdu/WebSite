<script lang="ts" setup>
import { StarFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import router from '@/router';

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
  openid: string
  sid: string
  avgSpeed: string
  sum: string
  mcount: string
  isPass: string
  nickName: string
}
// 修改昵称对话框
const centerDialogVisible = ref(false)
// 列表加载效果
const Loading = ref(true);
// 开关
const isPush = ref(false);
// 开关
const newNickName = ref('');
// 开关禁用状态
const isPushDisabled = ref(false);
// 开关加载效果
const switchLoading = ref(false);
const tableData = ref<RunData[]>([]);
const userData = ref<UserData>({
  openid: '',
  sid: '',
  avgSpeed: '',
  sum: '',
  mcount: '',
  isPass: '',
  nickName: ''
});

onMounted(() => {
  getData();
  getUserInfo();
})

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
const goRankings = () => {
  router.push(`/rank?uid=${uid}&sign=${sign}`)
};
const formData = new FormData();
formData.append('uid', getUidFromURL());
formData.append('sign', getSignFromURL());

const getData = async () => {
  try {
    Loading.value = true;
    userData.value.openid = getUidFromURL();
    // 校验sign
    const verifyFlag = await axios.post(`http://coaixy.bluedog233.cn/front/verify_sign`, formData).then(res => {
      console.log('Response:', res)
      if (res.data.data !== true) {
        ElMessage.error('sign校验失败');
        return;
      }
    })
    const response = await axios.post(`http://coaixy.bluedog233.cn/front/get_all_data`, formData).then(res => {
      tableData.value = res.data.data.runnerDataList;
      tableData.value.sort((a, b) => {
        // 假设 a.runnerTime 和 b.runnerTime 是日期字符串
        const timestampA = new Date(a.runnerTime.replace(/年|月|日/g, '-')).getTime();
        const timestampB = new Date(b.runnerTime.replace(/年|月|日/g, '-')).getTime();
        return timestampB - timestampA; // 降序
      });
      tableData.value.reverse();
      calculateData(res.data.data.runnerDataList);
      ElMessage({ message: '数据获取成功', type: 'success' });
    })
  } catch (error) {
    ElMessage.error('数据获取失败~');
  } finally {
    Loading.value = false;
  }
}
// 统计数据
const calculateData = (data: RunData[]) => {
  const sum = data.filter(item => item.ok === '✔').length;
  userData.value.sum = sum.toString();

  let totalSpeed = 0;
  data.forEach(item => {
    totalSpeed += parseFloat(item.runnerSpeed);
  });
  const avgSpeed = totalSpeed / data.length;
  userData.value.avgSpeed = avgSpeed.toFixed(3);

  const morningCount = data.filter(item => item.runnerPeriod === '上午' && item.ok === '✔').length;
  userData.value.mcount = morningCount.toString();

  userData.value.isPass = sum >= 28 && morningCount >= 7 ? '合格' : '不合格';
};

// 获取用户数据
const getUserInfo = async () => {
  try {
    const response = await axios.post(`http://coaixy.bluedog233.cn/front/get_info`, formData);
    const status = response.data.data.isPush;
    isPush.value = status === "1";
    userData.value.sid = response.data.data.username
    userData.value.nickName = response.data.data.nickName;
  } catch (error) {
    console.error("错误:", error);
  }
}

// 打开修改用户昵称对话框
const edit = () => {
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
// 表格row样式
const tableRowClassName = ({ row }: { row: RunData }) => {
  return row.ok === '❌' ? 'warning-row' : 'success-row';
}
const togglePush = async () => {
  try {
    let isPushValue = isPush.value ? '1' : '0';
    const formData = new FormData();
    formData.append('uid', getUidFromURL());
    formData.append('sign', getSignFromURL());
    formData.append('isPush', isPushValue);
    switchLoading.value = true;
    // 调用修改推送状态的接口
    const response = await axios.post(`http://coaixy.bluedog233.cn/front/change_push`, formData);
    if (response.data.code === 200) {
      ElMessage({ message: '推送状态修改成功', type: 'success' });
      await getUserInfo(); // 刷新用户信息
    } else {
      ElMessage.error('操作失败，请重试');
    }
  } catch (error) {
    ElMessage.error('系统异常~');
  } finally {
    switchLoading.value = false;
  }
}
</script>
<template>
  <div class="common-layout">
    <el-container style="height: 100vh;">
      <el-header class="common-header">
        <div class="header-title" style="text-align: center;">全部数据</div>
      </el-header>
      <el-main class="common-main">
        <div class="main-header">
          <el-text size="large">
            <el-icon>
              <Avatar />
            </el-icon>
            昵称：{{ userData.nickName }}
          </el-text>
          <el-divider direction="vertical" />
          <el-button type="primary" @click="edit" link>修改</el-button>
          <br />
          <el-text size="large">
            <el-icon>
              <Management />
            </el-icon>
            学号：{{ userData.sid }}
          </el-text>
          <br />
          <el-text size="large">
            <el-icon>
              <Flag />
            </el-icon>
            有效次数：{{ userData.sum }}
          </el-text>
          <el-divider direction="vertical" />
          <el-text size="large">
            <el-icon>
              <StarFilled />
            </el-icon>
            上午次数：{{ userData.mcount }}
          </el-text>
          <br />
          <el-text size="large">
            <el-icon>
              <QuestionFilled />
            </el-icon>
            是否合格：{{ userData.isPass }}
          </el-text>
          <br />
          <el-text size="large">
            <el-icon>
              <BellFilled />
            </el-icon>
            自动推送：
            <el-switch v-model="isPush" size="small" :loading="switchLoading" :disabled="isPushDisabled"
              @change="togglePush" />
          </el-text>
          <el-divider direction="vertical" />
          <el-button type="primary" @click="goRankings" link>查看排行榜</el-button>
          <br />
          <el-text>注意：有效次数大于28次为合格</el-text>
          <el-divider class="common-divider" />
        </div>
        <!-- 表格 -->
        <div class="table-container">
          <el-table class="main-table" v-loading="Loading" element-loading-text="数据加载中..." :data="tableData"
            style="width: 100%" :row-class-name="tableRowClassName">
            <el-table-column prop="runnerTime" label="日期" width="140" />
            <el-table-column prop="runnerPeriod" label="时段" width="60" />
            <el-table-column prop="ok" label="是否有效" align="center" />
            <el-table-column prop="runnerMileage" label="里程" />
            <el-table-column prop="runnerSpeed" label="速度" />
          </el-table>
        </div>
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
        <el-divider class="common-divider" />
      </el-main>
      <el-footer class="common-footer" style="text-align: center;">
        <el-text size="small">悦动金职 © 2024</el-text>
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.header-title {
  font-size: 25px;
  font-weight: bold;
}

.common-header {
  margin-top: 20px;
}

.common-divider {
  margin: 5px;
}

.common-main {
  padding-top: 0px;
  padding-bottom: 0px;
  display: flex;
  flex-direction: column;
}

.main-header {
  margin-bottom: 10px;
  /* 增加主头部与表格的间距 */
}

.table-container {
  flex-grow: 1;
  /* 表格区域占满剩余空间 */
  overflow-y: auto;
  /* 允许表格区域滚动 */
  max-height: calc(100vh - 150px);
  /* 设置最大高度，确保表格区域足够大 */
}

.main-table {
  box-shadow: 0 0 10px #ccc;
  opacity: 0.9;
  border-radius: 10px;
}

.common-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: linear-gradient(-225deg, #E3FDF5, #FFE6FA 100%);
  /* 背景色 */
}

.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>
