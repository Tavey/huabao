<template>
    <div class="page">
        <Breadcrumb></Breadcrumb>
        <el-form
            inline
            class="form-filter" size="small"
            @submit.native.prevent="renderCharts">
            <el-form-item>
                <el-date-picker
                    v-model="filter.dateRange"
                    type="daterange"
                    :range-separator="inputLocal('to')"
                    :start-placeholder="inputLocal('starttime')"
                    :end-placeholder="inputLocal('endtime')"
                    value-format="yyyy-MM-dd">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" plain icon="el-icon-search"
                           native-type='submit'>{{$t('search')}}
                </el-button>
            </el-form-item>
            <el-form-item style="float:right">
                <el-radio-group v-model="filter.dimension" @change="renderCharts">
                    <el-radio-button v-for="(n,i) in dimension"
                                     :key="i"
                                     :label="i">
                        {{n}}
                    </el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <div style="width: 100%;background-color: #fff">
            <div id="chart-status" class="chart-container" style="width: 48%;"></div>
            <div id="chart-setup" class="chart-container" style="width: 48%;"></div>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import Breadcrumb from "@/components/Breadcrumb.vue";
    import ChartMixin from "@/mixins/chart-component";
    import CustomizedMixin from "@/mixins/customized-component";

    export default {
        components: {
            Breadcrumb
        },
        mixins: [ChartMixin, CustomizedMixin],
        data() {
            return {
                filter: {
                    dateRange: [],
                    dimension: "daily"
                },
                chartsData: {
                    devices: {},
                }
            };
        },
        computed: {
            chartDateFormatterOrigin() {
                return {
                    daily: "YYYYMMDD",
                    weekly: "YYYYWW",
                    monthly: "YYYYMM",
                    yearly: "YYYY"
                }[this.filter.dimension];
            },
            chartDateFormatterShow() {
                return {
                    daily: "YYYY/MM/DD",
                    weekly: "YYYY/wo",
                    monthly: "YYYY/MM",
                    yearly: "YYYY"
                }[this.filter.dimension];
            },
            dimension() {
                let vm = this;
                return {
                    daily: vm.inputLocal("day"),
                    weekly: vm.inputLocal("week"),
                    monthly: vm.inputLocal("month"),
                    yearly: vm.inputLocal("year")
                };
            }
        },
        created() {
            this.filter.dateRange = [
                this.$moment()
                    .subtract(1, "months")
                    .format("YYYY-MM-DD"),
                this.$moment()
                    .subtract(1, "days")
                    .format("YYYY-MM-DD")
            ];
            this.importFontpack("DataService/Statistics");
        },
        mounted() {
            this.renderCharts();
        },
        methods: {
            getCompanyDeviceStatistics() {
                return this.SaaSApi.getCompanyDeviceStatistics(
                    this.currentCompany.id,
                    this.filter.dateRange[0],
                    this.filter.dateRange[1],
                    this.filter.dimension
                );
            },
            renderCharts() {
                let vm = this;
                vm.showLoadingInc();
                vm.getCompanyDeviceStatistics().then(response => {
                    vm.chartsData.devices = _.orderBy(response.data.data, ['date']);
                    // console.log(vm.chartsData.devices);
                    vm.$nextTick(() => {
                        vm.renderChartStatus();
                        vm.renderChatSetup();
                        vm.hideLoadingInc();
                    });
                })
            },
            renderChartStatus() {
                let vm = this;
                let chart = vm.createChartFromDomId("chart-status");
                let option = {
                    title: {
                        text: vm.inputLocal("deviceStatus")
                    },
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "shadow",
                            label: {
                                formatter(data) {
                                    return vm.$moment(
                                        data.value,
                                        vm.chartDateFormatterOrigin
                                    ).format(vm.chartDateFormatterShow);
                                }
                            }
                        }
                    },
                    yAxis: {},
                    xAxis: {
                        splitLine: {
                            show: false
                        },
                        axisTick: {
                            alignWithLabel: true
                        },
                        data: vm.chartsData.devices.pluck("date"),
                        axisLabel: {
                            formatter(v) {
                                return vm
                                    .$moment(v, vm.chartDateFormatterOrigin)
                                    .format(vm.chartDateFormatterShow);
                            }
                        }
                    },
                    series: [
                        {
                            name: vm.inputLocal("error"),
                            type: "bar",
                            stack: "1",
                            data: vm.chartsData.devices.pluck("errorCount")
                        },
                        {
                            name: vm.inputLocal("normal"),
                            type: "bar",
                            stack: "1",
                            data: vm.chartsData.devices.pluck("normalCount")
                        }
                    ]
                };
                if (chart) {
                    chart.setOption(option);
                }
            },
            renderChatSetup() {
                let vm = this;
                let chart = vm.createChartFromDomId('chart-setup');
                let option = {
                    title: {
                        text: vm.inputLocal('deviceSetup')
                    },
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "shadow",
                            label: {
                                formatter(data) {
                                    return vm.$moment(
                                        data.value,
                                        vm.chartDateFormatterOrigin
                                    ).format(vm.chartDateFormatterShow);
                                }
                            }
                        }
                    },
                    yAxis: {
                        minInterval: 1
                    },
                    xAxis: {
                        splitLine: {
                            show: false
                        },
                        axisTick: {
                            alignWithLabel: true
                        },
                        data: vm.chartsData.devices.pluck("date"),
                        axisLabel: {
                            formatter(v) {
                                return vm.$moment(v, vm.chartDateFormatterOrigin)
                                    .format(vm.chartDateFormatterShow);
                            }
                        }
                    },
                    series: [{
                        type: "line",
                        data: vm.chartsData.devices.pluck("setupCount")
                    }]
                };
                if (chart) {
                    chart.setOption(option);
                }
            }
        }
    };
</script>

<style scoped lang="scss">
    .chart-container {
        /*width: 100%;*/
        display: inline-block;
        min-height: 300px;
    }
</style>
