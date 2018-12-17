import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import {handleStore} from './plugin'

Vue.use(Vuex)


const state = {
    theme: 'default',
    locale: null,
    timezone: null,
    loginInfo: {
        company: {
            id: '',
            name: ''
        },
        user: {
            name: ''
        }
    },
    currentCompany: {},
    companies: [],
    isCompanySelectorVisible: false,
    isChangePasswordVisible: false,
    localeSelectorStatus: false,
    headerActiveIndex: '',
    asideActiveIndex: '',
    pageRefer: '',
    clientWidth: 0,
    themeColor: '',
    modules: {}
};


const Store = new Vuex.Store({
    state,
    getters,
    actions,
    mutations,
    plugins: [
        handleStore     //在这里设置一些默认值
    ]
});


export default Store
