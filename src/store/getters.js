import * as types from './types';

export default {
  [types.global.getters.CURRENT_COMPANY](state) {
    let companyInfo = null;
    if ((companyInfo = localStorage.getItem('currentCompany')) != null) {
      companyInfo = JSON.parse(companyInfo);
      if (companyInfo.id) {
        state.currentCompany = companyInfo
      }
    }
    if (!state.currentCompany.id && state.loginInfo.company) {
      return state.loginInfo.company;
    }
    return state.currentCompany;
  },
  [types.global.getters.LOCALE] (state) {
      if (state.locale !== "zh-cn") {
          return "en"
      }
      return state.locale ? state.locale : "en" 
  }
}
