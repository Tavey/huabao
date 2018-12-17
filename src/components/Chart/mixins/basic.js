import _ from 'lodash';
import * as d3 from "d3";

const DEFAULT_SERIES_OPTION = {
    name: '',
    key: '',
    isColorGradient: false,
    color: '',
    isShowMaxLabel: false,
    isShowAvgLine: false,
    isArea: false
};

const DEFAULT_GLOBAL_OPTION = {
    width: '100%',
    height: '300px',
    margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    xAxis: {
        key: '',
        color: '#000',
        fontSize: '1em',
        isDatetime: false,
    },
    yAxis: {
        min: null,
        title: '',
        color: '#000',
        fontSize: '1em',
        titleFontSize: '1em',
        // isDatetime: false,
    },
    tooltip: {
        show: true,
        backgroundColor: '',
        fontSize: '',
        color: ''
    },
    series: [],
    datetimeInputFormat: '',
    datetimeOutputFormat: '',
};

export default {
    props: {
        source: {
            required: true,
            type: Array
        },
        options: {
            required: true,
            type: Object,
            default: DEFAULT_GLOBAL_OPTION
        }
    },
    data() {
        return {
            privateSource: [],
            privateOptions: null,
            container: null,
            svg: null,
        }
    },
    computed: {
        containerBoundingClientRect() {
            if (!this.container) {
                return {};
            }
            return this.container.node().getBoundingClientRect();
        },
        innerWidth() {
            return this.containerBoundingClientRect.width - this.privateOptions.margin.left - this.privateOptions.margin.right;
        },
        innerHeight() {
            return this.containerBoundingClientRect.height - this.privateOptions.margin.top - this.privateOptions.margin.bottom;
        },
        datetimeParser() {
            return d3.utcParse(this.privateOptions.datetimeInputFormat);
        },
        datetimeFormatter() {
            return d3.timeFormat(this.privateOptions.datetimeOutputFormat);
        },
        minYItems() {
            return _.map(this.privateOptions.series, v => _.minBy(this.privateSource, v.key)[v.key]);
        },
        maxYItems() {
            return _.map(this.privateOptions.series, v => _.maxBy(this.privateSource, v.key)[v.key]);
        },
        bisectX() {
            return d3.bisector(d => d[this.privateOptions.xAxis.key]).left;
        }
    },
    created() {
        this.privateOptions = _.assign({}, DEFAULT_GLOBAL_OPTION, this.options);
        this.privateOptions.series.forEach((v, i, a) => {
            a[i] = _.assign({}, DEFAULT_SERIES_OPTION, v);
        });

        if (this.source.length > 0) {
            if (this.privateOptions.xAxis.isDatetime) {
                this.privateSource = _.cloneDeep(this.source).map(v => {
                    let key = this.privateOptions.xAxis.key;
                    v[key] = this.datetimeParser(v[key]);
                    return v;
                });
            } else {
                this.privateSource = _.cloneDeep(this.source);
            }
        }
    },
    mounted() {
        this.container = d3.select(this.$el);
        this.svg = this.createSvgContainer();
    },
    beforeDestroy() {
        this.$el.remove();
    },
    methods: {
        createSvgContainer() {
            return this.container.append("svg:svg")
                .attr("width", this.privateOptions.width)
                .attr("height", this.privateOptions.height)
                .append("svg:g")
                .attr("transform", `translate(${this.privateOptions.margin.left},${this.privateOptions.margin.top})`)
        }
    }
}
