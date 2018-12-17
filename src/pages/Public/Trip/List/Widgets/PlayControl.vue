<template>
    <div class="control-wrap"
         v-if="isShow && hasTracks"
         @mouseenter="handleMouseEnter"
         @mouseleave="handleMouseLeave">

        <hb-map-marker
            v-if="simplifier.position"
            :position="simplifier.position"
            :options="simplifier.options"
        ></hb-map-marker>

        <el-row :gutter="10" type="flex">
            <el-col style="width: 200px;margin-top: 5px;">
                <div class="check-group">
                    <el-button-group>
                        <el-button type="primary"
                                   :icon="`fas fa-${slider.isPlay ? 'pause' : 'play'} fa-fw`"
                                   size="mini" @click="handleSliderControllerClick"></el-button>
                        <el-button type="primary" :icon="`fas fa-stop fa-fw`"
                                   size="mini"
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
            </el-col>
            <el-col style="flex:1">
                <el-slider :show-tooltip="false"
                           v-model="slider.value"
                           :min="0"
                           :max="slider.max"
                           style="margin-bottom: 5px"
                ></el-slider>
            </el-col>
            <el-col style="width: 125px;line-height: 38px;">
                <small class="time-duration">
                    {{slider.time | formatDateTime }}
                </small>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import Gps from "@/utils/gps";

    export default {
        name: "play-control",
        props: {
            tracks: {
                type: Object
            },
            loadPercentage: {
                default: null
            },
        },
        data() {
            return {
                videoSpeed: 1,
                sortedTrip: [],
                simplifier: {
                    options: {
                        icon: L.divIcon({
                            iconUrl: "<div></div>",
                            className: "path-rover"
                        })
                    },
                    position: null
                },
                movingMarker: null,
                slider: {
                    isPlay: false,
                    value: 0,
                    max: 0,
                    time: null,
                    playHandle: null
                },
                isShow: false,
                trip: {
                    duration: 0
                }
            }
        },
        computed: {
            hasTracks() {
                return Object.keys(this.tracks).length > 0;
            }
        },
        watch: {
            loadPercentage(newVal, oldVal) {
                let vm = this;
                if (newVal) {
                    vm.isShow = false;
                }
                if (oldVal && !newVal) {
                    let tracks = _.valuesIn(vm.tracks);
                    tracks = _.orderBy(tracks, ['beginTime'], ['asc']);
                    vm.sortedTrip = tracks;
                    vm.$nextTick(() => {
                        vm.initSlider();
                    });
                }
            },
            'slider.value'(val) {
                let vm = this;
                let tmp = val;
                for (let i = 0; i < vm.sortedTrip.length; i++) {
                    let trip = vm.sortedTrip[i];
                    let pointIndex = tmp - trip.track.length - 1;
                    if (pointIndex > 0) {
                        tmp = pointIndex;
                        continue;
                    }
                    let currentPoint = trip.track[tmp];
                    if (currentPoint.latitude && currentPoint.longitude) {
                        let gps = new Gps(currentPoint.longitude, currentPoint.latitude);
                        if (!gps.isIllegal()) {
                            vm.simplifier.position = gps.transform().toReArray();
                        }
                    }
                    if (currentPoint.sampled_at) {
                        vm.slider.time = currentPoint.sampled_at;
                    }
                    break;
                }

            }
        },
        methods: {
            /**
             * 这两处方法用于控制拖拽播放器时，不会向上冒泡至地图
             */
            handleMouseEnter() {
                let vm = this;
                let map = vm.$parent.getInstance();
                map.dragging.disable();
            },
            handleMouseLeave() {
                let vm = this;
                let map = vm.$parent.getInstance();
                map.dragging.enable();
            },
            initSlider() {
                let vm = this;
                let max = 0;
                vm.isShow = true;
                if (vm.slider.playHandle) {
                    clearInterval(vm.slider.playHandle);
                }
                vm.slider = {
                    isPlay: false,
                    value: 0,
                    max: 0,
                    time: null,
                    playHandle: null
                };
                _.forEach(vm.sortedTrip, function (trip) {
                    if (!vm.slider.time) {
                        for (let i = 0; i < trip.track.length; i++) {
                            let point = trip.track[i];
                            if (point.sampled_at) {
                                vm.slider.time = point.sampled_at;
                                break;
                            }
                        }
                    }
                    max += trip.track.length
                });
                vm.slider.max = max;
            },
            /**
             * 速度选择
             * @param speed
             */
            handleVideoSpeed(speed) {
                this.videoSpeed = speed;
            },
            /**
             * 播放及暂停
             */
            handleSliderControllerClick() {
                let vm = this;
                vm.slider.isPlay = !vm.slider.isPlay;
                if (vm.slider.isPlay) {
                    vm.slider.playHandle = setInterval(() => {
                        vm.slider.value += vm.videoSpeed;
                    }, 1000);
                } else {
                    if (vm.slider.playHandle) {
                        clearInterval(vm.slider.playHandle);
                    }
                }
            },
            /**
             * 停止
             */
            handleSliderControllerPauseClick() {
                let vm = this;
                vm.slider.value = 0;
                clearInterval(vm.slider.playHandle);
                vm.slider.isPlay = false;
            }
        }
    }
</script>

<style lang="scss" scoped>
    .control-wrap {
        position: absolute;
        bottom: 20px;
        left: 0;
        z-index: 1000;
        background-color: rgba(255, 255, 255, .5);
        width: calc(100% - 40px);
        padding: 0 20px;
    }
</style>

