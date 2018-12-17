<template>
    <div class="breadcrumb">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item v-for="(val,index) in list" :key="index" :to="val.url"
                                @click.native="$router.push({path:val.url})">
                <i v-if="val.icon" :class="['fal',val.icon,'fa-fw']"></i>
                {{$t(val.title)}}
            </el-breadcrumb-item>
        </el-breadcrumb>
    </div>
</template>

<script>
    import * as types from '@/store/types';
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';

    export default {
        name: "breadcrumb",
        components: {},
        // props: {
        //     data: {
        //         require: false,
        //         type: Array,
        //         default: () => []
        //     }
        // },
        data() {
            return {
                list: []
            };
        },
        computed: {
            ...mapState({
                pageRefer: state => state.pageRefer,
                modules: state => state.modules,
            })
        },
        created() {
            this.importFontpack('Components/Breadcrumb');
            this.init();
        },
        // mounted() {
        // },
        // watch: {
        //     data(val) {
        //         this.init();
        //     }
        // },
        methods: {
            init() {
                let vm = this;
                let routeChain = vm.recursiveFindModuleByRoute(vm.$route, vm.modules);
                if (routeChain && routeChain.length > 0) {
                    routeChain.shift();
                    for (let i in routeChain) {
                        for (let j in vm.$route.params) {
                            if (routeChain[i].url) {
                                routeChain[i].url = routeChain[i].url.replace(`:${j}`, vm.$route.params[j]);
                            }
                        }
                    }
                    vm.list = routeChain;
                }
            }
            // init() {
            //     let vm = this;
            //     vm.list = [];
            //     if (vm.data.length == 0) {
            //         let mid = vm.$route.matched.filter(v => {
            //             return v.path != ''
            //                 && !v.regex.test(vm.$route.path)
            //         });
            //         for (let i = 0; i < mid.length; i++) {
            //             vm.checkRouteAndAdd(mid[i].path);
            //         }
            //         if (vm.$route.meta.activeAside) {
            //
            //             vm.checkRouteAndAdd(vm.$route.meta.activeAside);
            //         }
            //     } else {
            //         for (let i = 0; i < vm.data.length; i++) {
            //             vm.checkRouteAndAdd(vm.data[i]);
            //         }
            //     }
            //     vm.list.push({
            //         text: vm.inputLocal(vm.$route.meta.languageTag)
            //     })
            // },
            // checkRouteAndAdd(path) {
            //     let vm = this;
            //     let resolve = vm.$router.resolve(path);
            //     if (vm.$router.resolve(path), resolve.route.meta.pageName) {
            //         vm.list.push({
            //             text: vm.inputLocal(resolve.route.meta.languageTag),
            //             url: resolve.route.fullPath
            //         })
            //     }
            // }
        }
    };
</script>

<style scoped lang="scss">
    .breadcrumb {
        height: 35px;
        line-height: 35px;
        font-size: 14px;

        .el-breadcrumb {
            line-height: 35px;
        }
    }
</style>
