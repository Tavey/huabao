export default {
    install(Vue, pluginOptions = {}) {
        Vue.filter('defaults', function (value, defaultValue) {
            return value ? value : defaultValue;
        });
        Vue.filter('formatDateTime', function (value, formatString) {
            if (!value) return value;
            formatString = formatString || 'YYYY-MM-DD HH:mm:ss';
            return Vue.$moment(value).format(formatString);
        });
        Vue.filter('formatDuration', function (value, formatString) {
            if (!value)  value = 0;
            formatString = formatString || "hh_mm_ss_";
            return Vue.$moment.duration(value, 'seconds').format(formatString, {
                trim: false
            });
        });
    }
}


