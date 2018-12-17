import _ from 'lodash';
import {ACTIONS} from "@/consts";
import * as types from "@/store/types";
import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';

export default {
    data() {
        return {
            RoleActions: ACTIONS,
            LoadingInstance: null,
        }
    },
    computed: {
        ...mapState({
            Theme: state => state.theme
        }),
        ...mapGetters({
            currentCompany: types.global.getters.CURRENT_COMPANY,
            locale: types.global.getters.LOCALE,
        }),
        isCompanyLevelLowest() {
            return this.currentCompany.level >= 3;
        }
    },
    methods: {
        ...mapActions({
            $$setGlobalLocale: types.global.actions.SET_LANGUAGE
        }),
        /**
         * 引入语言包
         * @param path
         */
        importFontpack(path) {
            let _nowMsg = require(`@/languages/${path}/${this.locale}.json`);
            this.$i18n.mergeLocaleMessage(this.locale, _nowMsg);
        },
        /**
         * 文字 i18n
         * @param val
         * @returns {*|void}
         */
        inputLocal(val) {
            return this.$t(val);
        },
        /**
         * 访问是否被禁止
         * @param actionName string
         * @returns {boolean}
         */
        isActionBanned(actionName) {
            return this.$store.state.loginInfo.banned_actions && this.$store.state.loginInfo.banned_actions.indexOf(actionName) >= 0;
        },
        /**
         * 显示 Loading
         */
        showLoadingInc() {
            this.LoadingInstance = this.$loading();
        },
        /**
         * 隐藏 Loading
         */
        hideLoadingInc() {
            this.$nextTick(() => {
                if (this.LoadingInstance) {
                    this.LoadingInstance.close();
                    this.LoadingInstance = null
                }
            });
        },
        /**
         * 递归查找路由链
         * @param route object
         * @param modules array
         */
        recursiveFindModuleByRoute(route, modules) {
            let result = null;
            let matchRegex = route.matched[route.matched.length - 1].regex;
            for (let key in modules) {
                let children = modules[key].children;
                if (matchRegex.test(modules[key].url)) {
                    return [_.cloneDeep(modules[key])];
                } else {
                    if (children) {
                        result = this.recursiveFindModuleByRoute(route, modules[key].children);
                        if (result) {
                            if (modules[key].url) {
                                return [
                                    _.cloneDeep(modules[key]),
                                    ...result
                                ];
                            } else {
                                return result;
                            }
                        }
                    }
                }
            }
            return null;
        },
    }
}
