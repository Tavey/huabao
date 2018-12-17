<template>
    <div>
        <el-popover
            ref="popoverFlash"
            placement="top"
            trigger="manual"
            v-model="popoverFlashShow">
            <p>{{$t('flashTip')}}</p>
            <p>{{$t('refreshReq')}}</p>
            <el-button type="primary" size="mini" @click="popoverFlashShow = false">{{$t('getIt')}}</el-button>
        </el-popover>

        <el-card>
            <el-row :gutter="20" style="margin-bottom: 30px">
                <el-col :span="2">
                    <img :src="analysisPng" width="58" style="margin-top:25px;"/>
                </el-col>
                <el-col :span="8">
                    <p>{{$t('eventNo')}}</p>
                    <p style="overflow: hidden;text-overflow:ellipsis;white-space: nowrap;"> {{ event.id }}</p>
                </el-col>
                <el-col :span="3">
                    <p>{{$t('prejudge')}}</p>
                    {{ eventType[event.type] }}
                </el-col>
                <el-col :span="3">
                    <p>{{$t('credibility')}}</p>
                    {{ event.possibility }}%
                </el-col>
                <el-col :span="3">
                    <p>{{$t('effectLeavel')}}</p>
                    {{ event.level }}
                </el-col>
            </el-row>
            <el-row :gutter="20" style="margin: 0;">
                <el-col :span="10" style="padding-left:0px;">
                    <div class="info-header">{{$t('baseInfo')}}</div>
                    <el-form label-position="left" label-width="140px" class="form-info">
                        <el-form-item :label="inputLocal('happenTime')">
                            {{ event.triggered_at |formatDateTime }}
                        </el-form-item>
                        <el-form-item :label="inputLocal('happenAddress')">
                            {{ event.address }}
                        </el-form-item>
                        <el-form-item :label="inputLocal('mileageAfter10s')">
                            {{ event.mileage_after10s }}
                        </el-form-item>
                        <el-form-item :label="inputLocal('mileageAfter20s')">
                            {{ event.mileage_after20s }}
                        </el-form-item>
                        <el-form-item :label="inputLocal('roadName')">
                            {{ event.road_name }}
                        </el-form-item>
                        <el-form-item :label="inputLocal('roadLevel')">
                            {{ event.road_level | defaults(inputLocal('unknown'))}}
                            <el-tag size="small" style="float: right" v-if="event.traffic">{{ event.traffic }}</el-tag>
                        </el-form-item>
                        <el-form-item :label="inputLocal('limitSpeed')">
                            {{ event.limit_speed > 0 ? `${event.limit_speed} ${inputLocal('km/h')}` :
                            inputLocal('unknown') }}
                            <el-tag size="small" style="float: right" v-if="event.over_speed">{{ event.over_speed }}
                            </el-tag>
                        </el-form-item>
                        <el-form-item :label="inputLocal('weather')">
                            {{ event.weather | defaults(inputLocal('unknown'))}}
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="14">
                    <div class="info-header">
                        {{$t('accidentChange')}}
                        <el-button round size="mini" style="margin-left:10px;" @click="imageDialogVisible = true"
                                   v-if="event.street_view_url"
                        >{{$t('accidentSite')}}
                        </el-button>
                        <el-radio-group v-model="mapType" size="mini" style="float: right;"
                                        @change="handleMapTypeChange"
                                        v-popover:popoverFlash>
                            <el-radio-button label="m">{{$t('map')}}</el-radio-button>
                            <el-radio-button label="s">{{$t('satellite')}}</el-radio-button>
                            <el-radio-button label="street">{{$t('street')}}</el-radio-button>
                        </el-radio-group>
                    </div>
                    <div v-show="mapType == 'm' || mapType == 's'">
                        <hb-map
                            ref="hbMap"
                            mapId="eventDetail"
                            id="eventDetail"
                            :type="mapType"
                            style="height: 320px;width:100%;margin-top: 20px"
                        >
                            <hb-map-marker
                                :position="eventTriggerPoint.gps"
                                v-if="eventTriggerPoint"
                                :options="eventTriggerPoint.options"
                            ></hb-map-marker>
                            <hb-map-polyline
                                v-if="polyLine"
                                :position="polyLine"
                            ></hb-map-polyline>
                            <hb-map-marker
                                v-for="(p, i) in [polyLine[0], polyLine[polyLine.length - 1]]"
                                :key="i"
                                :position="p"
                                v-if="polyLine.length"
                                :options="getLineStartEnd(i)"
                            ></hb-map-marker>
                        </hb-map>
                    </div>
                    <div v-show="mapType =='street'" style="height:320px;overflow:hidden">
                        <hb-street-view
                            :streetView="streetView"
                            height="600px"
                            v-if="streetView"
                        ></hb-street-view>
                        <p style="width: 100%;line-height: 320px;text-align: center"
                           v-else>
                            {{$t('notFound', [map.panoramaRadius])}}
                        </p>
                    </div>
                </el-col>
            </el-row>
        </el-card>
        <el-card>
            <el-row class="chart-row">
                <el-col :span="8">
                    <div id="event-chart-speed" class="chart-container"></div>
                </el-col>
                <el-col :span="8">
                    <carModel v-if="carInfo!=null" :carInfo="carInfo" class="chart-container"></carModel>
                </el-col>
                <el-col :span="8">
                    <div id="event-chart-max-stress" class="chart-container"></div>
                </el-col>
            </el-row>
        </el-card>
        <el-card>
            <el-row :gutter="20" class="chart-row">
                <el-col :span="8">
                    <small class="chart-axis-desc" style="top: 50px;">{{$t('carHead')}}</small>
                    <small class="chart-axis-desc" style="bottom: 20px;">{{$t('carFoot')}}</small>
                    <div id="event-chart-acceleration-x" class="chart-container"></div>
                </el-col>
                <el-col :span="8">
                    <small class="chart-axis-desc" style="top: 50px;">{{$t('leftLeaning')}}</small>
                    <small class="chart-axis-desc" style="bottom: 20px;">{{$t('rightLeaning')}}</small>
                    <div id="event-chart-angular-x" class="chart-container"></div>
                </el-col>
                <el-col :span="8">
                    <div id="event-chart-angular-total-x" class="chart-container"></div>
                </el-col>
            </el-row>
        </el-card>
        <el-card>
            <el-row :gutter="20" class="chart-row">
                <el-col :span="8">
                    <small class="chart-axis-desc" style="top: 50px;">{{$t('left')}}</small>
                    <small class="chart-axis-desc" style="bottom: 20px;">{{$t('right')}}</small>
                    <div id="event-chart-acceleration-y" class="chart-container"></div>
                </el-col>
                <el-col :span="8">
                    <small class="chart-axis-desc" style="top: 50px;">{{$t('frontLeaning')}}</small>
                    <small class="chart-axis-desc" style="bottom: 20px;">{{$t('endLeaning')}}</small>
                    <div id="event-chart-angular-y" class="chart-container"></div>
                </el-col>
                <el-col :span="8">
                    <div id="event-chart-angular-total-y" class="chart-container"></div>
                </el-col>
            </el-row>
        </el-card>
        <el-card>
            <el-row :gutter="20" class="chart-row">
                <el-col :span="8">
                    <small class="chart-axis-desc" style="top: 50px;">{{$t('carTop')}}</small>
                    <small class="chart-axis-desc" style="bottom: 20px;">{{$t('carBottom')}}</small>
                    <div id="event-chart-acceleration-z" class="chart-container"></div>
                </el-col>
                <el-col :span="8">
                    <small class="chart-axis-desc" style="top: 50px;">{{$t('turnLeft')}}</small>
                    <small class="chart-axis-desc" style="bottom: 20px;">{{$t('turnRight')}}</small>
                    <div id="event-chart-angular-z" class="chart-container"></div>
                </el-col>
                <el-col :span="8">
                    <div id="event-chart-angular-total-z" class="chart-container"></div>
                </el-col>
            </el-row>
        </el-card>

        <el-dialog
            :title="inputLocal('accidentSite')"
            :visible.sync="imageDialogVisible"
            width="80%">
            <el-carousel indicator-position="outside" @change="handleCarouselChange"
                         :height="carouselHeight">
                <el-carousel-item v-for="(entity,i) in event.street_view_url" :key="`source_${i}`">
                    <video v-if="entity.type=='video'" :src="entity.url"
                           controls="controls" style="width: 100%;"></video>
                    <img ref="carousel-img" v-else :src="entity.url"/>
                </el-carousel-item>
            </el-carousel>
        </el-dialog>
    </div>
</template>

<script>
import Vue from "vue";
import ChartMixin from "@/mixins/chart-component";
import { EVENT_TYPE_ALL } from "@/consts";
import Gps from "@/utils/gps";
import analysis from "@/assets/analysis.png";
import carModel from "@/components/CarModel";
import { divIcon } from "leaflet";

const mapper = {
    "20": {
        icon: "fa-plus",
        type: "primary",
        color: "#409eff"
    },
    "21": {
        icon: "fa-minus",
        type: "primary",
        color: "#409eff"
    },
    "22": {
        icon: "fa-reply",
        type: "primary",
        color: "#409eff"
    },
    "23": {
        icon: "fa-exclamation",
        type: "danger",
        color: "#f56b6c"
    },
    "1": {
        icon: "fa-exclamation",
        type: "info",
        color: "#909399"
    },
    "2": {
        icon: "fa-exclamation",
        type: "info",
        color: "#909399"
    },
    "3": {
        icon: "fa-exclamation",
        type: "info",
        color: "#909399"
    },
    "4": {
        icon: "fa-exclamation",
        type: "info",
        color: "#909399"
    }
};

export default {
    name: "event-detail",
    components: {
        carModel
    },
    mixins: [ChartMixin],
    props: {
        event: {
            type: Object,
            required: true
        }
    },
    beforeDestroy() {
        let vm = this;
        if (vm.outOfChina) {
            delete window.google;
            let deletArr = [];
            let parent = document.querySelector("head");
            let children = parent.childNodes;
            for (let i = 0; i < children.length; i++) {
                if (
                    children[i].localName == "script" &&
                    children[i].src.indexOf("google") >= 0
                ) {
                    deletArr.push(children[i]);
                }
            }
            for (let y = 0; y < deletArr.length; y++) {
                parent.removeChild(deletArr[y]);
            }
        }

        vm.chartEntities.forEach(v => v.dispose());
        vm.chartEntities = [];
        vm.$el.querySelectorAll(".el-vue-amap").forEach(d => d.remove());

        // if (vm.$refs["carousel-img"] && vm.$refs["carousel-img"].length > 0) {
        //     vm.$refs["carousel-img"].forEach(v => {
        //         v.removeEventListener("load", vm.handleCarouselImageLoad);
        //     });
        // }
    },
    data() {
        return {
            carInfo: null,
            analysisPng: analysis,
            eventGpsList: [],
            eventTriggerPoint: null,
            map: {
                pathSimplifier: null,
                panorama: null,
                panoramaRadius: 100
            },
            googleUrl:
                "https://www.google.cn/maps/api/js?key=AIzaSyDpfGZo2e8pDHGEFqQkwL-WGv33-YjMMY8",
            outOfChina: false,
            eventType: EVENT_TYPE_ALL,
            mapType: "m",
            originLayers: [],
            popoverFlashShow: false,
            imageDialogVisible: false,
            carouselHeight: "300px",
            polyLine: [],
            streetView: null
        };
    },
    created() {
        let vm = this;
        vm.importFontpack("DataService/Event/Detail");
    },
    mounted() {
        let vm = this;
        for (let i = 0; i < vm.event.gps_data.length; i++) {
            let current = vm.event.gps_data[i];
            let gps = new Gps(
                current.longitude,
                current.latitude,
                current.speed,
                current.direction,
                current.altitude,
                current.sampled_at
            );
            if (gps.isIllegal()) continue;
            vm.eventGpsList.push(gps.transform());
        }
        vm.renderPathSimplifier();
        vm.renderEventTriggerPoint();
        vm.renderCharts();
        vm.$nextTick(() => {
            vm.maxAcceleration();
        });
    },
    methods: {
        renderEventTriggerPoint() {
            let vm = this;
            if (vm.event.trigger_gps) {
                let tmp = vm.event.trigger_gps.split(",");
                let gps = new Gps(tmp[0], tmp[1]);
                if (!gps.isIllegal()) {
                    vm.outOfChina = gps.isOutOfChina();
                    gps = gps.transform().toReArray();
                    vm.eventTriggerPoint = {
                        id: vm.event.id,
                        gps,
                        type: vm.event.type,
                        options: {
                            icon: L.DomMarkers.icon({
                                element: new Vue({
                                    render: h => {
                                        return h("el-button", {
                                            props: {
                                                icon: `fas ${
                                                    mapper[vm.event.type].icon
                                                } fa-fw`
                                            }
                                        });
                                    }
                                }).$mount().$el,
                                iconSize: [20, 20],
                                iconAnchor: [10, 10],
                                className: `map-event-marker el-button el-button--${
                                    mapper[vm.event.type].type
                                } is-circle`
                            })
                        }
                    };
                }
            }
            let mapInstance = vm.$refs.hbMap.getInstance();
            !vm.polyLine.length &&
                vm.eventTriggerPoint &&
                mapInstance.fitBounds([vm.eventTriggerPoint.gps]);
        },
        getLineStartEnd(index) {
            if (index === 0) {
                return {
                    icon: divIcon({
                        className: "start",
                        iconSize: [8, 8]
                    })
                };
            }
            return {
                icon: divIcon({
                    className: "end",
                    iconSize: [8, 8]
                })
            };
        },
        //画轨迹线和巡航器
        renderPathSimplifier() {
            let vm = this;
            vm.polyLine = vm.eventGpsList.map(a => a.transform().toReArray());
            let mapInstance = vm.$refs.hbMap.getInstance();
            vm.polyLine.length && mapInstance.fitBounds(vm.polyLine);
        },
        async renderPanorama() {
            try {
                let [lng, lat] = this.event.trigger_gps.split(",");
                let res = await this.SaaSApi.geoPanorama(lng, lat);
                if (res.data.status) {
                    this.streetView = res.data.data;
                }
            } catch (err) {
                console.log(err);
            }
        },
        renderCharts() {
            let vm = this;
            this.renderChartSpeed()
                .renderChartMaxStress()
                .renderChartAcceleration("x", vm.inputLocal("chart.0"))
                .renderChartAcceleration("y", vm.inputLocal("chart.1"))
                .renderChartAcceleration("z", vm.inputLocal("chart.2"))
                .renderChartAngular("x", vm.inputLocal("chart.3"))
                .renderChartAngular("y", vm.inputLocal("chart.4"))
                .renderChartAngular("z", vm.inputLocal("chart.5"))
                .renderChartAngularTotal("x", vm.inputLocal("chart.6"))
                .renderChartAngularTotal("y", vm.inputLocal("chart.7"))
                .renderChartAngularTotal("z", vm.inputLocal("chart.8"));
        },
        renderChartSpeed() {
            let vm = this;
            let chart = vm.createChartFromDomId("event-chart-speed");
            let option = {
                title: {
                    text: vm.inputLocal("speedCurve")
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow",
                        label: {
                            formatter(data) {
                                let triggered_at = vm.$moment(
                                    vm.event.triggered_at
                                );
                                return (
                                    vm
                                        .$moment(data.value)
                                        .diff(triggered_at, "seconds") + "s"
                                );
                            }
                        }
                    }
                },
                grid: {
                    left: 30,
                    right: 0,
                    top: 50,
                    bottom: 25
                },
                yAxis: {},
                xAxis: {
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    data: vm.eventGpsList.pluck("sampleTime"),
                    axisLabel: {
                        formatter(v) {
                            let triggered_at = vm.$moment(
                                vm.event.triggered_at
                            );
                            return (
                                vm.$moment(v).diff(triggered_at, "seconds") +
                                "s"
                            );
                        }
                    }
                },
                series: [
                    {
                        type: "line",
                        data: vm.eventGpsList.pluck("speed")
                    }
                ]
            };
            chart.setOption(option);
            return vm;
        },
        renderChartMaxStress() {
            let vm = this;
            let x = vm.event.sensor_data
                .pluck("x_acceleration")
                .map(v => v / 1000);
            let y = vm.event.sensor_data
                .pluck("y_acceleration")
                .map(v => v / 1000);
            let z = vm.event.sensor_data
                .pluck("z_acceleration")
                .map(v => v / 1000);

            let chart = vm.createChartFromDomId("event-chart-max-stress");

            let option = {
                title: {
                    text: vm.inputLocal("peakForce")
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow"
                    }
                },
                grid: {
                    left: 50,
                    right: 0,
                    top: 50,
                    bottom: 25
                },
                yAxis: {
                    axisLabel: {
                        showMinLabel: true
                    }
                },
                xAxis: {
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    data: ["x", "y", "z"]
                },
                series: [
                    {
                        type: "bar",
                        data: [
                            Math.abs(x.max()) > Math.abs(x.min())
                                ? x.max()
                                : x.min(),
                            Math.abs(y.max()) > Math.abs(y.min())
                                ? y.max()
                                : y.min(),
                            Math.abs(z.max()) > Math.abs(z.min())
                                ? z.max()
                                : z.min()
                        ]
                    }
                ]
            };
            chart.setOption(option);
            return vm;
        },
        maxAcceleration() {
            let vm = this;
            let arr = vm.event.sensor_data.map(v => {
                v.absX = Math.abs(v.x_acceleration);
                v.absY = Math.abs(v.y_acceleration);
                return v;
            });
            let xArr = arr.pluck("absX");
            let yArr = arr.pluck("absY");
            let maxX = {
                num: Math.max.apply(null, xArr),
                index: xArr.indexOf(Math.max.apply(null, xArr))
            };
            let maxY = {
                num: Math.max.apply(null, yArr),
                index: yArr.indexOf(Math.max.apply(null, yArr))
            };
            vm.carInfo = arr[maxX.num > maxY.num ? maxX.index : maxY.index];
        },
        renderChartAcceleration(axis, title) {
            let vm = this;
            let id = `event-chart-acceleration-${axis}`;
            let chart = vm.createChartFromDomId(id);

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
                                let triggered_at = vm.$moment(
                                    vm.event.triggered_at
                                );
                                let diffMilliseconds = vm
                                    .$moment(data.value)
                                    .diff(triggered_at, "milliseconds");
                                return (
                                    parseFloat(diffMilliseconds / 1000).toFixed(
                                        1
                                    ) + "s"
                                );
                            }
                        }
                    }
                },
                grid: {
                    left: 30,
                    right: 0,
                    top: 50,
                    bottom: 25
                },
                yAxis: {
                    axisLabel: {}
                },
                xAxis: {
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    data: vm.event.sensor_data.pluck("sampled_at"),
                    axisLabel: {
                        formatter(v) {
                            let triggered_at = vm.$moment(
                                vm.event.triggered_at
                            );
                            let diffMilliseconds = vm
                                .$moment(v)
                                .diff(triggered_at, "milliseconds");
                            return (
                                parseFloat(diffMilliseconds / 1000).toFixed(1) +
                                "s"
                            );
                        }
                    }
                },
                series: [
                    {
                        type: "line",
                        data: vm.event.sensor_data
                            .pluck(`${axis}_acceleration`)
                            .map(v => {
                                return v / 1000;
                            })
                    }
                ]
            };
            chart.setOption(option);
            return vm;
        },
        renderChartAngular(axis, title) {
            let vm = this;
            let id = `event-chart-angular-${axis}`;

            let chart = vm.createChartFromDomId(id);
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
                                let triggered_at = vm.$moment(
                                    vm.event.triggered_at
                                );
                                let diffMilliseconds = vm
                                    .$moment(data.value)
                                    .diff(triggered_at, "milliseconds");
                                return (
                                    parseFloat(diffMilliseconds / 1000).toFixed(
                                        1
                                    ) + "s"
                                );
                            }
                        }
                    }
                },
                grid: {
                    left: 30,
                    right: 0,
                    top: 50,
                    bottom: 20
                },
                yAxis: {
                    axisLabel: {
                        showMinLabel: true
                    }
                },
                xAxis: {
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    data: vm.event.sensor_data.pluck("sampled_at"),
                    axisLabel: {
                        formatter(v) {
                            let triggered_at = vm.$moment(
                                vm.event.triggered_at
                            );
                            let diffMilliseconds = vm
                                .$moment(v)
                                .diff(triggered_at, "milliseconds");
                            return (
                                parseFloat(diffMilliseconds / 1000).toFixed(1) +
                                "s"
                            );
                        }
                    }
                },
                series: [
                    {
                        type: "line",
                        data: vm.event.sensor_data.pluck(`${axis}_angular`)
                    }
                ]
            };
            chart.setOption(option);
            return vm;
        },
        renderChartAngularTotal(axis, title) {
            let vm = this;
            let id = `event-chart-angular-total-${axis}`;

            let chart = vm.createChartFromDomId(id);
            let sumDegree = 0;
            for (let i = 0; i < vm.event.sensor_data.length; i++) {
                let current = vm.event.sensor_data[i];
                let next = vm.event.sensor_data[i + 1];
                if (next) {
                    let timeSpan = vm
                        .$moment(current.sampled_at)
                        .diff(vm.$moment(next.sampled_at), "seconds", true);
                    sumDegree += timeSpan * current[`${axis}_angular`];
                }
            }
            sumDegree = sumDegree.toPrecision(2);

            let option = {
                title: {
                    text: title
                },
                tooltip: {
                    trigger: "item"
                },
                xAxis: {
                    show: false
                },
                yAxis: {
                    show: false
                },
                grid: {
                    left: "3%",
                    right: "3%",
                    bottom: "3%",
                    top: "20%",
                    containLabel: true
                },
                series: [
                    {
                        type: "pie",
                        radius: "55%",
                        center: ["50%", "60%"],
                        data: [
                            { value: Math.abs(sumDegree) },
                            { value: 180 - Math.abs(sumDegree) },
                            {
                                value: 180,
                                labelLine: {
                                    normal: {
                                        show: false
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        opacity: 0
                                    }
                                }
                            }
                        ],
                        startAngle: -180,
                        avoidLabelOverlap: false,
                        animationType: "scale",
                        animationEasing: "elasticOut",
                        animationDelay: function(idx) {
                            return Math.random() * 200;
                        }
                    }
                ]
            };
            chart.setOption(option);
            return vm;
        },
        handleMapTypeChange(val) {
            let vm = this;
            if (val === "street") {
                vm.renderPanorama();
            }
            vm.mapType = val;
        },
        handleCarouselChange(index) {
            let vm = this;
            vm.$nextTick(() => {
                let img = vm.$refs["carousel-img"][index];
                img.addEventListener("load", vm.handleCarouselImageLoad);
            });
        },
        handleCarouselImageLoad(e) {
            this.carouselHeight = e.target.height + "px";
        }
    }
};
</script>

<style scoped lang="scss">
.info-header {
    margin-bottom: 10px;
}

.chart-row {
    padding: 20px 0;
    margin: 0;
    background-color: #fff;
    .el-col {
        position: relative;
    }
    .chart-container {
        width: 100%;
        min-height: 300px;
    }
    small.chart-axis-desc {
        width: 1em;
        position: absolute;
        left: 0px;
    }
}

.el-carousel__item {
    display: flex;
    justify-content: center;
}
</style>
<style scoped>
#eventDetail >>> .start {
    border-radius: 100%;
    background-color: #0f9617;
}

#eventDetail >>> .end {
    border-radius: 100%;
    background-color: #dc3911;
}
</style>
