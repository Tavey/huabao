<template>
    <el-container>
        <el-header style="height:48px;position: relative">
            <el-menu
                id="header-menu"
                mode="horizontal"
                :default-active="headerActiveIndex"
                ref="adminMenu"
                router>
                <el-menu-item class="header-logo" index="#">
                    <template slot="title">
                        <img :src="require(`@/assets/${Theme}/logo.png`)"/>
                        <el-tag slot="title" size="small">v2.0</el-tag>
                    </template>
                </el-menu-item>
                <el-menu-item
                    v-if="isHeaderShow"
                    v-for="(module,name) in modules"
                    :index="module.url"
                    :key="module.title"
                    @click.native="handleMenuChange({key:name, url:module.url})">
                    {{$t(module.title)}}
                </el-menu-item>
            </el-menu>
            <div class="secondary-menu">
                <el-menu
                    mode="horizontal">
                    <el-menu-item class="no-sub-menu" index="#" @click.native="changeCompanySelectorState(true)">
                        <template slot="title">
                            {{$t("merchants")}}<span slot="title">{{ currentCompany.name }}</span>
                        </template>
                    </el-menu-item>
                    <el-submenu index="5">
                        <template slot="title">
                            {{$t("account")}}<span>{{ loginInfo.user ? loginInfo.user.name : '' }}</span>
                        </template>
                        <el-menu-item
                            index=""
                            style="min-width: 80px;"
                            @click.native="changePasswordState(true)">
                            {{$t("modify")}}
                        </el-menu-item>
                        <el-menu-item index="#logout" @click="logout">
                            {{$t("exit")}}
                        </el-menu-item>
                    </el-submenu>
                    <el-menu-item
                        index="8"
                        @click.native="toggleLocaleSelector(true)">
                        <img
                            :src="require('@/assets/earth.svg')"
                            width="20"
                            height="20"/>
                    </el-menu-item>
                </el-menu>
            </div>
        </el-header>
        <el-container>
            <aside-menu :data="asideMenuData"></aside-menu>
            <el-container>
                <el-main style="position:relative;">
                    <navigation>
                        <router-view></router-view>
                    </navigation>
                </el-main>
            </el-container>
        </el-container>
        <company-selector></company-selector>
        <change-password></change-password>
        <locale-selector></locale-selector>
    </el-container>
</template>

<script>
    import * as types from '@/store/types';
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';

    import AsideMenu from "@/components/AsideMenu";
    import CompanySelector from '@/components/CompanySelector';
    import ChangePassword from '@/components/ChangePassword';
    import LocaleSelector from '@/components/LocaleSelector';

    export default {
        components: {
            AsideMenu,
            CompanySelector,
            ChangePassword,
            LocaleSelector
        },
        data() {
            return {
                routeRoot: null,
                routeParams: null
            }
        },
        computed: {
            ...mapState({
                loginInfo: state => state.loginInfo,
                companies: state => state.companies,
                modules: state => state.modules,
                headerActiveIndex: state => state.headerActiveIndex,
            }),
            /**
             * 侧菜单内容
             */
            asideMenuData() {
                if (!this.routeRoot) {
                    return [];
                }
                return this.modules[this.routeRoot].children;
            },
            isHeaderShow() {
                return Object.keys(this.modules).length > 1;
            }
        },
        // watch: {
        //     '$route': {
        //         handler(to, from) {
        //             let vm = this;
        //             vm.handleRouteChange(to, from)
        //             // console.log(to.path);
        //         },
        //         immediate: true
        //     }
        // },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.handleRouteChange(to, from, next)
            });
        },
        beforeRouteUpdate(to, from, next) {
            this.handleRouteChange(to, from, next)
        },
        created() {
            let vm = this;
            vm.importFontpack('Global');
            //检查登录情况，通过后控制layout显示
            vm.getOrRecoverLoginInfo()
            /*.then(res => {

        })*/
                .catch((err) => {
                    vm.logout();
                });
            window.addEventListener("resize", vm.handleResize);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.handleResize);
        },
        methods: {
            ...mapActions({
                getOrRecoverLoginInfo: types.global.actions.GET_OR_RECOVER_LOGIN_INFO,
            }),
            ...mapMutations({
                setHeaderActiveIndex: types.global.mutations.SET_HEADER_ACTIVE_INDEX,
                setAsideActiveIndex: types.global.mutations.SET_ASIDE_ACTIVE_INDEX,
                setLoginInfo: types.global.mutations.SET_LOGIN_INFO,
                changeCompanySelectorState: types.global.mutations.CHANGE_COMPANY_SELECTOR_STATE,
                changePasswordState: types.global.mutations.CHANGE_PASSWORD_STATE,
                setPageRefer: types.global.mutations.SET_PAGE_REFER,
                setCurrentCompany: types.global.mutations.SET_CURRENT_COMPANY,
                setClientWidth: types.global.mutations.SET_CLIENT_WIDTH,
                toggleLocaleSelector: types.global.mutations.SET_LOCALE_SELECTOR_STATE
            }),
            handleRouteChange(to, from, next) {
                let vm = this;
                vm.checkUserPermissions(to).then(() => {
                    let routeChain = vm.recursiveFindModuleByRoute(to, vm.modules);
                    vm.handleMenuChange(routeChain);
                    vm.$nextTick(() => {
                        next()
                    });
                }).catch(() => {
                    vm.$router.replace(`/access-denied`);
                });
            },
            /**
             * 检查用户权限
             * 需要递归 modules
             */
            checkUserPermissions(route) {
                let vm = this;
                return new Promise((resolve, reject) => {

                    let routeChain = vm.recursiveFindModuleByRoute(route, vm.modules);
                    if (routeChain) {
                        if (vm.isActionBanned(routeChain[routeChain.length - 1].permission)) {
                            reject();
                        }
                    }
                    resolve();
                });
            },
            /**
             * 账户登出
             * 由于使用 Navigation 实现后退，导致去除登录信息后，上一个页面任然keep alive而报错
             * 所以使用 window.location.href 方式跳转
             */
            logout() {
                let vm = this;
                vm.SaaSApi.logout().then(() => {
                    vm.setLoginInfo(null);
                    vm.setCurrentCompany(null);
                    vm.$nextTick(() => {
                        window.location.href = '/login';
                    });
                })
            },
            /**
             * 全局页面宽度变化
             */
            handleResize() {
                this.setClientWidth(document.documentElement.clientWidth);
            },
            /**
             * 顶部菜单切换
             * @param routes array|null
             */
            handleMenuChange(routes) {
                if (routes && routes.length > 0) {
                    this.routeRoot = routes[0].title;
                    this.setHeaderActiveIndex(routes[0].url);
                    if (routes[1]) {
                        this.setAsideActiveIndex(routes[1].url);
                    } else {
                        this.setAsideActiveIndex(null);
                    }
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
    .secondary-menu {
        position: absolute;
        right: 0;
        top: 0;
    }
</style>
