<template>
    <el-form label-position="left" inline class="table-expand" v-if="vehicle">
        <el-row :gutter="20">
            <el-col :span="6">
                <el-form-item :label="inputLocal('driverName')">
                    <span>{{ vehicle.driver.name | defaults(inputLocal('notSet')) }}</span>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item :label="inputLocal('driverPhone')">
                    <span>{{ vehicle.driver.mobile | defaults(inputLocal('notSet')) }}</span>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item :label="inputLocal('plateNum')">
                    <span>{{ vehicle.plate_num | defaults(inputLocal('notSet')) }}</span>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item :label="inputLocal('vehicleUseType')">
                    <span>{{ vehicle.use_type_show | defaults(inputLocal('notSet')) }}</span>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="6">
                <el-form-item :label="inputLocal('vehicleBrand')">
                    <span>{{ vehicle.brand_name | defaults(inputLocal('notSet')) }}</span>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item :label="inputLocal('vehicleModel')">
                    <span>{{ vehicle.model_id | defaults(inputLocal('notSet')) }}</span>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="inputLocal('registerTime')">
                    <span>{{ vehicle.created_at | formatDateTime | defaults(inputLocal('notSet')) }}</span>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="6">
                <el-form-item :label="inputLocal('allMile')">
                    <span>{{ vehicle.statistics.total_mile+' km' | defaults(inputLocal('noData'))}}</span>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item :label="inputLocal('allAverageTime')">
                    <span>{{ vehicle.statistics.avg_speed.toFixed(2)+' km/h' | defaults(inputLocal('noData')) }}</span>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="inputLocal('dayAverageTime')">
                    <span>{{ vehicle.statistics.avg_trip+' km' | defaults(inputLocal('noData')) }}</span>
                </el-form-item>
            </el-col>
        </el-row>
        <hr/>
        <el-row :gutter="20">
            <el-col :span="6">
                <el-form-item :label="inputLocal('deviceType')">
                    <span>{{ vehicle.device.type | defaults(inputLocal('noData')) }}</span>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item :label="inputLocal('hardwareType')">
                    <span>{{ vehicle.device.hardware_model | defaults(inputLocal('noData')) }}</span>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item :label="inputLocal('devicesn')">
                    <span>{{ vehicle.device.sn | defaults(inputLocal('noData')) }}</span>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item :label="inputLocal('hardwareVersion')">
                    <span>{{ vehicle.device.hardware_version | defaults(inputLocal('noData')) }}</span>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-form-item :label="inputLocal('deviceTime')">
                    <span>{{ vehicle.device.latest_activated_at | formatDateTime | defaults(inputLocal('noData')) }}</span>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item :label="inputLocal('firmwareType')">
                    <span>{{ vehicle.statistics.firmware_version | defaults(inputLocal('noThing')) }}</span>
                </el-form-item>
            </el-col>
        </el-row>
    </el-form>
</template>

<script>

    export default {
        name: "vehicle-detail",
        props: {
            vehicleProp: {
                type: Object,
                default: null
            },
            vehicleId: {
                type: [String, Number],
                default: null
            }
        },
        data() {
            return {
                vehicle: null
            }
        },
        created() {
            this.importFontpack('Components/VehicleDetail');
        },
        mounted() {
            let vm = this;
            if (!vm.vehicle) {
                if (vm.vehicleProp) {
                    vm.vehicle = vm.vehicleProp;
                } else if (vm.vehicleId) {
                    vm.showLoadingInc();
                    vm.getVehicle().then(response => {

                        vm.hideLoadingInc();
                        vm.vehicle = response.data.data;
                    });
                } else {
                    throw new Error("Can't Do Anything");
                }
            }
        },
        methods: {
            getVehicle() {
                return this.SaaSApi.getVehicle(this.vehicleId);
            }
        }
    }
</script>

<style scoped>

</style>
