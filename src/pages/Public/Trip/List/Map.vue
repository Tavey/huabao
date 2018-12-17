<template>
    <div class="map-wrap">
        <hb-map
            mapId="map-container"
            ref="map"
        >
            <hb-map-polyline
                v-for="(polyLine, tripId) in map.polyLines"
                :key="tripId"
                :ref="`polyline_${tripId}`"
                :position="polyLine.path"
                :options="{
                    color: polyLine.strokeColor,
                    weight: 5,
                    lineJoin: 'round'
                }"
            ></hb-map-polyline>
            <hb-map-marker
                v-for="(marker, i) in map.markers"
                :key="i"
                :visible="false"
                :position="marker.position"
                :options="{
                    draggable: marker.draggable,
                    icon: marker.icon
                }"
            ></hb-map-marker>
            <div v-if="routeParams && hasMapWidgets">
                <component
                    v-for="(widget) in routeParams.widgets.map"
                    :is="componentLoader('pages/Public/Trip/List/Widgets', widget)"
                    :key="`component-${widget}`"
                    :tracks="tracks"
                    :load-percentage="loadPercentage">
                </component>
            </div>
        </hb-map>
        <div class="progress-wrap">
            <el-progress v-if="loadPercentage!=null"
                         text-inside :stroke-width="18"
                         :percentage="loadPercentageShow"
            ></el-progress>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import Gps from "@/utils/gps";
import CustomizedMixin from "@/mixins/customized-component";
import TripWorker from "../Detail/Trip.worker.js";
import { mapState } from "vuex";
export default {
    name: "trip-list-map",
    props: {
        map: {
            required: true,
            type: Object
        },
        vehicleId: {}
    },
    mixins: [CustomizedMixin],
    data() {
        return {
            handleError: {},
            cancelTokenSources: [],
            tracks: {},
            cacheTracks: {},
            loadPercentage: 0,
            loadPercentageShow: 0
        };
    },
    computed: {
        ...mapState({
            loginInfo: state => state.loginInfo
        }),
        hasMapWidgets() {
            return (
                this.routeParams &&
                this.routeParams.widgets.map &&
                this.routeParams.widgets.map.length > 0
            );
        }
    },
    watch: {
        "map.shownTripIds"(val) {
            let vm = this;
            vm.map.polyLines = {};
            vm.tracks = {};
            vm.trackLoadSwitch(val);
        },
        loadPercentage: function(val) {
            let vm = this;
            vm.loadPercentageShow = Math.round(vm.loadPercentage * 10) / 10;
            if (vm.loadPercentageShow >= 100) {
                vm.loadPercentage = null;
                vm.map.handle = setTimeout(() => {
                    let map = vm.$refs.map;
                    map.getInstance().fitBounds(vm.getFullBounds());
                }, 200);
            }
        },
        "map.currentTripId": function(newTripId, oldTripId) {
            let vm = this;
            if (oldTripId && vm.map.polyLines[oldTripId]) {
                vm.clearTrackHighlight(oldTripId);
            }
            if (newTripId && vm.map.polyLines[newTripId]) {
                vm.trackHighlight(newTripId);
                vm.$nextTick(() => {
                    if (vm.map.handle) {
                        clearTimeout(vm.map.handle);
                    }

                    if (
                        vm.$refs[`polyline_${newTripId}`][0].position.length > 1
                    ) {
                        vm.$refs.map
                            .getInstance()
                            .fitBounds(
                                vm.$refs[`polyline_${newTripId}`][0]
                                    .getInstance()
                                    .getBounds()
                            );
                    }
                });
            } else {
                vm.$nextTick(() => {
                    vm.map.handle = setTimeout(() => {
                        let map = vm.$refs.map;
                        let fullBounds = vm.getFullBounds();
                        if (map.$children.length > 1 && fullBounds.isValid()) {
                            map.getInstance().fitBounds(fullBounds);
                        }
                        // map.$children.length > 1 && map.getInstance().fitBounds(vm.getFullBounds())
                    }, 200);
                });
            }
        }
    },
    beforeDestroy() {
        this.cancelAllRequest();
        this.clearWorker();
    },
    deactivated() {
        this.clearWorker();
    },
    methods: {
        /**
         * 当前全部组件的视野范围
         */
        getFullBounds() {
            let map = this.$refs.map;
            if (!map) return;
            return map.$children.reduce((p, c) => {
                if (
                    typeof c.getInstance == "function" &&
                    typeof c.getInstance().getBounds == "function"
                ) {
                    let bounds = c.getInstance().getBounds();
                    if (bounds.isValid()) p.extend(bounds);
                }
                return p;
            }, L.latLngBounds());
        },
        /**
         * 取消所有请求
         */
        cancelAllRequest() {
            for (let i = 0; i < this.cancelTokenSources.length; i++) {
                let current = this.cancelTokenSources[i];
                if (typeof current.cancel == "function") {
                    current.cancel();
                }
            }
        },
        /**
         * 渲染起终点
         */
        renderStartAndEndPoint(start, end) {
            let vm = this;
            let startPoint = {
                position: start,
                draggable: false,
                visible: true,
                icon: L.icon({
                    iconUrl: require("@/assets/startpoint.png"),
                    iconSize: [24, 24]
                })
            };
            let endPoint = {
                position: end,
                visible: true,
                draggable: false,
                icon: L.icon({
                    iconUrl: require("@/assets/endpoint.png"),
                    iconSize: [24, 24]
                })
            };
            vm.map.markers.push(startPoint);
            vm.map.markers.push(endPoint);
        },
        /**
         * 高亮选中的轨迹
         * @param tripId
         */
        trackHighlight(tripId) {
            let vm = this;
            vm.$set(vm.map.polyLines[tripId], "strokeColor", "#00c3ff");

            if (
                vm.$refs[`polyline_${tripId}`] &&
                vm.$refs[`polyline_${tripId}`][0]
            )
                vm.$refs[`polyline_${tripId}`][0].getInstance().bringToFront();

            let point = vm.map.polyLines[tripId];
            if (point.path.length == 0) {
                return;
            }
            vm.renderStartAndEndPoint(
                point.path[0],
                point.path[point.path.length - 1]
            );
        },
        /**
         * 清除高亮轨迹
         * @param tripId
         */
        clearTrackHighlight(tripId) {
            let vm = this;
            vm.$set(vm.map.polyLines[tripId], "strokeColor", "#b3b3b3");

            if (vm.$refs[`polyline_${tripId}`][0])
                vm.$refs[`polyline_${tripId}`][0].getInstance().bringToBack();

            vm.$set(vm.map, "markers", []);
        },
        loadTrack(tripId) {
            let vm = this;
            return new Promise(function(resolve, reject) {
                vm
                    .getTrack(tripId)
                    .then(function(response) {
                        let track = response.data.data;
                        vm.cacheTracks[tripId] = track;
                        vm.renderTrack(track);
                        if (
                            !track ||
                            !track.track ||
                            track.track.length == 0 ||
                            !track.beginGps ||
                            !track.endGps
                        ) {
                            vm.$emit("bad-trip", tripId);
                        }
                        resolve(response.data.data);
                    })
                    .catch(function(error) {
                        if (axios.isCancel(error)) {
                        } else {
                            let errorCount = vm.handleError[tripId]
                                ? vm.handleError[tripId]
                                : 0;
                            vm.$set(vm.handleError, tripId, ++errorCount);
                            if (errorCount < 3) {
                                vm.loadTrack(tripId);
                            } else {
                                delete vm.handleError[tripId];
                                reject(tripId);
                            }
                        }
                        resolve();
                    });
            });
        },
        renderTrack(track) {
            let vm = this;
            let path = [];
            vm.$set(vm.tracks, track.tripId, track);
            // vm.tracks[track.tripId] = track;
            vm.loadPercentage += 1 / vm.map.shownTripIds.length * 100;

            let points = track.track;
            if (points) {
                for (let i = 0; i < points.length; i++) {
                    let gps = new Gps(points[i].longitude, points[i].latitude);
                    if (gps.isIllegal()) continue;
                    path.push(gps.transform().toReArray());
                }
                vm.$set(vm.map.polyLines, track.tripId, {
                    path: path,
                    strokeColor: "#b3b3b3"
                });

                vm.$nextTick(() => {
                    let map = vm.$refs.map;
                    let fullBounds = vm.getFullBounds();
                    if (
                        map &&
                        map.$children.length > 1 &&
                        fullBounds.isValid()
                    ) {
                        map.getInstance().fitBounds(fullBounds);
                    }
                });
            }
        },
        getTrack(tripId) {
            let vm = this;
            let source = axios.CancelToken.source();
            source.token.throwIfRequested = source.token.throwIfRequested;
            vm.cancelTokenSources.push(source);
            source.token.promise.then(() => {}).catch(() => {});
            return vm.SaaSApi.getTrip(tripId, vm.vehicleId, {
                cancelToken: source.token,
                disabledGlobalErrorHandler: true
            });
        },
        trackLoadSwitch(val) {
            let vm = this;
            for (let i = 0; i < val.length; i++) {
                let tripId = val[i];
                if (!vm.cacheTracks[tripId]) {
                    if (window.Worker) {
                        vm.loadTrackWithWorker(tripId);
                    } else {
                        vm.loadTrack(tripId);
                    }
                } else {
                    vm.renderTrack(vm.cacheTracks[tripId]);
                }
            }
        },
        loadTrackWithWorker(tripId) {
            let vm = this;
            let vehicle_id = vm.vehicleId;
            vm.workerList = [];
            function createWorker(tripId) {
                let worker = new TripWorker();
                vm.workerList.push(worker);
                worker.postMessage({
                    vehicle_id,
                    trip_id: tripId,
                    token: vm.loginInfo.token.token
                });
                worker.onmessage = e => {
                    if (e.data === null) return;
                    let track = e.data;
                    vm.cacheTracks[tripId] = track;
                    vm.renderTrack(track);
                    if (
                        !track ||
                        !track.track ||
                        track.track.length == 0 ||
                        !track.beginGps ||
                        !track.endGps
                    ) {
                        vm.$emit("bad-trip", tripId);
                    }
                    worker.terminate();
                };
            }

            createWorker(tripId);
        },
        clearWorker() {
            let vm = this;
            console.log(vm.workerList);
            if (vm.workerList && vm.workerList.length) {
                for (let i = 0, l = vm.workerList.length - 1; i < l; i++) {
                    vm.workerList[i] && vm.workerList[i].terminate();
                }
            }
        }
    }
};
</script>

<style scoped lang="scss">
.el-vue-amap-container {
    .el-vue-amap {
        width: 100%;
    }
}

.map-wrap {
    height: 100%;
    box-sizing: border-box;
    position: relative;
}

.progress-wrap {
    position: absolute;
    z-index: 1000;
    bottom: 0;
    width: 100%;
}
</style>

<style scoped>
/*@formatter:off*/

#map-container >>> .path-rover {
    position: absolute;
    border-radius: 5px;
    background-color: red;
    width: 10px;
    height: 10px;
}
/*@formatter:on*/
</style>
