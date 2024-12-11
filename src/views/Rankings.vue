<template>
  <div class="common-layout">
    <el-container style="height: 100vh;">
      <el-header class="common-header">
        <div class="header-title" style="text-align: center">
          <el-text tag="b" size="large">排行榜TOP10</el-text>
        </div>
        <el-divider class="common-divider"/>

      </el-header>
      <el-main class="common-main">
        <div class="main-header">
          <el-text size="large">
            <el-icon>
              <Avatar/>
            </el-icon>
            您的昵称：{{ userData.nickName }}
          </el-text>
          <el-divider direction="vertical"/>
          <el-button type="primary" @click="edit" link>修改昵称</el-button>
          <br>
         <el-text size="large">
           <el-icon>
             <GoldMedal/>
           </el-icon>
           您当前的排名：{{ rank }}
         </el-text>
        </div>
        <!-- 表格 -->
        <div class="table-container">
          <el-table
              :data="rankingsData.records"
              :row-class-name="tableRowClassName"
              v-loading="loading"
              element-loading-text="数据加载中..."
          >
            <el-table-column label="排名" type="index" align="center" width="80" fixed/>
            <el-table-column prop="nickName" label="昵称" align="center" fixed/>
            <el-table-column prop="totalCount" label="总次数" align="center"/>
            <el-table-column prop="averageSpeed" label="平均速度" align="center"/>
          </el-table>
          <el-text>注意：排名仅适用于已绑定用户</el-text>
        </div>

      </el-main>
      <el-footer class="common-footer">

        <el-button type="primary" plain @click="goHome">我的数据</el-button>
        <el-button type="primary" plain @click="goToday">今日数据</el-button>
        <el-button type="primary" plain @click="goBind">重新绑定</el-button>
        <br>
        <el-text size="small">金职学创 © 2024</el-text>
      </el-footer>
    </el-container>

    <!-- 修改昵称对话框 -->
    <el-dialog v-model="centerDialogVisible" title="修改昵称" width="300" align-center>
      <el-input v-model="newNickName" style="width: 270px" maxlength="10" placeholder="请输入要修改的昵称"
                show-word-limit type="text"/>
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
import {ref, onMounted} from 'vue';
import axios from 'axios';
import router from '@/router';
import {useRoute} from 'vue-router';
import {ElMessage} from 'element-plus'

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
const rank = ref<number>(0)
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
    const response = await axios.post(`http://yuedong.diviner.fun/front/change_nickname`, formData);
    if (response.data.code === 200) {
      ElMessage({message: '昵称修改成功', type: 'success'});
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


const getUserRank = async () => {
  try {
    const timestamp = new Date().getTime();
    const response = await axios.get(`http://yuedong.diviner.fun/front/rank_index?ts=${timestamp}`, {
      params: {
        uid: getUidFromURL(),
        sign: getSignFromURL()
      }
    });
    rank.value = response.data.data
    console.log('用户排名:', response.data.data);
  } catch (error) {
    console.error('获取用户排名失败', error);
  }
}

const fetchRankings = async (page: number = 1) => {
  pageNo.value = page;
  const timestamp = new Date().getTime();
  try {
    const response = await axios.get(`http://yuedong.diviner.fun/front/rankings?ts=${timestamp}`, {
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
    const response = await axios.post(`http://yuedong.diviner.fun/front/get_info`, formData);
    userData.value.nickName = response.data.data.nickName;
  } catch (error) {
    console.error("错误:", error);
  }
};
const tableRowClassName = ({
                             row,
                             rowIndex,
                           }: {
  row: RankingsData['records']
  rowIndex: number
}) => {
  console.log('row:', rowIndex);
  if (rowIndex == 0) {
    return 'success-row'
  } else if (rowIndex === 1) {
    return 'warning-row'
  } else if (rowIndex === 2) {
    return 'info-row'
  }
  return ''
};
onMounted(() => {
  fetchRankings();
  getUserInfo();
  getUserRank();
});
</script>

<style>
.common-layout {
  height: 100vh;
}

.common-header {
  margin-top: 10px;
  padding: 0px;
}

.common-main {
  flex-grow: 1; /* 主区域占满剩余空间 */
}

.common-footer {
  text-align: center;
  margin-top: auto; /* 确保 footer 固定在最下面 */
}

.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.el-table .info-row {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
</style>
