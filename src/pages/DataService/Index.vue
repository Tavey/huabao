<template>
    <div class="page">
        <dashboard :route-params="routeParams" v-if="isShowDashboard"></dashboard>
    </div>
</template>

<script>
    import Dashboard from '@/pages/Dashboard.vue';
    import CustomizedMixin from "@/mixins/customized-component";

    export default {
        mixins: [CustomizedMixin],
        components: {
            Dashboard
        },
        data() {
            return {
                isShowDashboard: false
            }
        },
        watch: {
            //观察是否存在 redirect feature，不存在则使用 Dashboard
            routeParams: {
                handler(val) {
                    if (val) {
                        if (this.hasFeature('redirect')) {
                            this.$router.replace(this.hasFeature('redirect'));
                        } else {
                            this.isShowDashboard = true;
                        }
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style scoped>

</style>
