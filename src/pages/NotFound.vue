<template>
  <div class="page">
    <div class="container">
      <img src="../assets/empty.png" alt="not_found">
      <div class="not-found">
        <span>{{$t('data_loss')}}</span>
        <small style="color: #999;" >{{$t('return')}}</small>
        <el-button type="text" @click="$router.go(-1)">
         <i class="back-btn">{{$t('previous_page')}}</i>
         </el-button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    created() {
      this.importFontpack('Public/Collection');
    },
  }
  
</script>

<style scoped lang="scss">
  .page {
    display: flex;
    flex: 1;
    flex-direction: column;
    background-color: white !important;
    height: 100%;
  }
  .not-found {
    margin-left: 20px;
    font-size: 16px;
    small:first-of-type {
      margin: 10px 0;
    }
    .back-btn {
      font-size: 16px;
      text-decoration: underline;
      font-style: normal;
    }
  }
  .container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex: 1;
    & > div {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
    }
    img {
      margin-right: 20px;
    }
  }

</style>
