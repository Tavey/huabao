<template>
    <el-container>
        <el-main v-if="routeParams">
            <component v-for="(module,name) in routeParams.widgets" :is="componentLoader('pages/Dashboard/Widgets', name)" :key="`component-${name}`" :options="module" @ready="handleComponentReady">
            </component>
        </el-main>
    </el-container>
</template>

<script>
import * as types from "@/store/types";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import CustomizedMixin from "@/mixins/customized-component";

export default {
    name: "dashboard",
    mixins: [CustomizedMixin],
    data() {
        return {
            componentCount: 1
        };
    },
    watch: {
        componentCount(val) {
            if (val === 1) this.hideLoadingInc();
        },
        routeParams(val) {
            if (val) {
                this.componentCount = Object.keys(val.widgets).length;
            }
        }
    },
    created() {
        this.importFontpack("DataService/Index");
        this.setHeaderActiveIndex("/");
        this.setAsideActiveIndex(null);
        this.showLoadingInc();
    },
    methods: {
        ...mapMutations({
            setHeaderActiveIndex:
                types.global.mutations.SET_HEADER_ACTIVE_INDEX,
            setAsideActiveIndex: types.global.mutations.SET_ASIDE_ACTIVE_INDEX
        }),
        handleComponentReady() {
            this.componentCount -= 1;
        }
    }
};
</script>

<style scoped lang="scss">
.el-container {
    height: 100%;
}

.el-main {
    display: flex;
    flex-direction: column;
    height: 100%;
}
</style>
