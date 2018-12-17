import Vue from "vue";
// import * as types from '@/store/types'

import i18n from "./languages/i18n";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "element-ui/lib/theme-chalk/display.css";

Vue.use(
    ElementUI
    // , {
    //   i18n: (key, value) => i18n.t(key, value)
    // }
);

// import "@fortawesome/fontawesome-pro";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-pro/css/all.css";

import Moment from "@/plugins/moment";

Vue.use(Moment);

import ValidationRules from "@/plugins/validation-rules";

Vue.use(ValidationRules);

import InfinityScroll from "@/plugins/infinity-scroll";

Vue.use(InfinityScroll);

import TitleDirective from "@/plugins/title-directive";

Vue.use(TitleDirective);

import Filters from "@/plugins/filters";

Vue.use(Filters);

import SaaSApi from "@/api/SaaSApi";

Vue.use(SaaSApi);

import GlobalMixin from "@/mixins/global";

Vue.mixin(GlobalMixin);

import "@/utils/array";

import "leaflet";
import HBMAP from "@huabao/map";
import "leaflet/dist/leaflet.css";

Vue.use(HBMAP, {
    prefix: i18n.t("mapPrefix")
});

Vue.config.productionTip = false;
import router from "./router";
import store from "./store/index";

import Navigation from "vue-navigation";

Vue.use(Navigation, { router });

import App from "./App";
/* eslint-disable no-new */

new Vue({
    el: "#app",
    router,
    store,
    i18n,
    template: "<App/>",
    components: { App }
});
