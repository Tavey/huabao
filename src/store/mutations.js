import * as types from './types';

export default {
    [types.global.mutations.SET_THEME](state, theme) {
        state.theme = theme;
    },
    [types.global.mutations.SET_LOGIN_INFO](state, loginInfo) {
        if (loginInfo == null) {
            loginInfo = {};
            localStorage.removeItem('loginInfo');
        } else {
            localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
        }
        state.loginInfo = loginInfo;
    },
    [types.global.mutations.HAS_LOGGED_ON](state, loginName) {
        if (loginName != null) {
            let hasLoggedOn = localStorage.getItem('hasLoggedOn');
            if (hasLoggedOn == null) {
                hasLoggedOn = {
                    nameArr: [loginName]
                }
                localStorage.setItem('hasLoggedOn', JSON.stringify(hasLoggedOn));
            } else {
                hasLoggedOn = JSON.parse(hasLoggedOn);
                if (hasLoggedOn.nameArr.indexOf(loginName) < 0) {
                    hasLoggedOn.nameArr.push(loginName);
                    localStorage.setItem('hasLoggedOn', JSON.stringify(hasLoggedOn));
                }
            }
        }
    },
    [types.global.mutations.SET_COMPANIES](state, companies) {
        state.companies = companies;
    },
    [types.global.mutations.CHANGE_PASSWORD_STATE](state, isVisible) {
        state.isChangePasswordVisible = isVisible;
    },
    [types.global.mutations.CHANGE_COMPANY_SELECTOR_STATE](state, isVisible) {
        state.isCompanySelectorVisible = isVisible;
    },
    [types.global.mutations.SET_CURRENT_COMPANY](state, currentCompany) {
        if (currentCompany == null) {
            currentCompany = {};
            localStorage.removeItem('currentCompany');
        } else {
            localStorage.setItem('currentCompany', JSON.stringify(currentCompany));
        }
        state.currentCompany = currentCompany;
    },
    [types.global.mutations.SET_ASIDE_ACTIVE_INDEX](state, index) {
        state.asideActiveIndex = index;
    },
    [types.global.mutations.SET_HEADER_ACTIVE_INDEX](state, index) {
        state.headerActiveIndex = index;
    },
    [types.global.mutations.SET_PAGE_REFER](state, refer) {
        state.pageRefer = refer;
    },
    [types.global.mutations.SET_CLIENT_WIDTH](state, width) {
        state.clientWidth = width;
    },
    [types.global.mutations.SET_LANGUAGE](state, lan) {
        state.locale = lan;
        let loginInfo = localStorage.getItem('loginInfo');
        loginInfo = JSON.parse(loginInfo);
        if (loginInfo.settings) loginInfo.settings['language'] = lan;
        localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
    },
    [types.global.mutations.SET_LOCALE_SELECTOR_STATE](state, status) {
        state.localeSelectorStatus = status;
    },
    [types.global.mutations.SET_TIMEZONE](state, timezone) {
        state.timezone = timezone;
        let loginInfo = localStorage.getItem('loginInfo');
        loginInfo = JSON.parse(loginInfo);
        if (loginInfo.settings) loginInfo.settings['timezone'] = timezone;
        localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
    },
    [types.global.mutations.SET_MODULES](state, modules) {
        state.modules = modules;
    }
}
