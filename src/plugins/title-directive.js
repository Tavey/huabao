import Vue from "vue";

export default () => {
    const titleDirctiveFunc = (el, binding) => {
        let len = Number(binding.arg);
        let val = binding.value;
        let inner;

        if (!val) {
            let defaultStr = el.dataset.default;
            console.log(defaultStr);
            el.innerHTML = defaultStr ? defaultStr : "暂无";
            return;
        }

        if (val.length > len) {
            inner = [].slice.call(val, 0, len + 1).join("") + "...";
            el.setAttribute("title", val);
        } else {
            inner = val;
        }

        el.innerHTML = inner;
    };

    Vue.directive("title", {
        bind: titleDirctiveFunc,
        update: titleDirctiveFunc
    });
};
