<template>
    <el-popover
    :trigger="triggerType"
    :placement="placementType"
    v-model="openPopover">
        <slot name="internal-content"></slot>
        <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="closeDelete">取消</el-button>
            <el-button type="primary" size="mini" @click="deletes">确定</el-button>
        </div>
        <div slot="reference" class="name-wrapper">
            <el-button type="text"   style="margin-left:10px" plain size="mini" >删除</el-button>
        </div>
    </el-popover>
</template>

<script>
export default {
  name: "hb-popover",
  components: {},
  data() {
    return {
      openPopover: false
    };
  },
  props: {
    triggerType: {
      type: String,
      required: false,
      default: "click"
    },
    placementType: {
      type: String,
      required: false,
      default: "top"
    }
  },
  computed: {},
  mounted() {},
  methods: {
    closeDelete() {
      let vm = this;
      vm.openPopover = false;
    },
    deletes(row, index) {
      this.$emit("popover-Delete", row, index);
    }
  }
};
</script>

<style scoped lang="scss">

</style>
