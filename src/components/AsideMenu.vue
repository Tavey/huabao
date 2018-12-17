<template>
    <el-aside class="aside-container" :style="{width: isAsideCollapsed ? '65px':'168px'}">
        <el-menu id="aside-menu" router :collapse="isAsideCollapsed" :default-active="asideActiveIndex"
                 :default-openeds="defaultOpeneds">
            <el-button type="text" class="gray-bg" v-if="Theme !== 'zgc'" @click="toggleCollapseAside"
                       style="padding: 5px 15px;">
                <i :class="{
                    'fal':true,
                    'fa-fw':true,
                    'fa-2x':true,
                    'fa-angle-double-right':isAsideCollapsed,
                    'fa-angle-double-left':!isAsideCollapsed
                }"></i>
            </el-button>
            <el-submenu v-for="(parent,i) in data" :index="i.toString()" :key="`submenu_${i}`"
                        :class="{'is-opened': !isAsideCollapsed }">
                <template slot="title">
                    <i :class="`fal ${parent.icon} fa-2x fa-fw`" v-if="parent.icon"></i>
                    <span slot="title">{{ $t(parent.title) }}</span>
                </template>
                <el-tooltip :disabled="child.permission == null || !isActionBanned(child.permission)"
                            :content="inputLocal('accessDenied')" placement="bottom" effect="light"
                            v-for="(child,j) in parent.children" :key="`submenu_child_${j}`">
                    <el-menu-item v-if="(!child.rootOnly || (child.rootOnly && loginInfo.company.id == 100100)) && !(isCompanyLevelLowest && child.url == '/console/companies')" :index="child.permission != null && isActionBanned(child.permission) ? '#' : child.url">
                        <i :class="`fal ${child.icon} fa-lg fa-fw`" v-if="child.icon"></i>
                        {{ $t(child.title) }}
                    </el-menu-item>
                </el-tooltip>
            </el-submenu>
        </el-menu>
    </el-aside>
</template>

<script>
    import * as types from "@/store/types";
    import {mapState, mapGetters, mapActions, mapMutations} from "vuex";

    export default {
        name: "aside-menu",
        props: {
            data: {
                require: true,
                type: Array
            }
        },
        data() {
            return {
                isAsideCollapsed: false
            };
        },
        created() {
            this.importFontpack("Sidebar");
        },
        computed: {
            ...mapState({
                loginInfo: state => state.loginInfo,
                asideActiveIndex: state => state.asideActiveIndex
            }),
            defaultOpeneds() {
                return this.data.map((v, i) => i.toString());
            }
        },
        // watch: {
        //     $route(val) {
        //         this.init(this.$route);
        //     }
        // },
        // created() {
        //     this.init(this.$route);
        // },
        // updated() {
        //     this.init(this.$route);
        // },
        methods: {
            // ...mapMutations({
            //     setAsideActiveIndex: types.global.mutations.SET_ASIDE_ACTIVE_INDEX
            // }),
            // init(route) {
            //     this.setAsideActiveIndex(route.meta.activeAside || route.path);
            // },
            toggleCollapseAside() {
                this.isAsideCollapsed = !this.isAsideCollapsed;
            }
        }
    };
</script>


<style scoped>
    .gray-bg {
        background-color: #efefef;
        width: 100%;
        display: flex;
        align-items: start;
    }

    .aside-container {
        overflow: inherit;
    }
</style>
