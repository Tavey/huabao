<template>
    <hb-map
        ref="map"
        mapId="map-container"
        :options="{
            closePopupOnClick: false
        }"
        @zoom-end="handleMapZoomEnd"
        @move-end="handleMapMoveEnd"
        @mouse-over="handleMapMouseOver"
        @mouse-out="handleMapMouseOut"
    >
        <hb-map-marker
            ref="markers"
            v-for="vehicle in vehicles"
            v-if="vehicle.latestGpsEntity"
            :key="vehicle.id"
            :position="vehicle.latestGpsEntity"
            :options="handleIconOption(100,vehicle)"
            @click="handleMarkerClick(vehicle)"
        ></hb-map-marker>
        <hb-map-marker
            ref="current"
            v-if="map.current && map.current.latestGpsEntity"
            :position="map.current.latestGpsEntity"
            :options="handleIconOption(200,null)"
        ></hb-map-marker>
        <hb-map-marker
            ref="locked"
            v-if="locked && locked.latestGpsEntity"
            v-for="(locked, index) in lockedSet"
            :key="index"
            :position="locked.latestGpsEntity"
            :options="handleIconOption(300,null)"
        ></hb-map-marker>
        <hb-map-popup
            ref="infoWindow"
            :options="{
                zIndexOffset: 1000,
                maxWidth: 'auto'
            }"
            :position="map.window.position"
            :visible="map.window.visible"
            @close="handlePopupClose"
            @click.native="handlePopupClick"
            style="cursor: pointer"
        >
            <window-content
                :windowInfo="map.window.info"
                has-speed
                has-vehicle
                has-device
                has-driver
                v-if="!nodata"
            ></window-content>
        </hb-map-popup>
        <div v-if="hasWidgets">
            <component
                v-for="(widget) in routeParams.widgets.map"
                :is="componentLoader('pages/DataService/Vehicle/List/Widgets', widget)"
                :key="`component-${widget}`">
            </component>
        </div>
        <div v-if="refreshCountDown != null">
            <p style="position: absolute;top: 0;right: 0;z-index: 401;margin-right: 20px">
                <span v-if="refreshCountDown > 0"> {{refreshCountDown}}s {{$t('refreshAfter')}}</span>
                <span v-else>{{$t('refreshNow')}}</span>
            </p>
        </div>
    </hb-map>
</template>

<script>
import Vue from "vue";
import _ from "lodash";
import { CAR_STATUS_ICON, VEHICLE_USE_TYPE } from "@/consts";
import WindowContent from "@/components/WindowContent";
import CustomizedMixin from "@/mixins/customized-component";

export default {
    name: "vehicle-list-map",
    props: {
        map: {
            required: true,
            type: Object
        },
        vehicles: {
            required: true,
            type: Array
        },
        refreshCountDown: {
            type: Number
        }
    },
    mixins: [CustomizedMixin],
    components: {
        WindowContent
    },
    data() {
        return {
            statusIcon: CAR_STATUS_ICON,
            isBoundsFilterable: false,
            nodata: false,
            focusVehicle: null
        };
    },
    computed: {
        hasWidgets() {
            return (
                this.routeParams &&
                this.routeParams.widgets.map &&
                this.routeParams.widgets.map.length > 0
            );
        },
        hasLocked() {
            return this.lockedSet.length > 0;
        },
        lockedSet() {
            return this.vehicles.filter(v => v.isLocked);
        }
    },
    watch: {
        vehicles: {
            handler: function(val, oldVal) {
                let vm = this;
                if (vm.map.markers) vm.map.makers.clearLayers();
                vm.$nextTick(() => {
                    let map = this.$refs.map.getInstance();
                    if (val.length <= 0) {
                        vm.nodata = true;
                        return;
                    }
                    if (vm.focusVehicle) {
                        vm.handleMarkerClick(vm.focusVehicle);
                        return;
                    }
                    if (oldVal.length <= 0) {
                        let bounds = _.filter(
                            _.uniq(val.map(m => m.latestGpsEntity)),
                            v => v
                        );
                        if (bounds.length > 0) {
                            map.fitBounds([val.map(m => m.latestGpsEntity)]);
                        }
                    }
                });
            },
            deep: true
        },
        "map.current"(vehicle) {
            this.handleMarkerClick(vehicle);
        }
    },
    methods: {
        /**
         * 点击车辆图标
         */
        handleMarkerClick(vehicle) {
            let vm = this;
            vm.focusVehicle = vehicle;
            if (vehicle && vehicle.latestGpsEntity) {
                vm.viewFocusCurrent(vehicle);
            } else {
                vm.viewReset();
            }
        },
        /**
         * 关闭信息窗体
         */
        handlePopupClose() {
            this.handleMarkerClick(null);
        },
        /**
         * 点击信息窗体
         */
        handlePopupClick() {
            this.$router.push({
                path: `/vehicles/${this.map.window.vehicle_id}/trips`
            });
        },
        handleMapZoomEnd(event) {
            this.filterVehiclesByBounds();
        },
        handleMapMoveEnd(event) {
            this.filterVehiclesByBounds();
        },
        /**
         * 鼠标移入地图控件，允许缩放移动筛选车辆
         */
        handleMapMouseOver(event) {
            this.isBoundsFilterable = true;
        },
        handleMapMouseOut(event) {
            this.isBoundsFilterable = false;
        },
        /**
         * 右侧列表适应地图边界
         * 如果不在地图边界中，修改vehicle的isHide属性
         */
        filterVehiclesByBounds() {
            let vm = this;
            vm.$nextTick(() => {
                if (vm.isBoundsFilterable) {
                    vm.vehicles.forEach(v => {
                        if (v.latestGpsEntity) {
                            v.isHide = !vm.$refs.map
                                .getInstance()
                                .getBounds()
                                .contains(v.latestGpsEntity);
                        }
                    });
                }
            });
        },
        /**
         * 定位当前车辆焦点，显示信息窗体，设置地图边界
         * @param vehicle object
         */
        viewFocusCurrent(vehicle) {
            let vm = this;
            vm.setWindowContent(vehicle);
            if (vehicle.latestGpsEntity) {
                vm.$nextTick(() => {
                    let infoWindow = vm.$refs.infoWindow.getInstance();
                    let map = vm.$refs.map.getInstance();
                    map.fitBounds([infoWindow.getLatLng()]);
                });
                if (vm.map.fastChangeHandle != null) {
                    clearTimeout(vm.map.fastChangeHandle);
                }
            }
        },
        /**
         * 恢复全局边界
         */
        viewReset() {
            let vm = this;
            vm.map.window.visible = false;
            vm.$nextTick(() => {
                vm.map.fastChangeHandle = setTimeout(() => {
                    if (vm.hasLocked) {
                        vm.setFullView(vm.$refs.locked.map(v => v.position));
                    } else {
                        vm.setFullView();
                    }
                }, 300);
            });
        },
        /**
         * 设置边界
         * @param items
         */
        setFullView(items = null) {
            let vm = this;
            if (!items && vm.$refs.markers) {
                items = vm.$refs.markers.map(v => v.position);
            }
            if (vm.$refs.map && items) {
                vm.$refs.map.getInstance().fitBounds([items]);
            }
        },
        /**
         * 设置信息窗体内容
         * 地址实时反查获取
         * @param vehicle object
         */
        setWindowContent(vehicle) {
            let vm = this;
            vm.map.window.vehicle_id = vehicle.vehicleId;
            vm.map.window.position = vehicle.latestGpsEntity;
            vm.map.window.info.sampled_at = vehicle.latestGps.gps_sample;
            if (vehicle.latestGps) {
                vm.SaaSApi.geoRecode(
                    vehicle.latestGps.longitude,
                    vehicle.latestGps.latitude,
                    vm.locale
                )
                    .then(response => {
                        if (!response.data.data) {
                            throw new Error();
                        }
                        vm.map.window.info.address =
                            response.data.data.formatted_address;
                    })
                    .catch(e => {
                        vm.map.window.info.address = vm.inputLocal("null");
                    });
            } else {
                vm.map.window.info.address = vehicle.latestGps.address;
            }
            vm.map.window.info.speed = vehicle.latestGps.speed;
            vm.map.window.info.plate_num = vehicle.plateNum;
            vm.map.window.info.use_type = VEHICLE_USE_TYPE[vehicle.useType];
            vm.map.window.info.device_sn = vehicle.bindDevice;
            vm.map.window.info.driver_name = vehicle.driver;
            vm.map.window.info.driver_mobile = vehicle.mobile;

            vm.map.window.visible = true;
        },
        /**
         * 设置车辆图标
         * @param vehicle
         * @return {*}
         */
        handleIconOption(zIndex, vehicle) {
            let vm = this;
            return vehicle
                ? {
                      zIndexOffset: zIndex,
                      icon: L.DomMarkers.icon({
                          element: new Vue({
                              render: h =>
                                  h("div", {}, [
                                      h("img", {
                                          attrs: {
                                              src: require("@/assets/vehicles/" +
                                                  vm.statusIcon[
                                                      vehicle.useType
                                                  ] +
                                                  ".png")
                                          }
                                      }),
                                      h("div", {
                                          class: {
                                              status: true,
                                              empty: vehicle.predictLoad == 0,
                                              full: vehicle.predictLoad == 1
                                          }
                                      })
                                  ])
                          }).$mount().$el,
                          iconSize: [24, 52],
                          iconAnchor: [12, 26],
                          className: "vehicle-marker"
                      }),
                      angle: vehicle.angle,
                      angleOrigin: "center center"
                  }
                : {
                      zIndexOffset: zIndex,
                      icon: L.icon({
                          iconUrl:
                              "https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
                          iconSize: [19, 31],
                          iconAnchor: [10, 31]
                      })
                  };
        }
    }
};
</script>

<style scoped lang="scss">
.amap-info-close {
    display: none;
}

.el-row--flex {
    height: 100%;
}

.el-vue-amap-container {
    .el-vue-amap {
        width: 100%;
    }
}
</style>

<style scoped>
/*@formatter:off*/
#map-container >>> .vehicle-marker {
    background: none;
    border: none;
}

#map-container >>> .vehicle-marker .status {
    background: transparent;
    background-clip: content-box;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

#map-container >>> .vehicle-marker .full {
    background: #ef4242;
    background-clip: content-box;
    border: 2px solid rgba(255, 255, 255, 0.5);
}

#map-container >>> .vehicle-marker .empty {
    background: #34d87d;
    background-clip: content-box;
    border: 2px solid rgba(255, 255, 255, 0.5);
}
/*@formatter:on*/
</style>
