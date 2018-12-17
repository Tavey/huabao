<script>
import {mapState} from 'vuex';

const defaultTheme = require('!!to-string-loader!css-loader!element-ui/lib/theme-chalk/index.css');
const customCss = require('!!to-string-loader!css-loader!sass-loader!@/assets/styles/custom.scss');

const ORIGINAL_THEME = '#409EFF';

export default {
    name: 'theme-apply',
    render(h) {
        return h('div', {}, [
            h('style', {
                domProps: {
                    innerText: this.applyTheme(defaultTheme),
                }
            }),
            h('style', {
                domProps: {
                    innerText: this.applyTheme(customCss),
                }
            })
        ])
    },
    computed: {
        ...mapState({
            themeColor: 'themeColor'
        })
    },
    methods: {
        applyTheme(cssStr) {
            cssStr = cssStr.replace(/@font-face{[^}]+}/, '')
            if (!this.themeColor) return cssStr;
            return cssStr.replace(new RegExp(ORIGINAL_THEME, 'gi'), this.themeColor);  
        }
    },
}
</script>
