<template>
    <el-row id="charts" type="flex" justify="space-between" class="chart-row">
        <el-col v-if="hasItem('status')">
            <div id="chart-status" class="chart-container"></div>
        </el-col>
        <el-col v-if="hasItem('distance')">
            <div id="chart-distance" class="chart-container"></div>
        </el-col>
        <el-col v-if="hasItem('time')">
            <div id="chart-time" class="chart-container"></div>
        </el-col>
    </el-row>
</template>

<script>
    import _ from 'lodash';
    import ChartMixin from '@/mixins/chart-component';

    export default {
        name: "dashboard-charts",
        mixins: [ChartMixin],
        props: {
            options: {
                type: Array
            },
        },
        data() {
            return {
                chartsData: {},
            }
        },
        mounted() {
            this.renderCharts();
        },
        methods: {
            renderChartBar() {
                let vm = this;
                let chart = vm.createChartFromDomId('chart-status');
                let option = {
                    title: {
                        text: vm.inputLocal("drivestatus"),
                        textStyle: {
                            fontWeight: "normal",
                            fontSize: 14
                        }
                    },
                    textStyle: {
                        color: "#9aa2b3"
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow',
                            label: {
                                formatter(data) {
                                    return vm.$moment(data.value, 'YYYYMMDD')
                                        .format('l')
                                }
                            },
                        },
                    },
                    color: ["#0077ff", "#66adff", "#b2d6ff",],
                    grid: {
                        left: '15%',
                        right: 0,
                        top: 50,
                        bottom: 20,
                    },
                    yAxis: {
                        axisLine: {
                            lineStyle: {
                                color: "#ebeff7"
                            }
                        },
                        axisLabel: {
                            formatter(v) {
                                if (v > 1000 && v < 1000000) return v / 1000 + 'K';
                                if (v > 1000000) return v / 1000000 + 'M';
                                return v;
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: "#ebeff7",
                            },
                        },
                    },
                    xAxis: {
                        splitLine: {
                            show: false
                        },
                        axisTick: {
                            alignWithLabel: true
                        },
                        data: vm.chartsData.pluck('day_nyr'),
                        axisLabel: {
                            formatter(v) {
                                return vm.$moment(v, 'YYYYMMDD')
                                    .format('l')
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: "#ebeff7"
                            }
                        }
                    },
                    series: [{
                        name: vm.inputLocal('drive'),
                        type: 'bar',
                        stack: '1',
                        data: vm.chartsData.pluck('usage_count')
                    }, {
                        name: vm.inputLocal('stop'),
                        type: 'bar',
                        stack: '1',
                        data: vm.chartsData.pluck('stop_count')
                    }, {
                        name: vm.inputLocal('unusual'),
                        type: 'bar',
                        stack: '1',
                        data: vm.chartsData.pluck('error_count')
                    }]
                };
                chart.setOption(option);
            },
            renderChatLine(canvas, title, data) {
                let vm = this;
                let chart = vm.createChartFromDomId(canvas);
                let option = {
                    title: {
                        text: title,
                        textStyle: {
                            fontWeight: "normal",
                        }
                    },
                    textStyle: {
                        color: "#9aa2b3"
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow',
                            label: {
                                formatter(data) {
                                    return vm.$moment(data.value, 'YYYYMMDD')
                                        .format('l')
                                }
                            },
                        },
                    },
                    color: ["#0077ff"],
                    grid: {
                        left: '15%',
                        right: 0,
                        top: 50,
                        bottom: 20,
                    },
                    yAxis: {
                        axisLine: {
                            lineStyle: {
                                color: "#ebeff7"
                            }
                        },
                        axisLabel: {
                            margin: 6,
                            interval: 2,
                            formatter(v) {
                                if (v > 1000 && v < 1000000) return v / 1000 + 'K';
                                if (v > 1000000) return v / 1000000 + 'M';
                                return v;
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: "#ebeff7"
                            }
                        }
                    },
                    xAxis: {
                        splitLine: {
                            show: false,
                        },
                        axisTick: {
                            alignWithLabel: true
                        },
                        data: vm.chartsData.pluck('day_nyr'),
                        axisLabel: {
                            formatter(v) {
                                return vm.$moment(v, 'YYYYMMDD')
                                    .format('l')
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: "#ebeff7"
                            }
                        }
                    },
                    series: [{
                        type: 'line',
                        data: data
                    }]
                };
                chart.setOption(option);
            },
            renderCharts() {
                let vm = this;
                return new Promise((resolve, reject) => {
                    vm.SaaSApi.getCompanyVehicleStatistics(
                        vm.currentCompany.id,
                        vm.$moment().subtract(8, 'days').format('YYYY-MM-DD'),
                        vm.$moment().subtract(1, 'days').format('YYYY-MM-DD'),
                        'daily'
                    ).then((response) => {
                        vm.chartsData = response.data.data;
                        vm.$nextTick(function () {
                            if (vm.hasItem('status')) {
                                vm.renderChartBar();
                            }
                            if (vm.hasItem('distance')) {
                                vm.renderChatLine(
                                    "chart-distance",
                                    vm.inputLocal('drivemile'),
                                    vm.chartsData.pluck('usage_mile').map(v => Math.round(v / 1000))
                                );
                            }
                            if (vm.hasItem('time')) {
                                vm.renderChatLine(
                                    "chart-time",
                                    vm.inputLocal('drivetime'),
                                    vm.chartsData.pluck('usage_time').map(v => Math.round(v / 60 / 60))
                                );
                            }

                            vm.$emit('ready');
                        });

                        resolve(response);
                    }).catch((response) => {
                        reject(response);
                    });
                });
            },
            hasItem(name) {
                return _.indexOf(this.options, name) >= 0;
            },
        }
    }
</script>

<style lang="scss" scoped>
    #charts {
        background-color: #fff;
        border: 1px solid #eee;
        padding: 20px 10px;
    }

    .chart-row {
        .chart-container {
            width: 100%;
            min-height: 300px;
        }
    }
</style>
