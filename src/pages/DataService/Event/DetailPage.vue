<template>
    <div class="page">
        <Breadcrumb :data="bread"></Breadcrumb>
        <el-card class="tab-container" v-if="event">
            <el-tabs v-model="currentTab">
                <el-tab-pane :label="`${inputLocal('deviceinfo')}${event.vehicle.id ? '' : (inputLocal('nothing'))}`"
                             name="vehicle"
                             v-if="!isActionBanned(RoleActions.VehicleDetail)"
                             :disabled="!event || !event.vehicle.id || isActionBanned(RoleActions.VehicleDetail)">
                </el-tab-pane>
                <el-tab-pane :label="inputLocal('eventanalysis')" name="event"
                             v-if="!isActionBanned(RoleActions.EventDetail)"
                             :disabled="!event || isActionBanned(RoleActions.EventDetail)">
                </el-tab-pane>
                <el-tab-pane
                    :label="`${inputLocal('correspondingtrip')}${event.trip.id ? '' : (inputLocal('nothing'))}`"
                    name="trip"
                    v-if="!isActionBanned(RoleActions.TripDetail)"
                    :disabled="!event || !event.trip.id || isActionBanned(RoleActions.TripDetail)">
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <keep-alive>
            <el-card v-if="!isActionBanned(RoleActions.VehicleDetail) &&
                     event &&
                     event.vehicle.id &&
                     currentTab == 'vehicle'">
                <vehicle-detail :vehicle-id="event.vehicle.id"></vehicle-detail>
            </el-card>
        </keep-alive>
        <keep-alive>
            <event-detail v-if="!isActionBanned(RoleActions.EventDetail) &&
                event &&
                currentTab == 'event'"
                :event="event"
            >
            </event-detail>
        </keep-alive>
        <keep-alive>
            <trip-detail-by-trip-id v-if="!isActionBanned(RoleActions.TripDetail) &&
                event &&
                event.trip.id &&
                event.vehicle.id &&
                currentTab == 'trip'"
                :trip-id="event.trip.id"
                :vehicle-id="event.vehicle.id"
                :routeParams="routeParams"
            />
        </keep-alive>
    </div>
</template>

<script>
import Breadcrumb from "@/components/Breadcrumb";
import EventDetail from "./Detail";
import TripDetailByTripId from "@/pages/Public/Trip/DetailByTripId";
import VehicleDetail from "@/components/VehicleDetail";

import * as types from "@/store/types";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import { EVENT_TYPE } from "@/consts";

export default {
    components: {
        VehicleDetail,
        Breadcrumb,
        EventDetail,
        TripDetailByTripId
    },
    data() {
        return {
            vehicleId: null,
            eventId: null,
            event: null,
            isEmergency: false,
            currentTab: "event",
            bread: [],
            routeParams: {
                features: {
                    events: ["1", "2", "3", "4", "5", "6", "7"]
                }
            }
        };
    },
    created() {
        let vm = this;

        //@todo 没有vehicleId的情况
        vm.vehicleId = vm.$route.query.vehicle_id;
        vm.eventId = vm.$route.params.event_id;
        vm.importFontpack("DataService/Event/DetailPage");
    },
    mounted() {
        let vm = this;
        vm.showLoadingInc();
        vm.SaaSApi.getEvent(vm.eventId, vm.vehicleId).then(response => {
            vm.hideLoadingInc();
            vm.event = response.data.data;
            // if (EVENT_TYPE.EMERGENCY[vm.event.type]) {
            //     vm.isEmergency = true;
            // }
            // vm.$nextTick(() => {
            //     vm.doPageEnv();
            // })
        });
    },
    beforeDestroy() {
        this.$el.querySelectorAll("canvas").forEach(c => {
            c.remove();
        });
    },
    beforeRouteLeave(to, from, next) {
        // window.location = `${to.path}?vehicle_id=${to.query.vehicle_id}`
        // window.location.href = `${to.path}`;
        next();
    },
    methods: {
        // ...mapMutations({
        //     setAsideActiveIndex: types.global.mutations.SET_ASIDE_ACTIVE_INDEX
        // }),
        // doPageEnv() {
        //     let vm = this;
        //     let refUrl = '/events/type/' + (vm.isEmergency ? 'emergency' : 'normal');
        //     vm.setAsideActiveIndex(refUrl);
        //     vm.bread = ['/', refUrl];
        // },
        // getEventEntity() {
        //     let vm = this;
        //     return vm.SaaSApi.getEvent(vm.eventId, vm.vehicleId)
        // },
    }
};
</script>

<style scoped lang="scss">
.tab-container {
    padding-left: 20px;
    .tab-items {
        margin-bottom: 0;
    }
}

.el-col {
    .info-header {
        margin-bottom: 20px;
    }
}
</style>
