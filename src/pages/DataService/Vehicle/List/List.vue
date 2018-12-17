<template>
    <el-main style="padding: 0">
        <div class="list-wrapper">
            <ul class="hb-list">
                <li v-for="(vehicle,i) in vehicles" :key="vehicle.vehicleId"
                    :class="{'lock-hover': vehicle.isLocked, 'list-hover': vehicle.isHover}"
                    v-show="!vehicle.isHide"
                    @mouseenter="handleListMouseEnter(i)"
                    @mouseleave="handleListMouseLeave(i)">
                    <el-row>
                        <el-col :span="6" :lg="5" :xl="5">
                            <small>{{ vehicle.plateNum | defaults(inputLocal('noplatenum')) }}</small>
                            <small>
                                <i class="fas fa-user-circle fa-fw hidden-md-and-down"></i>
                                {{ vehicle.driver | defaults(inputLocal('nodriver')) }}
                            </small>
                        </el-col>
                        <el-col :span="2">
                        </el-col>
                        <el-col :span="6" :lg="6" :xl="6" :offset="2">
                            <small>{{ vehicle.bindDevice | defaults(inputLocal('nodev')) }}</small>
                            <small v-title:15="vehicleUseType[vehicle.useType]"
                                   :data-default="inputLocal('unknowntype')">
                            </small>
                        </el-col>
                        <el-col :span="8" :lg="10" :xl="10">
                            <small>
                                <span v-if="vehicle.latestGps && vehicle.latestGps.sampled_at">
                                    {{ vehicle.latestGps.sampled_at | formatDateTime | defaults('') }}</span>
                                <span v-else>{{$t('noneGps')}}</span>
                            </small>
                            <a href="javascript:;" @click="getPoiEvents(vehicle.bindDevice)"
                               style="width: 10px;height: 10px;background-color: #fff;border-radius: 50%;position: absolute;display: block;"></a>

                            <div class="icon-position hidden-md-and-down"
                                 v-show="vehicle.isLocked || vehicle.isHover"
                                 @click="toggleLock(i)">
                                <i class="fas fa-thumbtack"
                                   :class="{'lock-icon': vehicle.isLocked, 'unlock-icon': !vehicle.isLocked}"></i>
                            </div>

                            <el-button-group class="hidden-md-and-down" v-if="!hasNoButtons">
                                <el-button
                                    plain size="mini" type="primary"
                                    v-if="hasTripButton && !isActionBanned(RoleActions.TripList)"
                                    :disabled="isActionBanned(RoleActions.TripList)"
                                    @click="$router.push({
                                        path: `vehicles/${vehicle.vehicleId}/trips`
                                    })">{{$t('trips')}}
                                </el-button>
                                <el-button
                                    plain size="mini" type="primary"
                                    v-if="hasPositionButton"
                                    @click="$router.push({
                                        path: `vehicles/${vehicle.vehicleId}/devices/${vehicle.bindDevice}/position`,
                                    })">{{$t('position')}}
                                </el-button>
                                <el-button
                                    plain size="mini" type="primary"
                                    v-if="hasRiskButton"
                                    @click="$router.push({
                                        path: `vehicles/${vehicle.vehicleId}/risk`,
                                    })">{{$t('risk')}}
                                </el-button>
                            </el-button-group>
                            <div class="icon-position-hd hidden-lg-and-up"
                                 v-show="vehicle.isLocked || vehicle.isHover"
                                 @click="toggleLock(i)">
                                <i class="fas fa-thumbtack"
                                   :class="{'lock-icon': vehicle.isLocked, 'unlock-icon': !vehicle.isLocked}"></i>
                            </div>
                            <el-dropdown class="hidden-lg-and-up" v-if="!hasNoButtons">
                                <el-button plain size="mini" type="primary">
                                    <i class="fal fa-angle-down fa-fw"></i>
                                </el-button>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item
                                        v-if="hasTripButton && !isActionBanned(RoleActions.TripList)"
                                        :disabled="isActionBanned(RoleActions.TripList)"
                                        @click.native="$router.push({
                                            path: `vehicles/${vehicle.vehicleId}/trips`
                                        })">{{$t('trips')}}
                                    </el-dropdown-item>
                                    <el-dropdown-item
                                        v-if="hasPositionButton"
                                        @click.native="$router.push({
                                            path: `vehicles/${vehicle.vehicleId}/devices/${vehicle.bindDevice}/position`,
                                        })">{{$t('position')}}
                                    </el-dropdown-item>
                                    <el-dropdown-item
                                        v-if="hasRiskButton"
                                        @click.native="$router.push({
                                            path: `risk/vehicles/${vehicle.vehicleId}`,
                                        })">{{$t('risk')}}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </el-col>
                    </el-row>
                </li>
            </ul>
        </div>
    </el-main>

</template>

<script>
    import {VEHICLE_USE_TYPE} from "@/consts";
    import CustomizedMixin from "@/mixins/customized-component";

    export default {
        name: "vehicle-list-list",
        props: {
            vehicles: {
                required: true,
                type: Array
            }
        },
        mixins: [CustomizedMixin],
        data() {
            return {
                vehicleUseType: VEHICLE_USE_TYPE
            };
        },
        computed: {
            hasNoButtons() {
                return (
                    !this.hasTripButton &&
                    !this.hasPositionButton &&
                    !this.hasRiskButton
                );
            },
            hasTripButton() {
                return this.hasFeature("trips");
            },
            hasPositionButton() {
                return this.hasFeature("position");
            },
            hasRiskButton() {
                return this.hasFeature("risk");
            }
        },
        created() {
            this.importFontpack("DataService/VehiclesList");
            // this.vehicleUseType = this.inputLocal("vehicleUseType");
        },
        activated() {
            this.importFontpack("DataService/VehiclesList");
        },
        methods: {
            /**
             * 切换锁定
             * @param index
             */
            toggleLock(index) {
                let vm = this;
                vm.$set(
                    vm.vehicles[index],
                    "isLocked",
                    !vm.vehicles[index].isLocked
                );
            },
            /**
             * 鼠标移入
             * @param index
             */
            handleListMouseEnter(index) {
                let vm = this;
                let vehicle = vm.vehicles[index];
                if (
                    vehicle.latestGps &&
                    vehicle.latestGps.sampled_at
                ) {
                    vm.$set(vm.vehicles[index], "isHover", true);
                    vm.$emit("current-vehicle-changed", vehicle);
                }
            },
            /**
             * 鼠标移出
             * @param index
             */
            handleListMouseLeave(index) {
                let vm = this;
                let vehicle = vm.vehicles[index];
                if (
                    vehicle.latestGps &&
                    vehicle.latestGps.sampled_at
                ) {
                    vm.$set(vm.vehicles[index], "isHover", false);
                    vm.$emit("current-vehicle-changed", null);
                }
            },
            /**
             * 鼠标点击
             * @param index
             */
            handleListClick(index) {
                let vm = this;
                let vehicle = vm.vehicles[index];
                vm.$router.push({
                    path: `/vehicles/${vehicle.vehicleId}/trips`
                });
            }
        }
    };
</script>

<style scoped lang="scss">
    .el-row--flex {
        height: 100%;
    }

    @media screen and (max-width: 1399px) {
        section {
            li {
                .el-button {
                    padding: 3px 7px;
                }
            }
        }
    }

    @media screen and (max-width: 1299px) {
        section {
            li {
                font-size: 90%;
            }
        }
    }

    @media screen and (max-width: 1199px) {
        section {
            li {
                font-size: 80%;
                /*.el-button {*/
                /*padding: 3px 10px;*/
                /*}*/
            }
        }
    }

    .fa-thumbtack {
        color: red;
    }

    .lock-icon {
        transform: rotate(0deg);
        -webkit-transform: rotate(0deg); /* Safari 和 Chrome */
    }

    .unlock-icon {
        transform: rotate(90deg);
        -webkit-transform: rotate(90deg); /* Safari 和 Chrome */
    }

    .icon-position {
        display: inline-block;
        width: 30px;
        height: 30px;
        position: absolute;
        z-index: 100;
        top: -8px;
        right: -10px;
        padding-right: 10px;
        cursor: pointer;
    }

    .icon-position-hd {
        width: 30px;
        height: 30px;
        display: inline-block;
        margin-right: 10px;
        cursor: pointer;
    }

    @mixin list-hover {
        color: initial;
        position: relative;
        background-color: #fff;
        box-shadow: 0 2px 5px #ccc;

        .trip-line {
            background: #4ab4f0;
            height: 90%;
            div {
                background: #4ab4f0;
            }
        }
    }

    .hb-list {
        .list-hover:hover {
            @include list-hover;
            .trip-line {
                div {
                    border-radius: 6px;
                    margin-left: -5px;
                    width: 12px;
                    height: 12px;
                }
            }
        }

        .lock-hover {
            @include list-hover;
        }

        li {
            color: #ccc;
            height: 61px;
            background-color: #fafafa;
            padding: 8px 10px;
            border-bottom: 1px solid #e7ebf0;

            .trip-line {
                box-sizing: border-box;
                position: absolute;
                width: 2px;
                height: 100%;
                background-color: #d8d8d8;
                div {
                    width: 10px;
                    height: 10px;
                    background-color: #d8d8d8;
                    border-radius: 8px;
                    margin-left: -4px;
                    color: transparent;
                    transition: all 0.3s;
                    transition-delay: 0.05s;
                    &:first-child {
                        margin-top: -3px;
                    }
                    &:last-child {
                        position: absolute;
                        bottom: -3px;
                    }
                }
            }

            .el-col {
                small {
                    display: inline-block;
                    width: 100%;
                }
                small:first-child {
                    margin-bottom: 10px;
                }
                &:nth-child(2) {
                    text-align: center;
                }
                &:last-child {
                    text-align: right;
                }
            }
        }
    }

    .el-main {
        flex: 1 1 auto;
        display: flex;
        flex-flow: column;
        align-items: stretch;
        overflow-y: scroll;
        height: 400px;
        padding: 0;
    }
</style>
<style scoped>
    /*@formatter:off*/
    .hb-list >>> .el-button--mini {
        padding: 7px 7px;
    }
    /*@formatter:on*/
</style>
