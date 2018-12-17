<template>
    <div class="page">
        <Breadcrumb></Breadcrumb>
        <trip-detail-by-trip-id
            :trip-id="tripId"
            :vehicle-id="vehicleId"
            v-if="tripId && vehicleId"
            :route-params="routeParams"
        ></trip-detail-by-trip-id>
    </div>
</template>

<script>
    import Breadcrumb from "@/components/Breadcrumb.vue";
    import TripDetailByTripId from "./DetailByTripId.vue";
    import CustomizedMixin from "@/mixins/customized-component";

    export default {
        components: {
            Breadcrumb,
            TripDetailByTripId
        },
        mixins: [CustomizedMixin],
        data() {
            return {
                tripId: null,
                vehicleId: null
            }
        },
        created() {
            let vm = this;
            vm.tripId = vm.$route.params.trip_id;
            vm.vehicleId = vm.$route.params.vehicle_id;
        }
    }
</script>
