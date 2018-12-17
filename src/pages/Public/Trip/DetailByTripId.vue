<template>
    <trip-detail-content :trip="trip" v-if="trip" :route-params="routeParams"></trip-detail-content>
</template>

<script>
    import TripDetailContent from "./Detail/Content.vue";
    import CustomizedMixin from "@/mixins/customized-component";

    export default {
        components: {TripDetailContent},
        name: "trip-detail-by-trip-id",
        props: {
            tripId: {
                type: String,
                required: true
            },
            vehicleId: {
                type: String | Number,
                required: true
            }
        },
        mixins: [CustomizedMixin],
        data() {
            return {
                trip: null
            }
        },
        mounted() {
            let vm = this;
            vm.$nextTick(() => {
                vm.showLoadingInc();
                vm.SaaSApi.getTrip(vm.tripId, vm.vehicleId).then(response => {
                    vm.trip = response.data.data;
                    vm.hideLoadingInc();
                });
            });
        }
    }
</script>

<style scoped>

</style>
