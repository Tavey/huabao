import {mapState, mapGetters, mapActions, mapMutations} from "vuex";
import echarts from 'echarts';

export default {
    data() {
        return {
            chartEntities: [],
            fastResizeHandle: [],
            defaultTheme: {
                title: {
                    textStyle: {
                        fontWeight: "normal",
                        fontSize: 14
                    }
                },
                textStyle: {
                    color: "#9aa2b3"
                },
                color: ["#0077ff", "#66adff", "#b2d6ff",],
                yAxis: {
                    splitLine: {
                        lineStyle: {
                            color: "#ebeff7",
                        },
                    },
                    axisLine: {
                        lineStyle: {
                            color: "#ebeff7"
                        }
                    }
                },
                xAxis: {
                    axisLine: {
                        lineStyle: {
                            color: "#ebeff7",
                        },
                    }
                }
            }
        }
    },
    computed: {
        ...mapState({
            clientWidth: state => state.clientWidth,
        })
    },
    watch: {
        clientWidth(val) {
            let vm = this;
            vm.clearFastResizeHandle();
            vm.chartEntities.forEach(v => {
                let handle = setTimeout(() => {
                    v.resize()
                }, 200);
                vm.fastResizeHandle.push(handle);
            });
        }
    },
    created() {
        echarts.registerTheme('huabao', this.defaultTheme);
    },
    beforeDestroy() {
        let vm = this;
        vm.chartEntities.forEach(v => v.dispose());
        vm.chartEntities = [];
    },
    methods: {
        clearFastResizeHandle() {
            let vm = this;
            vm.fastResizeHandle.forEach(v => {
                clearTimeout(v);
            });
        },
        createChartFromDom(ref) {
            let vm = this;
            if (!ref) {
                return null;
            }
            let chart = echarts.init(ref, 'huabao');
            vm.chartEntities.push(chart);
            return chart;
        },
        createChartFromDomId(domId) {
            return this.createChartFromDom(document.getElementById(domId));
        }
    }
}
