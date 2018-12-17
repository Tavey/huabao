<template>
  <div class="page">
    <Breadcrumb></Breadcrumb>
    <el-row class="chart-row" :gutter="20">
      <el-col :spam="22">
        <div id="chart-new" style="width: 100%;height:300px"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Breadcrumb from "@/components/Breadcrumb.vue";
import ChartMixin from "@/mixins/chart-component";

export default {
    components: {
        Breadcrumb
    },
    mixins: [ChartMixin],
    data() {
        return {
            chartsData: {
                devices: {}
            }
        };
    },
    created() {
        this.importFontpack("DataService/Devices");
    },
    computed: {},
    mounted() {
        this.renderChart();
    },
    methods: {
        getCompanyDeviceStatistics() {
            return this.SaaSApi.getCompanyDeviceStatistics(
                this.currentCompany.id
            );
        },
        renderChart() {
            let vm = this;
            vm.showLoadingInc();
            vm.getCompanyDeviceStatistics().then(response => {
                vm.hideLoadingInc();
                vm.chartsData.devices = response.data.data;
                vm.$nextTick(() => {
                    vm.renderChartNew();
                });
            });
        },
        renderChartNew() {
            let vm = this;

            let chart = vm.createChartFromDomId("chart-new");
            let option = {
                title: {
                    text: vm.inputLocal("newdevicecount"),
                    left: 0
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow",
                        label: {
                            formatter(data) {
                                return vm
                                    .$moment(data.value, "YYYYMMDD")
                                    .format("l");
                            }
                        }
                    }
                },
                grid: {
                    left: 50,
                    right: 0,
                    top: 50,
                    bottom: 20,
                    width: "95%"
                },
                yAxis: {},
                xAxis: {
                    splitLine: {
                        show: false
                    },
                    data: vm.chartsData.devices.pluck("cal_date"),
                    axisLabel: {
                        formatter(v) {
                            return vm.$moment(v, "YYYYMMDD").format("l");
                        }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    z: 10
                },
                series: [
                    {
                        name: "",
                        type: "bar",
                        itemStyle: {
                            normal: {
                                color: ["#66adff"]
                            },
                            emphasis: {
                                color: ["#66adff"]
                            }
                        },
                        data: vm.chartsData.devices.pluck("indicator_value")
                    }
                ]
            };
            chart.setOption(option);
        }
    }
};
</script>

<style scoped lang="scss">
.chart-row {
    padding: 20px;
    background-color: #fff;
    margin: 0 !important;
    border: 1px solid #e5e5e5;
}
</style>
