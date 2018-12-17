import moment from 'moment'
import 'moment-timezone';
import momentDurationFormatSetup from 'moment-duration-format';
// import 'moment/locale/zh-cn';
import Store from '@/store/index'
import * as types from '@/store/types';

export default {
    install(Vue, pluginOptions = {}) {
        let _locale = Store.getters[types.global.getters.LOCALE];
        momentDurationFormatSetup(moment);
        if (moment.tz && Store.state.timezone) {
            moment.tz.setDefault(Store.state.timezone);
        }
        if (_locale === 'zh-cn') {
            moment.updateLocale('zh-cn', {
                durationLabelsStandard: {
                    S: '毫秒',
                    SS: '毫秒',
                    s: '秒',
                    ss: '秒',
                    m: '分钟',
                    mm: '分钟',
                    h: '小时',
                    hh: '小时',
                    d: '天',
                    dd: '天',
                    w: '星期',
                    ww: '星期',
                    M: '月',
                    MM: '月',
                    y: '年',
                    yy: '年'
                },
                durationLabelsShort: {
                    S: '毫秒',
                    SS: '毫秒',
                    s: '秒',
                    ss: '秒',
                    m: '分',
                    mm: '分',
                    h: '小时',
                    hh: '小时',
                    d: '天',
                    dd: '天',
                    w: '周',
                    ww: '周',
                    M: '月',
                    MM: '月',
                    y: '年',
                    yy: '年'
                },
                durationTimeTemplates: {
                    HMS: 'h:mm:ss',
                    HM: 'h:mm',
                    MS: 'm:ss'
                },
                durationLabelTypes: [
                    {type: "standard", string: "__"},
                    {type: "short", string: "_"}
                ],
                durationPluralKey: function (token, integerValue, decimalValue) {
                    // Singular for a value of `1`, but not for `1.0`.
                    if (integerValue === 1 && decimalValue === null) {
                        return token;
                    }

                    return token + token;
                }
            });
        }
        Vue.$moment = moment;
        Vue.prototype.$moment = moment;
    }
}


