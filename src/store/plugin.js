export const handleStore = store => {
    if (localStorage.store) store.replaceState(JSON.parse(localStorage.store))  // 初始化store
    store.subscribe((mutation, state) => {
        localStorage.setItem("store", JSON.stringify(state))
    });
    if (!store.state.timezone) {
        store.state.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    }
    if (!store.state.locale) {
        let lang = (navigator.language || navigator.userLanguage).toLowerCase();
        store.state.locale = 'zh-cn';
        if (lang != 'zh-cn') {
            store.state.locale = 'en';
        }
    }
}
