export default {
  install(Vue, pluginOptions = {}) {
    Vue.directive('tableLoadMore', {
      bind(el, binding) {
        const selectWrap = el.querySelector(`.${binding.value.class}`);
        const handler = () => {
          let sign = 10;
          const scrollDistance = selectWrap.scrollHeight - selectWrap.scrollTop - selectWrap.clientHeight;
          if (scrollDistance <= sign) {
            binding.value.fn(scrollDistance);
          }
        };
        selectWrap.addEventListener('scroll', handler);
        el.$destroy = () => {
          selectWrap.removeEventListener('scroll', handler);
        }
      },
      unbind(el) {
        el.$destroy();
      }
    });
  }
}
