<template>
    <div class="page">
        <Breadcrumb></Breadcrumb>
        <trip-detail-content v-if="trip"
                             :trip="trip"
                             :route-params="routeParams"
                             @render-complete="isNotComplete = false"
                             ref="content"></trip-detail-content>
        <div class="cover"
             v-if="isNotComplete">
            <div class="box">
                <span class="big-load">Loading....</span>
                <el-progress :text-inside="true"
                             :stroke-width="17"
                             :percentage="percentageShow"></el-progress>
            </div>
        </div>
    </div>
</template>

<script>
import _ from "lodash";
import axios from "axios";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import TripWorker from "./Detail/Trip.worker.js";
import Breadcrumb from "@/components/Breadcrumb.vue";
import TripDetailContent from "./Detail/Content.vue";
import CustomizedMixin from "@/mixins/customized-component";

const MAX_PAGE_SIZE = 1000;
const tripWorker = new TripWorker();

export default {
    name: "trip-merge",
    components: { Breadcrumb, TripDetailContent },
    mixins: [CustomizedMixin],
    data() {
        return {
            trip: null,
            vehicleId: null,
            query: {
                startTime: null,
                endTime: null
            },
            trips: [],
            percentage: 0,
            percentageShow: 0,
            isNotComplete: true,
            cancelTokenSources: []
        };
    },
    computed: {
        ...mapState({
            loginInfo: state => state.loginInfo
        }),
        beginTrip() {
            return this.trips.length > 0 ? this.trips[0] : null;
        },
        endTrip() {
            return this.trips.length > 0
                ? this.trips[this.trips.length - 1]
                : null;
        }
    },
    created() {
        this.importFontpack("Public/TripDetail");
        this.init();
    },
    beforeDestroy() {
        for (let i = 0; i < this.cancelTokenSources.length; i++) {
            let current = this.cancelTokenSources[i];
            if (typeof current.cancel == "function") {
                current.cancel();
            }
        }
        this.clearWorker();
    },
    deactivated() {
        this.clearWorker();
    },
    // watch: {
    //     "percentage": function (val) {
    //         if (val) {
    //             this.percentageShow = Math.round(val * 10) / 10;
    //         }
    //     },
    // },
    methods: {
        init() {
            let vm = this;
            vm
                .getTripList()
                .then(res => {
                    if (
                        res.status &&
                        res.data &&
                        res.data.data.list.length > 0
                    ) {
                        if (window.Worker) {
                            vm.handleTrip(res.data.data.list);
                        } else {
                            vm.getTripsDetail(res.data.data.list);
                        }
                    } else {
                        vm.percentage = 100;
                        vm.noTrackAlert();
                    }
                })
                .catch(err => console.log(err));
        },

        handleTrip(tripList) {
            let vm = this;
            // let len = tripList.length - 1;
            let trips = [];
            vm.workerList = [];
            // console.log(tripList.length);
            function createWorker({ tripId, begin_gps, end_gps }) {
                // if (begin_gps === null || end_gps === null) return;
                let worker = new TripWorker();
                vm.workerList.push(worker);
                worker.postMessage({
                    vehicle_id: vm.vehicleId,
                    trip_id: tripId,
                    token: vm.loginInfo.token.token
                });
                worker.onmessage = e => {
                    trips.push(e.data);
                    vm.percentage += 1 / tripList.length * 100;
                    vm.percentageShow = Math.round(vm.percentage);
                    // console.log(vm.percentageShow)
                    // vm.percentage = trips.length / len * 100;
                    if (vm.percentageShow >= 100) {
                        vm.trips = _.sortBy(trips.filter(a => a !== null), [
                            t => t.beginTime
                        ]);
                        vm.$nextTick(() => {
                            vm.setTripInfo();
                        });
                    }
                    worker.terminate();
                };
            }

            for (let i = 0; i < tripList.length; i++) {
                createWorker(tripList[i]);
            }
        },
        /**
         * 获取行程列表
         * @return {*}
         */
        getTripList() {
            let vm = this;
            vm.query.startTime = vm.$route.query.from;
            vm.query.endTime = vm.$route.query.to;
            vm.vehicleId = vm.$route.params.vehicle_id;

            return vm.SaaSApi.getTripList(
                vm.vehicleId,
                vm.query.startTime,
                vm.query.endTime,
                1,
                MAX_PAGE_SIZE
            );
        },
        async getTripsDetail(data) {
            let vm = this;
            //过滤不合法行程
            data = data.filter(a => {
                if (a.begin_gps === null || a.end_gps === null) {
                    return false;
                }
                return true;
            });
            let tripIds = data.map(a => a.tripId);
            try {
                let trips = await vm.getTracks(tripIds);
                vm.trips = _.sortBy(trips, [t => t.beginTime]);
            } catch (err) {
                console.log(err);
            }

            vm.$nextTick(() => {
                console.log(`结束时间:${Date.now()}`);
                vm.setTripInfo();
            });
        },
        async getTracks(tripIds) {
            let vm = this;
            let index = 0;
            let errArr = {};
            let trips = [];
            let max = tripIds.length - 1;

            async function _loop() {
                if (index > max) return;
                let id = tripIds[index];
                try {
                    let res = await vm.getTrip(id);
                    if (res.data.status) {
                        trips.push(res.data.data);
                        index++;
                        // 设置进度
                        let percentage = Math.ceil(index / max * 100);
                        vm.percentage = percentage < 100 ? percentage : 100;
                        await _loop();
                    }
                } catch (err) {
                    let count = errArr[id] ? errArr[id] : 0;
                    if (axios.isCancel(err)) return;
                    if (count < 3) {
                        errArr[id] = count + 1;
                        await _loop();
                    } else {
                        index++;
                        // 设置进度
                        let percentage = Math.ceil(index / max * 100);
                        vm.percentage = percentage < 100 ? percentage : 100;
                        await _loop();
                    }
                }
            }

            await _loop();
            return trips;
        },
        getTrip(tripId) {
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
        noTrackAlert() {
            let vm = this;
            vm.$alert(vm.inputLocal("noTrack"), {
                confirmButtonText: vm.inputLocal("sure"),
                callback: action => {
                    vm.$router.go(-1);
                }
            });
        },
        /**
         * 构建虚拟trip对象
         */
        setTripInfo() {
            let vm = this;
            let polymer = vm.trips.reduce(
                (p, v) => {
                    return {
                        duration: p.duration + v.duration,
                        mileage: p.mileage + v.mileage,
                        // event_count: p.event_count + v.event_count,
                        events: _.mergeWith(
                            p.events,
                            v.events,
                            (objValue, srcValue) => {
                                if (_.isArray(objValue)) {
                                    return objValue.concat(srcValue);
                                }
                            }
                        ),
                        track: p.track.concat(v.track)
                    };
                },
                {
                    duration: 0,
                    mileage: 0,
                    // event_count: 0,
                    events: {},
                    track: []
                }
            );

            //过滤轨迹超出的部分
            polymer.track = _.filter(polymer.track, v => {
                return (
                    v.sampled_at &&
                    vm
                        .$moment(vm.query.startTime)
                        .isSameOrBefore(vm.$moment(v.sampled_at)) &&
                    vm
                        .$moment(vm.query.endTime)
                        .isSameOrAfter(vm.$moment(v.sampled_at))
                );
            });

            //过滤超出部分事件
            polymer.events = _.mapValues(polymer.events, event =>
                _.filter(
                    event,
                    v =>
                        v.revised_at &&
                        vm
                            .$moment(vm.query.startTime)
                            .isSameOrBefore(vm.$moment(v.revised_at)) &&
                        vm
                            .$moment(vm.query.endTime)
                            .isSameOrAfter(vm.$moment(v.revised_at)) &&
                        (v.badFlag != 6 || v.duration >= 300)
                )
            );

            //这里增加每个行程间隔作为新的停驶事件
            for (let i = 0; i < vm.trips.length; i++) {
                if (vm.trips[i + 1]) {
                    if (!polymer.events[6]) polymer.events[6] = [];
                    let event = {
                        badFlag: "6",
                        created_at: vm
                            .$moment(vm.trips[i].endTime)
                            .format("YYYY-MM-DDTHH:mm:ssZZ"),
                        duration: vm
                            .$moment(vm.trips[i + 1].beginTime)
                            .diff(vm.$moment(vm.trips[i].endTime), "seconds"),
                        id: null,
                        revised_at: vm
                            .$moment(vm.trips[i].endTime)
                            .format("YYYY-MM-DDTHH:mm:ssZZ"),
                        trigger_gps: vm.trips[i].endGps,
                        trip: {
                            id: null
                        },
                        vehicle: {
                            id: vm.vehicleId
                        }
                    };
                    polymer.events[6].push(event);
                    polymer.event_count++;
                }
            }
            if (polymer.track.length <= 0) {
                vm.noTrackAlert();
            }

            //这里增加每个行程间隔作为新的停驶事件
            for (let i = 0; i < vm.trips.length; i++) {
                if (vm.trips[i + 1]) {
                    if (!polymer.events[6]) polymer.events[6] = [];
                    let event = {
                        badFlag: "6",
                        created_at: vm
                            .$moment(vm.trips[i].endTime)
                            .format("YYYY-MM-DDTHH:mm:ssZZ"),
                        duration: vm
                            .$moment(vm.trips[i + 1].beginTime)
                            .diff(vm.$moment(vm.trips[i].endTime), "seconds"),
                        id: null,
                        revised_at: vm
                            .$moment(vm.trips[i].endTime)
                            .format("YYYY-MM-DDTHH:mm:ssZZ"),
                        trigger_gps: vm.trips[i].endGps,
                        trip: {
                            id: null
                        },
                        vehicle: {
                            id: vm.vehicleId
                        }
                    };
                    polymer.events[6].push(event);
                    polymer.event_count++;
                }
            }

            //过滤超出部分事件
            polymer.events = _.mapValues(polymer.events, event =>
                _.filter(
                    event,
                    v =>
                        v.revised_at &&
                        vm
                            .$moment(vm.query.startTime)
                            .isSameOrBefore(vm.$moment(v.revised_at)) &&
                        vm
                            .$moment(vm.query.endTime)
                            .isSameOrAfter(vm.$moment(v.revised_at))
                )
            );

            let beginPoint = polymer.track[0];
            let endPoint = polymer.track[polymer.track.length - 1];
            vm.$set(vm.$data, "trip", {
                averageAltitude: null,
                averageSpeed: Math.round(
                    polymer.mileage / polymer.duration * 3.6
                ),
                beginAddress: null,
                beginGps: beginPoint
                    ? `${beginPoint.longitude},${beginPoint.latitude}`
                    : null,
                beginTime: beginPoint ? beginPoint.sampled_at : null,
                deviceId: vm.beginTrip ? vm.beginTrip.deviceId : null,
                driver: vm.beginTrip ? vm.beginTrip.driver : null,
                duration: polymer.duration,
                endAddress: null,
                endGps: endPoint
                    ? `${endPoint.longitude},${endPoint.latitude}`
                    : null,
                endTime: endPoint ? endPoint.sampled_at : null,
                event_count: _.reduce(
                    polymer.events,
                    (result, value) => {
                        return result + value.length;
                    },
                    0
                ),
                events: polymer.events,
                mileage: polymer.mileage,
                plateNum: vm.beginTrip ? vm.beginTrip.plateNum : null,
                vehicleId: vm.vehicleId,
                tripId: "merge",
                track: _.sortBy(polymer.track, [
                    function(t) {
                        return t.sampled_at;
                    }
                ]),
                isDriving: false
            });
        },
        clearWorker() {
            let vm = this;
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
.cover {
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 1001;
    background: rgba(255, 255, 255, 0.9);
    .box {
        width: 70%;
        transform: translateX(-50%);
        position: absolute;
        top: 50%;
        left: 50%;
        text-align: center;
    }
    .big-load {
        font-size: 32px;
        color: #999;
        display: inline-block;
        margin-bottom: 20px;
    }
}
</style>
