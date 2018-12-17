<template>
    <div>
        <trip-detail-intro :trip="trip"></trip-detail-intro>
        <el-card class="box-card  box-card1">
            <div slot="header" v-if="trip.events">
                <span class="map-title">{{$t('mapPoline')}}</span>
                <div class="checkbox-container" v-if="legalEventCount > 0 && hasEventsFeature">
                    <el-checkbox :indeterminate="table.filter.isIndeterminate"
                                 v-model="table.filter.isEventCheckAll"
                                 @change="handleEventCheckAll"
                    >
                        {{$t('chooseAll')}}<span v-if="legalEventCount">({{ legalEventCount }})</span>
                    </el-checkbox>
                    <el-checkbox-group v-model="table.filter.eventTypes" @change="handleEventFilter">
                        <el-checkbox :label="i" :key="i" v-for="(name,i) in eventTypes"
                                     v-if="isEventCheckBoxShow(i)">
                            <span class="hidden-md-and-down">{{ name.longName }}</span>
                            <span class="hidden-lg-and-up">{{ name.shortName }}</span>
                            <span v-if="trip.events">({{ trip.events[i] ? trip.events[i].length : 0 }})</span>
                        </el-checkbox>
                    </el-checkbox-group>
                    <small class="hidden-md-and-down">{{$t('tips')}}</small>
                </div>
            </div>
            <el-row :gutter="20">
                <el-col :span="hasEventsFeature ? 16 : 24">
                    <hb-map
                        mapId="map-container-trip"
                        ref="map"
                        style="height: 350px;width:100%;"
                    >
                        <!-- 无区分的轨迹 -->
                        <hb-map-polyline
                            :position="map.polyLine.normal.map(a => a.toReArray())"
                            :options="{
                                color: '#8bbffb',
                                weight: 5,
                                zIndexOffset: 5
                            }"
                            v-if="!isTrackWithSpeed"
                        ></hb-map-polyline>
                        <!-- 带颜色的轨迹 -->
                        <hb-map-polyline
                            :position="polyLine.path"
                            :options="{
                                color: polyLine.strokeColor,
                                weight: 5,
                                zIndexOffset: 10
                            }"
                            v-if="isTrackWithSpeed"
                            v-for="(polyLine,i) in map.polyLine.withSpeed" :key="`polyLine_${i}`"
                        ></hb-map-polyline>
                        <!-- 起点图标 -->
                        <hb-map-marker
                            :position="map.point.begin.gps"
                            :options="{
                                icon: map.point.begin.icon,
                                zIndexOffset: 20
                            }"
                            v-if="map.point.begin">
                        </hb-map-marker>
                        <!-- 终点图标 -->
                        <hb-map-marker
                            :position="map.point.end.gps"
                            :options="{
                                icon: map.point.end.icon,
                                zIndexOffset: 20
                            }"
                            v-if="map.point.end">
                        </hb-map-marker>
                        <!-- 事件点 -->
                        <hb-map-marker
                            :position="point.gps"
                            :options="{
                                icon: point.icon,
                                zIndexOffset: 50
                            }"
                            v-for="(point, i) in map.point.events" :key="`marker_${i}`"
                            ref="marker">
                        </hb-map-marker>
                        <!-- 事件高亮点 -->
                        <hb-map-marker
                            :position="map.eventPointLighting.gps"
                            :options="{
                                icon: map.eventPointLighting.icon,
                                zIndexOffset: 60
                            }"
                            v-if="map.eventPointLighting"
                            ref="eventPointLighting">
                        </hb-map-marker>
                        <!-- 圆形围栏 -->
                        <hb-map-circle
                            :position="circle.center"
                            :options="{
                                radius: circle.radius,
                                stroke: false,
                                fill: true,
                                fillColor: '#2C5076',
                                fillOpacity:'0.4',
                                zIndexOffset: 30
                            }"
                            v-for="(circle, fenceId) in map.fences" :key="`fence_${fenceId}`"
                            v-if="circle.type == 'circle'"
                            :ref="`fence_${fenceId}`">

                        </hb-map-circle>
                        <!-- 多边形围栏 -->
                        <hb-map-polygon
                            :position="polygon.path"
                            :options="{
                                stroke: false,
                                fill: true,
                                fillColor: '#2C5076',
                                fillOpacity:'0.4',
                                zIndexOffset: 30
                            }"
                            v-for="(polygon, fenceId) in map.fences" :key="`fence_${fenceId}`"
                            v-if="polygon.type == 'polygon'"
                            :ref="`fence_${fenceId}`"
                        >
                        </hb-map-polygon>
                        <hb-map-popup
                            ref="infoWindow"
                            v-if="map.window.position"
                            :position="map.window.position"
                            :options="{
                                offset:[0,0],
                                zIndexOffset: 1000
                            }"
                            :visible="map.window.visible"
                        >
                            <window-content :windowInfo="map.window.info" has-vehicle has-device has-event/>
                        </hb-map-popup>
                    </hb-map>

                </el-col>
                <el-col :span="8" v-if="hasEventsFeature"
                        style="display: flex; flex-direction: column;height: 350px;">
                    <el-row type="flex" :gutter="20" style="flex: none" v-if="isOnlyStopEventSelect">
                        <el-col :lg="6" :md="8">
                            <small style="line-height: 38px">{{ $t('stopDuration') }}</small>
                        </el-col>
                        <el-col :lg="18" :md="16">
                            <el-slider
                                v-model="table.filter.stopEventRange.value"
                                range
                                show-stops
                                :min="table.filter.stopEventRange.min"
                                :max="table.filter.stopEventRange.max"
                                :step="table.filter.stopEventRange.step"
                                :format-tooltip="stopDurationTooltipFormatter"
                                @change="handleStopDurationFilter"
                            ></el-slider>
                        </el-col>
                    </el-row>
                    <el-row v-if="isOnlyStopEventSelect">
                        <el-col :lg="6" :md="8">
                            <small>{{ $t('currentDurationRange') }}</small>
                        </el-col>
                        <el-col :lg="18" :md="16" v-if="table.filter.stopEventRange.step == 1">
                            <small>{{ table.filter.stopEventRange.value[0] | formatDuration }}</small>
                            <small> -</small>
                            <small>{{ table.filter.stopEventRange.value[1] | formatDuration }}</small>
                        </el-col>
                        <el-col :lg="18" :md="16" v-else>
                            <small>{{ table.filter.stopEventRange.value[0] | formatDuration('hh_mm_') }}</small>
                            <small> -</small>
                            <small>{{ table.filter.stopEventRange.value[1] | formatDuration('hh_mm_') }}</small>
                        </el-col>
                    </el-row>
                    <el-row style="flex: 1;">
                        <el-col style="height: 100%;">
                            <el-table height="100%"
                                      stripe
                                      size="mini"
                                      :data="table.data"
                                      @cell-click="handleTableClick"
                                      @cell-mouse-enter="handleTableMouseEnter"
                                      @cell-mouse-leave="handleTableMouseLeave">
                                <el-table-column
                                    min-width="120px"
                                    :label="inputLocal('time')">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.revised_at | formatDateTime}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                    min-width="80px"
                                    :label="inputLocal('type')">
                                    <template slot-scope="scope">
                                        <span>
                                            {{ eventTypes[scope.row.badFlag].longName + (scope.row.badFlag == 7 ? (scope.row.fenceType == 50 ? `（${inputLocal('enter')}）` : `（${inputLocal('leave')}）`) : '') }}
                                        </span>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                    :label="inputLocal('stopDuration')"
                                    min-width="100px"
                                    v-if="isOnlyStopEventSelect">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.duration | formatDuration }}</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
            <el-row class="el-card__footer">
                <el-col :span="hasEventsFeature ? 16 : 24">
                    <div style="display: flex">
                        <div>
                            <div class="check-group">
                                <el-checkbox-group v-model="map.options" size="mini" v-if="hasSpeedTrackFeature">
                                    <el-checkbox-button label="isTrackWithSpeed">{{$t('speedPoline')}}
                                    </el-checkbox-button>
                                    <el-checkbox-button label=""></el-checkbox-button>
                                </el-checkbox-group>
                                <el-button-group>
                                    <el-button type="primary" size="mini"
                                               :icon="`fas fa-${map.slider.isPlay ? 'pause' : 'play'} fa-fw`"
                                               @click="handleSliderControllerClick"></el-button>
                                    <el-button type="primary" size="mini"
                                               :icon="`fas fa-stop fa-fw`"
                                               @click="handleSliderControllerPauseClick"></el-button>
                                </el-button-group>
                                <el-dropdown @command="handleVideoSpeed">
                                    <el-button
                                        type="primary"
                                        size="mini"
                                    >
                                        {{videoSpeed}}x
                                        <i class="el-icon-arrow-down el-icon--right"></i>
                                    </el-button>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item :command="1">1x</el-dropdown-item>
                                        <el-dropdown-item :command="8">8x</el-dropdown-item>
                                        <el-dropdown-item :command="32">32x</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </div>
                        <div style="flex:1;padding: 0 20px;">
                            <el-slider :show-tooltip="false"
                                       v-model="map.slider.value"
                                       :min="0"
                                       :max="map.slider.max"
                            ></el-slider>
                        </div>
                        <div>
                            <el-tooltip class="item" effect="dark" :content="inputLocal('durationTip')" placement="top">
                                <small class="time-duration">
                                    {{map.slider.value | formatDuration('hh:mm:ss') }}
                                    /
                                    {{map.slider.max | formatDuration('hh:mm:ss') }}
                                    <i class="fas fa-question-circle fa-fw"></i>
                                </small>
                            </el-tooltip>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </el-card>
        <el-card class="box-card" v-if="trip.track && trip.track.length > 0 ">
            <el-row>
                <el-col :span="2" class="chart-indicator">
                    <div class="title" :style="{height: chart.speed.height}">
                        {{ inputLocal('speed') }}
                    </div>
                    <div class="content" :style="{height: chart.speed.height,}">
                        <span v-if="trip.track[chartFocusIndex]">{{ trip.track[chartFocusIndex].speed }}</span>
                        <span v-else>--</span>
                        <br/>
                        <span>km/h</span>
                    </div>
                </el-col>
                <el-col :span="22">
                    <hb-chart-line :source="trip.track"
                                   :options="chart.speed"
                                   :mousePositionX="chartMousePositionX"
                                   :focusIndex="chartFocusIndex"
                                   @focus-change="handleChartFocusChange">
                    </hb-chart-line>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="2" class="chart-indicator">
                    <div class="title" :style="{height: chart.altitude.height}">{{ inputLocal('altitude') }}
                    </div>
                    <div class="content" :style="{height: chart.altitude.height}">
                        <span v-if="trip.track[chartFocusIndex]">{{ trip.track[chartFocusIndex].elevation }}</span>
                        <span v-else>--</span>
                        <br/>
                        <span>m</span>
                    </div>
                </el-col>
                <el-col :span="22">
                    <hb-chart-line :source="trip.track"
                                   :options="chart.altitude"
                                   :mousePositionX="chartMousePositionX"
                                   :focusIndex="chartFocusIndex"
                                   @focus-change="handleChartFocusChange">
                    </hb-chart-line>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<script>

    import _ from 'lodash';
    import Vue from 'vue';
    import Gps from '@/utils/gps'
    import {AMapService} from "@/utils/util";

    import ChartMixin from '@/mixins/chart-component';
    import CustomizedMixin from "@/mixins/customized-component";

    import WindowContent from '@/components/WindowContent'
    import TripDetailIntro from "./Intro";
    import HbChartLine from "@/components/Chart/Line";

    // 浅 #b2d6ff
    // 中-浅 #8bbffb
    // 中 #66adff
    // 深 #0077ff
    const TRIP_COLOR_SPEED_MAPPER = {
        'b2d6ff': {
            min: 0,
            max: 20
        },
        '8bbffb': {
            min: 21,
            max: 60
        },
        '66adff': {
            min: 61,
            max: 100
        },
        '0077ff': {
            min: 101,
            max: 1000
        }
    };


    const EVENT_TYPE_ICON_MAPPER = {
        '1': {
            icon: 'fa-exclamation',
            type: 'danger',
        },
        '2': {
            icon: 'fa-reply',
            type: 'primary',
        },
        '3': {
            icon: 'fa-plus',
            type: 'primary',
        },
        '4': {
            icon: 'fa-minus',
            type: 'primary',
        },
        '5': {
            icon: 'fa-bolt',
            type: 'warning',
        },
        '6': {
            icon: 'fa-clock',
            type: 'info',
        },
        '7': {
            icon: 'fa-braille',
            type: 'warning',
        }
    };

    export default {
        name: "trip-detail-content",
        components: {
            HbChartLine,
            TripDetailIntro,
            WindowContent
        },
        mixins: [ChartMixin, CustomizedMixin],
        props: {
            trip: {
                type: Object,
                required: true
            }
            // tripId: {
            //     type: String,
            //     required: true
            // },
            // vehicleId: {}
        },
        data() {
            return {
                loadStatus: "1",
                // realDuration: 0,
                // trip: {},
                map: {
                    options: [],
                    bounds: L.latLngBounds(),
                    geocoder: null,
                    fastChangeHandle: null,
                    navigator: null,
                    pathSimplifier: null,
                    slider: {
                        isPlay: false,
                        playHandle: null,
                        value: 0,
                        max: 100,
                    },
                    fences: {},
                    point: {
                        begin: null,
                        end: null,
                        events: []
                    },
                    polyLine: {
                        withSpeed: [],
                        normal: []
                    },
                    eventPointLighting: null,
                    window: {
                        position: [0, 0],
                        visible: false,
                        info: {
                            sampled_at: '',
                            address: null,
                            extra: {}
                        }
                    },
                },
                table: {
                    data: [],
                    filter: {
                        isIndeterminate: false,
                        isEventCheckAll: false,
                        eventTypes: [],
                        stopEventRange: {
                            min: 0,
                            max: 0,
                            step: 1,
                            value: null
                        }
                    },
                    mouseCurrentId: null,
                    mouseLeaveHandler: null
                },
                chart: {
                    speed: {
                        height: '100px',
                        margin: {
                            top: 20,
                            right: 40,
                            bottom: 20,
                            left: 40
                        },
                        xAxis: {isDatetime: true, key: 'sampled_at', color: '#aaa'},
                        yAxis: {
                            min: 0,
                            color: '#aaa',
                        },
                        series: [{
                            key: 'speed',
                            isColorGradient: true,
                            color: [
                                {offset: 0, color: '#fcca32'},
                                {offset: 60, color: '#fcca32'},
                                {offset: 80, color: '#ff4344'},
                                {offset: 120, color: '#ff4344'}
                            ],
                            isShowMaxLabel: true,
                            isShowAvgLine: true
                        }
                        ],
                        tooltip: {
                            show: false
                        },
                        datetimeInputFormat: '%Y-%m-%d\T%H:%M:%S%Z',
                        datetimeOutputFormat: '%H:%M:%S'
                    },
                    altitude: {
                        height: '100px',
                        margin: {
                            top: 20,
                            right: 40,
                            bottom: 20,
                            left: 40
                        },
                        xAxis: {isDatetime: true, key: 'sampled_at', color: '#aaa'},
                        yAxis: {color: '#aaa'},
                        series: [{
                            key: 'elevation',
                            color: '#0077ff',
                            isShowMaxLabel: true,
                            isArea: true
                        }
                        ],
                        tooltip: {
                            show: false
                        },
                        datetimeInputFormat: '%Y-%m-%d\T%H:%M:%S%Z',
                        datetimeOutputFormat: '%H:%M:%S'
                    }
                },
                activeIndex: 0,
                oldIndex: 0,
                chartMousePositionX: null,
                chartFocusIndex: null,
                videoSpeed: 1,
                // fastSliderHandle: null,
            }
        },
        created() {
            this.importFontpack('Public/TripDetail');
        },
        mounted() {
            let vm = this;
            if (vm.hasSpeedTrackFeature) {
                vm.map.options = ['isTrackWithSpeed']
            }
            vm.renderMap();
        },
        watch: {
            'table.data'(val) {
                this.renderEventsPoint();
            },
            'map.slider.value'(val) {
                // console.log(val);
                // clearTimeout(this.fastSliderHandle);
                // this.fastSliderHandle = setTimeout(() => {
                this.activeIndex = this.timeRange ? this.timeRange.findIndex(a => val < a) : 0;
                if (this.oldIndex !== this.activeIndex && this.activeIndex !== -1) {

                    this.oldIndex = this.activeIndex;
                    this.pathSimplifier.moveTo(
                        this.map.polyLine.normal[this.oldIndex - 1].toReArray(),
                        50
                    );
                    this.chartFocusIndex = this.oldIndex - 1;
                }
                // }, 600);

            },
            'isOnlyStopEventSelect'(val) {
                let vm = this;
                if (val && !vm.table.filter.stopEventRange.value) {
                    let events = vm.trip.events[6];
                    if (events.length > 0) {
                        let min = _.minBy(events, 'duration').duration;
                        let max = _.maxBy(events, 'duration').duration;
                        let step = 1;

                        //如果最小停驶与最大停驶超过15分钟
                        // if (min > 60) {
                        if ((max - min) / 60 > 600) {
                            min = Math.floor(min / 600) * 600;
                            max = Math.ceil(max / 600) * 600;
                            step = 600;
                        } else if ((max - min) / 60 > 60) {
                            min = Math.floor(min / 300) * 300;
                            max = Math.ceil(max / 300) * 300;
                            step = 300;
                        } else if ((max - min) / 60 > 15) {
                            min = Math.floor(min / 60) * 60;
                            max = Math.ceil(max / 60) * 60;
                            step = 60;
                        }
                        // }
                        vm.table.filter.stopEventRange = {
                            min: min,
                            max: max,
                            step: step,
                            value: [min, max]
                        }
                    }
                }
            }
        },
        computed: {
            /**
             * 是否显示带速度变化的轨迹
             */
            isTrackWithSpeed() {
                return this.map.options.indexOf('isTrackWithSpeed') >= 0;
            },
            /**
             * 是否有且仅有停驶事件被选中
             */
            isOnlyStopEventSelect() {
                return this.table.filter.eventTypes.length == 1 &&
                    this.table.filter.eventTypes[0] == 6;
            },
            /**
             * 合法时间总数，显示在全选checkbox上
             * 排除非定制化后数据
             * @return {number}
             */
            legalEventCount() {
                let result = 0;
                if (this.trip.events) {
                    for (let i in this.eventTypes) {
                        if (
                            !this.trip.events[i] ||
                            (this.routeParams && this.routeParams['features']['events'].indexOf(i) < 0)
                        ) continue;
                        result += this.trip.events[i].length;

                    }
                }
                return result;
            },
            /**
             * 事件名称列表，包括长名称及短名称。
             * 用于响应式设计
             */
            eventTypes() {
                let vm = this;
                return {
                    '1': {longName: vm.inputLocal('event.4'), shortName: vm.inputLocal('event.s4')},
                    '2': {longName: vm.inputLocal('event.0'), shortName: vm.inputLocal('event.s0')},
                    '3': {longName: vm.inputLocal('event.1'), shortName: vm.inputLocal('event.s1')},
                    '4': {longName: vm.inputLocal('event.2'), shortName: vm.inputLocal('event.s2')},
                    '5': {longName: vm.inputLocal('event.3'), shortName: vm.inputLocal('event.s3')},
                    '6': {longName: vm.inputLocal('event.6'), shortName: vm.inputLocal('event.s6')},
                    '7': {longName: vm.inputLocal('event.5'), shortName: vm.inputLocal('event.s5')}
                }
            },
            /**
             * 控制地图右侧table是否显示
             * 定制化中不需要事件或者该行程没有事件
             */
            hasEventsFeature() {
                return this.hasFeature('events');
                // return this.hasFeature('events') && this.legalEventCount > 0;
            },
            hasSpeedTrackFeature() {
                return this.hasFeature('speedTrack');
            }
        },
        methods: {
            /**
             * 停驶时长滑块过滤显示格式化
             */
            stopDurationTooltipFormatter(value) {
                return this.$options.filters.formatDuration(value);
            },
            /**
             * 停驶时长过滤
             */
            handleStopDurationFilter(val) {
                console.log(val);
                let vm = this;
                let min = val[0];
                let max = val[1];

                let events = vm.trip.events[6];
                if (events.length > 0) {
                    vm.table.data = _.filter(events, val => {
                        return val.duration >= min && val.duration <= max;
                    });
                }
            },
            /**
             * 特定事件的checkbox是否显示
             * 存在该事件，并且在定制化范围内
             * @param type
             * @return {boolean}
             */
            isEventCheckBoxShow(type) {
                return this.trip.events[type] !== undefined &&
                    Object.keys(this.trip.events[type]).length > 0 &&
                    this.routeParams &&
                    this.routeParams['features']['events'].indexOf(type) >= 0;
            },
            // renderPage() {
            //     let vm = this;
            //     vm.$nextTick(() => {
            //         vm.renderMap();
            //         // vm.showLoadingInc();
            //     });
            //     // vm.getTrip().then(response => {
            //     //     vm.trip = response.data.data;
            //     //     vm.hideLoadingInc();
            //     //     vm.renderMap();
            //     // });
            // },
            renderMap() {
                let vm = this;
                vm.$nextTick(function () {
                    vm.renderTripTrack();
                    vm.renderStartAndEndPoint();
                    vm.renderPathSimplifier();
                    vm.initSlider();
                    vm.$emit("render-complete");
                });
            },
            handleSliderControllerClick() {
                let vm = this;
                vm.map.slider.isPlay = !vm.map.slider.isPlay;
                // console.log(vm.map.slider.isPlay);
                if (vm.map.slider.isPlay) {
                    vm.map.slider.playHandle = setInterval(() => {
                        vm.map.slider.value += vm.videoSpeed;
                    }, 1000);
                } else {
                    if (vm.map.slider.playHandle) {
                        clearInterval(vm.map.slider.playHandle);
                    }
                }
            },
            getTimeRange() {
                let startTime = this.$moment(this.map.polyLine.normal[0].sampleTime).unix();
                this.timeRange = this.map.polyLine.normal.map(p => this.$moment(p.sampleTime).unix() - startTime);
            },
            handleSliderControllerPauseClick() {
                let vm = this;
                vm.map.slider.value = 0;
                clearInterval(vm.map.slider.playHandle);
                vm.map.slider.isPlay = false;
            },
            initSlider() {
                let vm = this;
                let realDuration = vm.$moment(vm.trip.track[vm.trip.track.length - 1].sampled_at).unix() - vm.$moment(vm.trip.track[0].sampled_at).unix()
                // vm.$set(vm.trip, 'duration', realDuration);
                // vm.realDuration = realDuration;
                vm.map.slider.max = realDuration;
            },
            /**
             * 画起点终点
             */
            renderStartAndEndPoint() {
                let vm = this;
                if (vm.trip.beginGps) {
                    let beginGps = vm.trip.beginGps.split(',');
                    let gps = new Gps(beginGps[0], beginGps[1]);
                    if (!gps.isIllegal()) {
                        vm.map.point.begin = {
                            'gps': gps.transform().toReArray(),
                            'icon': new L.Icon({
                                iconUrl: require('@/assets/startpoint.png'),
                                iconSize: [20, 20],
                                iconAnchor: [10, 10]
                            })
                        }
                    }
                }
                if (vm.trip.endGps) {
                    let endGps = vm.trip.endGps.split(',');
                    let gps = new Gps(endGps[0], endGps[1]);
                    if (!gps.isIllegal()) {
                        vm.map.point.end = {
                            'gps': gps.transform().toReArray(),
                            'icon': new L.Icon({
                                iconUrl: require('@/assets/endpoint.png'),
                                iconSize: [20, 20],
                                iconAnchor: [10, 10]
                            })
                        }
                    }
                }
            },
            setWindowContent(rowInfo) {
                let vm = this;
                let {speed, speed_limit, speed_overhead} = rowInfo;
                vm.map.window.info.sampled_at = rowInfo.revised_at;
                vm.map.window.position = rowInfo.trigger_gps_transform.toReArray();
                vm.map.window.info.plate_num = vm.trip.plateNum;
                vm.map.window.info.device_sn = vm.trip.deviceId;
                vm.map.window.info.type_show = vm.eventTypes[rowInfo.badFlag].longName + (rowInfo.badFlag == 7 ? (rowInfo.fenceType == 50 ? `（${vm.inputLocal('enter')}）` : `（${vm.inputLocal('leave')}）`) : '')
                if (rowInfo.badFlag === '5') {
                    vm.map.window.info.speedOver = {
                        speed,
                        speed_limit,
                        speed_overhead
                    }
                } else {
                    vm.map.window.info.speedOver = null;
                }
                if (rowInfo.trigger_gps) {
                    vm.SaaSApi.geoRecode(rowInfo.trigger_gps.longitude, rowInfo.trigger_gps.latitude, vm.locale).then(response => {
                        if (!response.data.data) {
                            throw new Error();
                        }
                        vm.map.window.info.address = response.data.data.formatted_address
                    }).catch(e => {
                        vm.map.window.info.address = vm.inputLocal('noaddress')
                    });
                }
            },
            /**
             * 事件点高亮
             */
            async handleTableMouseEnter(row, column, cell, event) {
                let vm = this;
                clearTimeout(vm.table.mouseLeaveHandler);
                if (vm.table.mouseCurrentId == row.id) {
                    return;
                }
                if (row.trigger_gps == [0, 0] || row.trigger_gps == '0,0' && !row.trigger_gps) {
                    vm.handleTableMouseLeave();
                }
                if (row.trigger_gps && row.trigger_gps.a) {
                    row.trigger_gps = `${row.trigger_gps.longitude},${row.trigger_gps.latitude}`
                }

                vm.table.mouseCurrentId = row.id;
                if (row.trigger_gps) {
                    let trigger_gps = row.trigger_gps.split(',');
                    let gps = (new Gps(trigger_gps[0], trigger_gps[1]));
                    if (!gps.isIllegal()) {
                        row.trigger_gps = _.clone(gps);
                        row.trigger_gps_transform = gps.transform();
                        vm.setWindowContent(row);
                        vm.map.window.visible = true;
                        await vm.$set(vm.map, 'eventPointLighting', {
                            id: row.id,
                            gps: gps.transform().toReArray(),
                            type: row.badFlag,
                            icon: L.DomMarkers.icon({
                                element: (new Vue({
                                    render: (h) => {
                                        return h('el-button', {
                                            props: {
                                                'icon': `fas ${EVENT_TYPE_ICON_MAPPER[row.badFlag].icon} fa-fw`
                                            }
                                        });
                                    }
                                })).$mount().$el,
                                iconSize: [20, 20],
                                iconAnchor: [10, 10],
                                className: `map-event-marker-light el-button el-button--${EVENT_TYPE_ICON_MAPPER[row.badFlag].type} is-circle`

                            })
                        });
                        if (vm.fastChangeHandle != null) {
                            clearTimeout(vm.fastChangeHandle);
                        }
                        vm.$nextTick(() => {
                            vm.fastChangeHandle = setTimeout(() => {
                                let bounds = L.latLngBounds();
                                if (vm.$refs.eventPointLighting) {
                                    bounds.extend(vm.$refs.eventPointLighting.getInstance().getLatLng());

                                    if (row.badFlag == 7) {
                                        let tmp = vm.$refs[`fence_${row.fence_id}`];
                                        if (tmp && tmp.length > 0) {
                                            bounds.extend(tmp[0].getInstance().getBounds());
                                        }
                                    }
                                    vm.mapSetDefaultFitBounds(bounds);
                                } else {
                                    vm.mapSetDefaultFitBounds(vm.map.bounds);
                                }
                            }, 200);
                        });
                    } else {
                        vm.$set(vm.map, 'eventPointLighting', null);
                        vm.mapSetDefaultFitBounds(vm.map.bounds);
                    }
                } else {
                    vm.$set(vm.map, 'eventPointLighting', null);
                    vm.mapSetDefaultFitBounds(vm.map.bounds);
                }
            },
            handleTableMouseLeave(row, column, cell, event) {
                let vm = this;
                vm.table.mouseLeaveHandler = setTimeout(() => {
                    vm.table.mouseCurrentId = null;
                    vm.map.eventPointLighting = null;
                    vm.map.window.info.address = null;
                    vm.map.window.visible = false;
                    vm.$nextTick(() => {
                        vm.fastChangeHandle = setTimeout(() => {
                            vm.mapSetDefaultFitBounds(vm.map.bounds)
                        }, 200);
                    })
                }, 100);
            },
            handleTableClick(row, column, cell, event) {
                let vm = this;
                vm.redirectToEvent(row.id, row.badFlag);
            },
            /**
             * 画事件点
             */
            renderEventsPoint() {
                let vm = this;
                let result = [];
                vm.$set(vm.map, 'fences', {});
                vm.map.point.events = [];
                for (let i in vm.table.data) {
                    let data = vm.table.data[i];
                    if (data.trigger_gps && data.trigger_gps.a) {
                        data.trigger_gps = `${data.trigger_gps.longitude},${data.trigger_gps.latitude}`
                    }
                    if (data.trigger_gps) {
                        let trigger_gps = data.trigger_gps.split(',');
                        let gps = new Gps(trigger_gps[0], trigger_gps[1]);

                        if (gps.isIllegal()) continue;
                        result.push({
                            id: data.id,
                            gps: gps.transform().toReArray(),
                            type: data.badFlag,
                            icon: L.DomMarkers.icon({
                                element: (new Vue({
                                    render: (h) => {
                                        return h('el-button', {
                                            props: {
                                                'icon': `fas ${EVENT_TYPE_ICON_MAPPER[data.badFlag].icon} fa-fw`
                                            },
                                            on: {
                                                click() {
                                                    vm.redirectToEvent(data.id, data.badFlag);
                                                }
                                            }
                                        });
                                    }
                                })).$mount().$el,
                                iconSize: [20, 20],
                                iconAnchor: [10, 10],
                                className: `map-event-marker el-button el-button--${EVENT_TYPE_ICON_MAPPER[data.badFlag].type} is-circle`
                            })
                        });
                    }
                    if (data.badFlag == 7) {
                        vm.renderFence(data.polyline, data.fence_id);
                    }
                }
                vm.$nextTick(function () {
                    vm.$set(vm.map.point, 'events', result);
                })
            },
            redirectToEvent(event_id, type) {
                let vm = this;
                if (type != 5 && type != 6 && type != 7) {
                    if (type == 1) {
                        vm.$router.push({path: `/events/type/emergency/${event_id}`});
                    } else {
                        vm.$router.push({path: `/events/type/normal/${event_id}`});
                    }
                }
            },
            renderFence(shape, fenceId) {
                let vm = this;
                shape = JSON.parse(shape);

                if (!vm.map.fences[fenceId]) {
                    if (shape.center) {
                        vm.$set(vm.map.fences, fenceId, {
                            type: 'circle',
                            center: [shape.center.latitude, shape.center.longitude],
                            radius: shape.radius
                        });
                    } else {
                        vm.$set(vm.map.fences, fenceId, {
                            type: 'polygon',
                            path: shape.map(v => [v.latitude, v.longitude])
                        });
                    }
                }
            },
            /**
             * 画轨迹图
             */
            renderTripTrack() {
                let vm = this;
                let lineArr = [];
                let pre_color = '';
                let gpsList = vm.trip.track;
                vm.map.bounds = L.latLngBounds();

                for (let i = 0; i < gpsList.length; i++) {

                    let gps = (new Gps(
                        gpsList[i].longitude,
                        gpsList[i].latitude,
                        gpsList[i].speed,
                        0,
                        gpsList[i].elevation,
                        gpsList[i].sampled_at
                    ));
                    if (gps.isIllegal()) {
                        continue;
                    }
                    gps.transform();
                    vm.map.polyLine.normal.push(gps);
                    vm.map.bounds.extend(L.latLng(gps.latitude, gps.longitude));

                    let now_color = vm._getTrackColorBySpeed(gps.speed);
                    lineArr.push(gps.toReArray());
                    if (pre_color != now_color) {
                        if (lineArr.length > 0) {
                            vm.map.polyLine.withSpeed.push({
                                path: lineArr,
                                strokeColor: `#${pre_color}`,
                            });
                            lineArr = [];
                            lineArr.push(gps.toReArray());
                        }
                        pre_color = now_color;
                    }
                }
                vm.map.polyLine.withSpeed.push({
                    path: lineArr,
                    strokeColor: `#${pre_color}`,
                });
                vm.mapSetDefaultFitBounds(vm.map.bounds);
            },
            mapSetDefaultFitBounds(bounds) {
                let map = this.$refs.map.getInstance();
                if (bounds.isValid && bounds.isValid()) {
                    map.flyToBounds(bounds, {
                        duration: 0.25
                    });
                }
            },
            /**
             * 画轨迹线和巡航器
             */
            renderPathSimplifier() {
                let vm = this;
                vm.getTimeRange();
                let points = vm.map.polyLine.normal.map((v, i) => {
                    return v.toReArray()
                });

                vm.pathSimplifier = L.Marker.movingMarker(points, [], {
                    icon: L.divIcon({
                        iconUrl: "<div></div>",
                        className: "path-rover"
                    })
                }).addTo(vm.$refs.map.getInstance());
            },
            _getTrackColorBySpeed(speed) {
                for (let color in TRIP_COLOR_SPEED_MAPPER) {
                    if (TRIP_COLOR_SPEED_MAPPER[color].min <= speed && TRIP_COLOR_SPEED_MAPPER[color].max >= speed) {
                        return color;
                    }
                }
                return Object.keys(TRIP_COLOR_SPEED_MAPPER)[0];
            },
            handleChartFocusChange(pointSampledAt, index, mousePosX) {
                let vm = this;
                vm.$set(vm.map.slider, 'value', vm.$moment(pointSampledAt).unix() - vm.$moment(vm.map.polyLine.normal[0].sampleTime).unix());

                vm.chartMousePositionX = mousePosX;
                vm.chartFocusIndex = index;
            },
            handleEventCheckAll(val) {
                this.table.filter.eventTypes = val ? this.routeParams['features']['events'] : [];
                this.isIndeterminate = false;
                this.handleEventFilter(this.table.filter.eventTypes);
            },
            /**
             * 事件过滤，checkbox change事件
             */
            handleEventFilter(val) {
                let vm = this;
                let result = [];
                //处理全选逻辑
                let checkedCount = val.length;
                let optionTotalCount = this.routeParams['features']['events'].length;
                vm.table.filter.isEventCheckAll = (checkedCount == optionTotalCount);
                vm.table.filter.isIndeterminate = checkedCount > 0 && checkedCount < optionTotalCount;
                //填充数据
                for (let i = 0; i < val.length; i++) {
                    let events = vm.trip.events;
                    if (events[val[i]]) {
                        result = result.concat(events[val[i]]);
                    }
                }
                result = result.sort((a, b) => {
                    return vm.$moment(a.revised_at).unix() - vm.$moment(b.revised_at).unix();
                });
                vm.$set(vm.table, 'data', result);
            },
            /**
             * 播放速度
             * @param speed
             */
            handleVideoSpeed(speed) {
                this.videoSpeed = speed;
            }
        }
    }
</script>


<style scoped lang="scss">
    form {
        .el-form-item {
            margin-bottom: 0;
        }
    }

    .el-card {
        margin-bottom: 10px;
        .map-title {
            font-size: 14px;
        }
    }

    .el-card-body {
        padding: 12px;
    }

    .el-card__header {
        .checkbox-container {
            display: inline-block;
            & > .el-checkbox {
                margin-left: 40px;
            }
            .el-checkbox-group {
                margin-right: 20px;
                display: inline;
                .el-checkbox {
                    margin-left: 20px;
                }
            }
        }
    }

    @media screen and (max-width: 1200px) {
        .el-card__header {
            & > div > .el-checkbox {
                margin-left: 15px;
            }
            .el-checkbox-group {
                margin-right: 10px;
                .el-checkbox {
                    margin-left: 10px;
                }
            }
        }
    }

    .el-row {
        margin-bottom: 0;
    }

    .el-card__footer {
        display: flex;
        align-items: center;
    }

    .chart-container {
        padding-top: 12px;
        width: 100%;
        min-height: 300px;
    }

    .el-card__footer {
        span {
            color: #999;
            font-size: 12px;
        }
    }

    .time-duration {
        width: 100%;
        display: inline-block;
        text-align: right;
        margin-top: 12px;
        color: #999;
    }

    .load-status {
        span:first-of-type {
            color: #999
        }
        select:last-child {
            border-radius: 5px;
            padding-bottom: 2px;
            font-size: 12px;
        }
    }

    .check-group {
        display: inline-flex;
        float: left;
        div {
            margin-left: 6px;
        }
    }

    .chart-indicator {
        display: table;
        font-size: .8%;
        .title {
            width: 1em;
            display: table-cell;
            vertical-align: middle;
        }
        .content {
            width: 100%;
            display: table-cell;
            text-align: center;
            vertical-align: middle;
        }
    }

    .bold {
        font-weight: 700;
    }

</style>
<style scoped>
    /*@formatter:off*/

    #map-container-trip >>> .path-rover {
        position: absolute;
        border-radius: 5px;
        background-color: red;
        width: 10px;
        height: 10px;
    }

    /*@formatter:on*/
</style>
