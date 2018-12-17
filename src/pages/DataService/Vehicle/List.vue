<template>
    <div class="page">
        <Breadcrumb></Breadcrumb>
        <el-row type="flex" :gutter="20">
            <el-col :span="15">
                <vehicle-list-map
                    :map="map"
                    :vehicles.sync="vehicles"
                    :routeParams="routeParams"
                    :refreshCountDown="refreshCountDown"
                ></vehicle-list-map>
            </el-col>
            <el-col :span="9">
                <el-form inline class="form-filter"
                         @submit.native.prevent="handleFilter">
                    <el-form-item>
                        <el-row :gutter="6">
                            <el-col :span="18">
                                <el-tooltip class="item" effect="dark" :content="inputLocal('fuzzyQuery')"
                                            placement="top">
                                    <el-input v-model="filter.value" class="input-with-select"
                                              size="small">
                                        <el-select v-model="filter.type" slot="prepend"
                                                   :placeholder="inputLocal('choose')">
                                            <el-option :label="inputLocal('plateNum')"
                                                       value="plate_num"></el-option>
                                            <el-option :label="inputLocal('devicesn')"
                                                       value="device_sn"></el-option>
                                        </el-select>
                                    </el-input>
                                </el-tooltip>
                            </el-col>

                            <el-col :span="6">
                                <el-button type="primary"
                                           native-type='submit'
                                           size="mini"
                                           plain
                                           icon="el-icon-search"> {{$t('search')}}
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </el-form>
                <el-container>
                    <vehicle-list-list
                        :vehicles="vehicles"
                        @current-vehicle-changed="handleCurrentVehicleChange"
                        :routeParams="routeParams"
                    ></vehicle-list-list>
                    <el-footer>
                        <div class="bottom">
                            <el-pagination
                                background
                                layout="prev, pager, next"
                                :total="filter.total"
                                :page-size="filter.pageSize"
                                :current-page.sync="filter.page"
                                @current-change="handlePageChange">
                            </el-pagination>
                        </div>
                    </el-footer>
                </el-container>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import Gps from "@/utils/gps";
    import Breadcrumb from "@/components/Breadcrumb";

    import VehicleListMap from "./List/Map";
    import VehicleListList from "./List/List";

    export default {
        name: "VehicleList",
        components: {
            Breadcrumb,
            VehicleListMap,
            VehicleListList
        },
        props: {
            routeParams: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                vehicles: [],
                isDeactivated: false,
                refreshCountDownHandle: null,
                refreshCountDown: 30,
                map: {
                    current: null,
                    window: {
                        position: [0, 0],
                        content: "",
                        visible: false,
                        info: {
                            address: "",
                            sampled_at: "",
                            speed: ""
                        }
                    },
                    fastChangeHandle: null,
                    cluster: null
                },
                filter: {
                    type: "plate_num",
                    value: "",
                    page: 1,
                    pageSize: 20,
                    total: 0
                }
            };
        },
        created() {
            this.renderPage();

            this.importFontpack("DataService/VehiclesList");
        },
        activated() {
            if (this.isDeactivated) {
                this.refreshLatestGps();
                this.isDeactivated = false;
            }
        },
        deactivated() {
            this.isDeactivated = true;
            clearInterval(this.refreshCountDownHandle);
        },
        beforeDestroy() {
            clearInterval(this.refreshCountDownHandle);
        },
        methods: {
            getVehicles() {
                let vm = this;
                return vm.SaaSApi.getVehicles(
                    this.currentCompany.id,
                    vm.filter.type == "plate_num" ? vm.filter.value : "",
                    vm.filter.type == "device_sn" ? vm.filter.value : "",
                    ["devices", "predict_load", "real_time_gps"],
                    vm.filter.page,
                    vm.filter.pageSize
                );
            },
            renderPage() {
                let vm = this;
                vm.showLoadingInc();
                vm.getVehicles().then(response => {
                    vm.hideLoadingInc();
                    let data = response.data.data;
                    vm.filter.total = data.total;
                    let list = data.list;
                    let vehicles = list.map(v => {
                        v.latestGpsEntity = null;
                        v.angle = 0;
                        if (v.latestGps) {
                            let gps = new Gps(
                                v.latestGps.longitude,
                                v.latestGps.latitude
                            );
                            v.latestGpsEntity = gps.isIllegal()
                                ? null
                                : gps.transform().toReArray();
                            v.angle = v.latestGps.direction || 0;
                        }
                        v.isLocked = false;
                        v.isHover = false;
                        v.isHide = false;
                        return v;
                    });
                    //     .sort((a, b) => {
                    //     // return vm.$moment(b.latestGps.sampled_at).unix() - vm.$moment(a.latestGps.sampled_at).unix();
                    // });
                    vm.$set(vm.$data, "vehicles", vehicles);
                    vm.$nextTick(() => {
                        vm.refreshLatestGps();
                    })
                });
            },
            /**
             * 刷新最新位置
             */
            refreshLatestGps() {
                let vm = this;
                vm.refreshCountDownHandle = setInterval(() => {
                    if (vm.refreshCountDown > 0) {
                        vm.refreshCountDown--;
                    } else {
                        clearInterval(vm.refreshCountDownHandle);
                        let devices = _.map(vm.vehicles, (v) => {
                            if (!v.extraDevice) return null;
                            return v.extraDevice.deviceId;
                        });
                        devices = _.filter(_.uniq(devices), (v) => {
                            return v;
                        });

                        vm.SaaSApi.getDeviceLatestPointMulti(devices).then(response => {
                            let data = response.data.data;
                            vm.vehicles.map((v, k) => {
                                if (v.extraDevice && data[v.extraDevice.deviceId]) {
                                    let tmp = data[v.extraDevice.deviceId];
                                    let gps = new Gps(tmp.longitude, tmp.latitude);
                                    vm.$set(vm.vehicles[k], 'latestGps', tmp);
                                    vm.$set(vm.vehicles[k], 'latestGpsEntity', gps.isIllegal()
                                        ? null
                                        : gps.transform().toReArray());

                                    vm.$set(vm.vehicles[k], 'angle', tmp.direction || 0);
                                } else {
                                    vm.$set(vm.vehicles[k], 'latestGpsEntity', null);
                                }
                            });
                        }).catch(error => {
                        }).finally(() => {
                            vm.refreshCountDown = 30;
                            vm.$nextTick(() => {
                                vm.refreshLatestGps();
                            });
                        });
                    }
                }, 1000);
            },
            handleFilter() {
                let vm = this;
                vm.renderPage();
            },
            handlePageChange() {
                let vm = this;
                vm.$nextTick(() => {
                    vm.renderPage();
                });
            },
            handleCurrentVehicleChange(vehicle) {
                this.$set(this.map, "current", vehicle);
            }
        }
    };
</script>

<style scoped lang="scss">
    .el-row--flex {
        height: 100%;
    }

    .strokeBtn {
        background: transparent;
        color: #409eff;
        padding: 7px 15px;
        &:hover {
            background-color: #157bfb;
        }
    }

    .el-container {
        height: calc(100% - 50px);
        border: 1px solid #e7ebf0;
    }

    .el-header {
        background: #fff;
        border-bottom: 1px solid #e7ebf0;
    }

    .el-footer {
        height: 40px !important;
        margin-top: 5px;
        padding-top: 5px;
        text-align: center;
        background: #fff;
        box-sizing: border-box;
    }
</style>
