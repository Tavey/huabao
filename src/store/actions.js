import * as types from './types';
import moment from 'moment';
import i18n from '@/languages/i18n'
import globalVue from '@/main'

export default {
    [types.global.actions.GET_OR_RECOVER_LOGIN_INFO]({state, commit}) {
        return new Promise(function (resolve, reject) {
            if (!state.loginInfo.token) {
                let loginInfo = null;
                if ((loginInfo = localStorage.getItem('loginInfo')) == null) {
                    reject(new Error());
                }
                loginInfo = JSON.parse(loginInfo);
                if (moment(loginInfo.token.token_expired_at).isSameOrBefore(moment())) {
                    commit(types.global.mutations.SET_LOGIN_INFO, null);
                    reject(new Error());
                }
                commit(types.global.mutations.SET_LOGIN_INFO, loginInfo);
            }
            resolve(state.loginInfo);
        })
    },
    [types.global.actions.SET_LANGUAGE]({commit}, {url, payload}) {
        commit(types.global.mutations.SET_LANGUAGE, payload);
        if (url) {
            window.location.href = url
        } else {
            window.location.reload()
        }
    },
    [types.global.actions.SET_TIMEZONE]({commit}, timezone) {
        commit(types.global.mutations.SET_TIMEZONE, timezone);
    },
}
