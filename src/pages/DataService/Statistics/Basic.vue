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
            <div id="chart-status" class="chart-container" style="width: 48%;"
                 v-if="hasChartStatus"></div>
            <!--<div id="chart-device-setup" class="chart-container" style="width: 48%;"-->
            <!--v-if="hasChartVehicleSetup"></div>-->
            <div id="chart-distance" class="chart-container" style="width: 48%;"
                 v-if="hasChartDistance"></div>
            <div id="chart-duration" class="chart-container" style="width: 48%;"
                 v-if="hasChartDuration"></div>
            <div id="chart-break" class="chart-container" style="width: 48%;"
                 v-if="hasChartBreak"></div>
            <div id="chart-accelerate" class="chart-container" style="width: 48%;"
                 v-if="hasChartAccelerate"></div>
            <div id="chart-turn" class="chart-container" style="width: 48%;"
                 v-if="hasChartTurn"></div>
            <div id="chart-speed" class="chart-container" style="width: 48%;"
                 v-if="hasChartSpeed"></div>
            <div id="chart-crash" class="chart-container" style="width: 48%;"
                 v-if="hasChartCrash"></div>
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
                    vehicles: {},
                    events: {},
                    deviceSetup: {},
                    // entities: {}
                }
            };
        },
        computed: {
            chartDateFormatterOrigin() {
                return {
                    daily: "YYYYMMDD",
                    weekly: "YYYYMMDD",
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
            },
            hasChartStatus() {
                return this.hasFeature('status')
            },
            // hasChartVehicleSetup() {
            //     return this.hasFeature('vehicle-setup')
            // },
            hasChartDistance() {
                return this.hasFeature('distance')
            },
            hasChartDuration() {
                return this.hasFeature('duration')
            },
            hasChartBreak() {
                return this.hasFeature('break')
            },
            hasChartAccelerate() {
                return this.hasFeature('accelerate')
            },
            hasChartTurn() {
                return this.hasFeature('turn')
            },
            hasChartSpeed() {
                return this.hasFeature('speed')
            },
            hasChartCrash() {
                return this.hasFeature('crash')
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
        // watch: {
        //   currentCompany(val) {
        //     this.renderCharts();
        //   }
        // },
        methods: {
            getCompanyVehicleStatistics() {
                return this.SaaSApi.getCompanyVehicleStatistics(
                    this.currentCompany.id,
                    this.filter.dateRange[0],
                    this.filter.dateRange[1],
                    this.filter.dimension
                );
            },
            getCompanyEventStatistics() {
                return this.SaaSApi.getCompanyEventStatistics(
                    this.currentCompany.id,
                    this.filter.dateRange[0],
                    this.filter.dateRange[1],
                    this.filter.dimension
                );
            },
            // getCompanyVehicleStatisticsOfSetup() {
            //     return this.SaaSApi.getCompanyVehicleStatisticsOfSetup(
            //         this.currentCompany.id,
            //         this.filter.dateRange[0],
            //         this.filter.dateRange[1],
            //         this.filter.dimension
            //     );
            // },
            renderCharts() {
                let vm = this;

                vm.showLoadingInc();
                vm.getCompanyVehicleStatistics().then(response => {
                    vm.chartsData.vehicles = _.orderBy(response.data.data, ['day_nyr']);
                    vm.$nextTick(() => {
                        vm.renderChartStatus();
                        vm.renderChatVehicles(
                            "chart-distance",
                            vm.inputLocal("drivemile"),
                            vm.chartsData.vehicles
                                .pluck("usage_mile")
                                .map(v => Math.round(v / 1000))
                        );
                        vm.renderChatVehicles(
                            "chart-duration",
                            vm.inputLocal("drivetime"),
                            vm.chartsData.vehicles
                                .pluck("usage_time")
                                .map(v => Math.round(v / 60 / 60))
                        );
                    });
                    return vm.getCompanyEventStatistics();
                }).then(response => {
                    vm.chartsData.events = _.orderBy(response.data.data, ['day_nyr']);
                    vm.renderChartEvent(
                        "chart-break",
                        vm.inputLocal("eventtype")[0],
                        21
                    );
                    vm.renderChartEvent(
                        "chart-accelerate",
                        vm.inputLocal("eventtype")[1],
                        20
                    );
                    vm.renderChartEvent(
                        "chart-turn",
                        vm.inputLocal("eventtype")[2],
                        22
                    );
                    vm.renderChartEvent(
                        "chart-speed",
                        vm.inputLocal("eventtype")[3],
                        24
                    );
                    vm.renderChartEvent(
                        "chart-crash",
                        vm.inputLocal("eventtype")[4],
                        23
                    );
                    // return vm.getCompanyVehicleStatisticsOfSetup();
                    // }).then(response => {
                    //     vm.chartsData.deviceSetup = response.data.data;
                    //     vm.renderChatVehicles(
                    //         "chart-device-setup",
                    //         '车辆安装统计',
                    //         vm.chartsData.deviceSetup
                    //             .pluck("value")
                    //     );

                }).then(() => {
                    vm.hideLoadingInc();
                });
            },
            renderChartStatus() {
                let vm = this;
                let chart = vm.createChartFromDomId("chart-status");
                let option = {
                    title: {
                        text: vm.inputLocal("drivestatus")
                    },
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "shadow",
                            label: {
                                formatter(data) {
                                    return vm
                                        .$moment(
                                            data.value,
                                            vm.chartDateFormatterOrigin
                                        )
                                        .format(vm.chartDateFormatterShow);
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
                        data: vm.chartsData.vehicles.pluck("day_nyr"),
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
                            name: vm.inputLocal("drive"),
                            type: "bar",
                            stack: "1",
                            data: vm.chartsData.vehicles.pluck("usage_count")
                        },
                        {
                            name: vm.inputLocal("stopped"),
                            type: "bar",
                            stack: "1",
                            data: vm.chartsData.vehicles.pluck("stop_count")
                        },
                        {
                            name: vm.inputLocal("unusual"),
                            type: "bar",
                            stack: "1",
                            data: vm.chartsData.vehicles.pluck("error_count")
                        }
                    ]
                };
                if (chart) {
                    chart.setOption(option);
                }
            },
            renderChatVehicles(canvas, title, data) {
                let vm = this;
                let chart = vm.createChartFromDomId(canvas);
                let option = {
                    title: {
                        text: title
                    },
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "shadow",
                            label: {
                                formatter(data) {
                                    return vm
                                        .$moment(
                                            data.value,
                                            vm.chartDateFormatterOrigin
                                        )
                                        .format(vm.chartDateFormatterShow);
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
                        data: vm.chartsData.vehicles.pluck("day_nyr"),
                        axisLabel: {
                            formatter(v) {
                                return vm
                                    .$moment(v, vm.chartDateFormatterOrigin)
                                    .format(vm.chartDateFormatterShow);
                            }
                        }
                    },
                    series: [{
                        type: "line",
                        data: data
                    }]
                };
                if (chart) {
                    chart.setOption(option);
                }
            },
            renderChartEvent(canvas, title, eventType) {
                let vm = this;
                let chart = vm.createChartFromDomId(canvas);
                let option = {
                    title: {
                        text: title
                    },
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "shadow",
                            label: {
                                formatter(data) {
                                    return vm
                                        .$moment(
                                            data.value,
                                            vm.chartDateFormatterOrigin
                                        )
                                        .format(vm.chartDateFormatterShow);
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
                        data: vm.chartsData.events
                            .filter(v => {
                                return v.event_type == eventType;
                            })
                            .pluck("day_nyr"),
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
                            type: "line",
                            data: vm.chartsData.events
                                .filter(v => {
                                    return v.event_type == eventType;
                                })
                                .pluck("count_sum")
                        }
                    ]
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
