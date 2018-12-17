<template>
  <div class="page">
    <div class="container">
      <img src="../assets/error.png" alt="error">
      <div>
        <span>{{$t('server_wrong')}}</span>
        <small style="color: #999;">{{$t('repair')}}</small>
        <div>
          <el-button type="primary" icon="el-icon-refresh" size="small" @click="$router.go(-1)">{{$t('refresh')}}</el-button>
          <el-button type="text" @click="$router.go(-1)">{{$t('previous_page')}}</el-button>
        </div>
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
