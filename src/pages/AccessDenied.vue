<template>
  <div class="page">
    <div class="container">
      <img src="../assets/access_denied.png" alt="access_denied">
      <div>
        <span>{{$t('without_permission')}}</span>
        <small style="color: #999;">{{$t('administrator')}}</small>
        <div>
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
