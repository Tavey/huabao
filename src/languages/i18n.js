import Vue from "vue";
import VueI18n from "vue-i18n";
import enLocale from "element-ui/lib/locale/lang/en";
import zhLocale from "element-ui/lib/locale/lang/zh-CN";
import globalzh from "./Global/zh-cn.json";
import ErrorMsg from "./ErrorMsg.json";
import Store from "@/store/index";
import * as types from "@/store/types";

Vue.use(VueI18n);
export default new VueI18n({
    locale: Store.getters[types.global.getters.LOCALE],
    messages: {
        en: {
            ...enLocale,
            mapPrefix: "Huabao GIS"
        },
        "zh-cn": {
            ...zhLocale,
            ...globalzh,
            ...ErrorMsg,
            mapPrefix: "华保地理信息服务"
        }
    }
});
