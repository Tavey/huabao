import {ucfirst} from "@/utils/util";
import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';

export default {
    // props: {
    //     routeParams: {
    //         type: Object,
    //         default: null
    //     }
    // },
    data() {
        return {
            routeParams: null
        }
    },
    computed: {
        ...mapState({
            modules: state => state.modules,
        }),
    },
    created() {
        let vm = this;
        let routeChain = vm.recursiveFindModuleByRoute(vm.$route, vm.modules);
        //当前模块配置，向下传递
        let currentModule = routeChain[routeChain.length - 1];
        if (currentModule.params) {
            vm.routeParams = currentModule.params;
        }
    },
    methods: {
        /**
         * 页面列表是否存在按钮
         * @param name
         * @return boolean
         */
        hasFeature(name) {
            if (!this.routeParams || !this.routeParams['features']) return true;
            let features = this.routeParams['features'];

            return Object.prototype.toString.call(features) === '[object Array]' ?
                features.indexOf(name) >= 0 :
                features[name];
        },
        componentLoader(path, name) {
            let componentName = ucfirst(name);
            return require(`@/${path}/${componentName}.vue`).default;
        },
    }
}
