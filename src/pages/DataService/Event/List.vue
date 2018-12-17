<template>
    <table-page
        :table-info.sync="table"
        :table-container-span="12"
        :table-style="{ 'min-height':'520px' }"
        @table-resource="getTableData"
        no-filter-button
        @table-cell-mouse-enter="handleTableMouseEnter"
        @table-cell-mouse-leave="handleTableMouseLeave"
    >
        <template slot="form-filter-prepend">
            <div class="form-filter">
                <div>
                    <el-date-picker
                        @focus="handleFilterFocus"
                        v-model="table.filter.date_range"
                        type="datetimerange"
                        class="l-date-picker"
                        size="small"
                        :range-separator="inputLocal('to')"
                        :start-placeholder="inputLocal('starttime')"
                        :end-placeholder="inputLocal('endtime')"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :clearable="false">
                    </el-date-picker>
                </div>
                <div>
                    <el-select v-model="table.filter.types"
                               multiple
                               class="type-select"
                               size="small"
                               collapse-tags
                               :placeholder="inputLocal('eventtype')">
                        <el-option
                            v-for="(n,i) in eventType"
                            :key="i"
                            :label="n"
                            :value="i">
                        </el-option>
                    </el-select>
                </div>
                <div>
                    <el-input v-model="table.filter.plate_num"
                              size="small"
                              :placeholder="inputLocal('plateNum')">
                    </el-input>
                </div>
                <div>
                    <el-input v-model="table.filter.device_sn"
                              size="small"
                              :placeholder="inputLocal('devicesn')">
                    </el-input>
                </div>
                <div>
                    <el-button type="primary"
                               native-type='submit'
                               class="search-btn"
                               size="small"
                               plain
                               icon="el-icon-search">
                        <span class="search-text">{{$t('search')}}</span>
                    </el-button>
                </div>
            </div>
        </template>
        <template slot="table-columns">
            <el-table-column min-width="15">
                <template slot-scope="scope">
                    <el-tooltip class="item hidden-md-and-down" effect="dark" :content="inputLocal('gpsnotice')"
                                placement="top" v-if="scope.row.trigger_gps">
                        <i class="fal fa-map-marker-alt fa-fw"></i>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="triggered_at" min-width="120" :label="inputLocal('triggertime')">
            </el-table-column>
            <el-table-column prop="device.id" :label="inputLocal('devicesn')">
            </el-table-column>
            <el-table-column prop="type_show" :label="inputLocal('type')">
            </el-table-column>
            <el-table-column prop="vehicle.plate_num" :label="inputLocal('plateNum')">
            </el-table-column>
            <el-table-column :label="inputLocal('operate')">
                <template slot-scope="scope">
                    <el-button type="text" size="small"
                               v-if="isDetailButtonShow(scope.row.type) && !isActionBanned(RoleActions.EventDetail)"
                               :disabled="isActionBanned(RoleActions.EventDetail)"
                               @click="$router.push(`/events/type/${currentType}/${scope.row.id}`)">
                        {{$t('detail')}}
                    </el-button>
                </template>
            </el-table-column>
        </template>
        <template slot="after-table-container">
            <el-col class="map-wrap" :span="12">
                <hb-map ref="map" mapId="eventMap" :options="{
                        closePopupOnClick: false
                    }">

                    <hb-map-marker :position="point.gps" :options="{
                                icon: point.icon,
                                zIndexOffset: 50
                            }" v-for="(point, i) in map.markers" :key="`marker_${i}`" ref="markers">
                    </hb-map-marker>
                    <hb-map-popup ref="infoWindow" :options="{
                            maxWidth: 'auto'
                        }" :position="map.window.position" :visible="map.window.visible">
                        <window-content :window-info="map.window.info" has-vehicle has-device
                                        has-event></window-content>
                    </hb-map-popup>
                </hb-map>
            </el-col>
        </template>
    </table-page>
</template>

<script>
    import _ from "lodash";
    import Vue from "vue";
    import * as types from "@/store/types";
    import {mapState, mapGetters, mapActions, mapMutations} from "vuex";
    import {EVENT_TYPE, EVENT_TYPE_FLAG, TABLE_INFO} from "@/consts";
    import TablePage from "@/components/TablePage";
    import Gps from "@/utils/gps";
    import WindowContent from "@/components/WindowContent";
    import TableMixin from "@/mixins/table-component";

    const EVENT_TYPE_ICON_MAPPER = {
        [EVENT_TYPE_FLAG["crash"]]: {
            icon: "fa-exclamation",
            type: "danger"
        },
        [EVENT_TYPE_FLAG["turn"]]: {
            icon: "fa-reply",
            type: "primary"
        },
        [EVENT_TYPE_FLAG["accelerate"]]: {
            icon: "fa-plus",
            type: "primary"
        },
        [EVENT_TYPE_FLAG["brake"]]: {
            icon: "fa-minus",
            type: "primary"
        },
        "6": {
            icon: "fa-bolt",
            type: "warning"
        },
        "1": {
            icon: "fa-clock",
            type: "info"
        },
        [EVENT_TYPE_FLAG["fence_enter"]]: {
            icon: "fa-braille",
            type: "warning"
        },
        [EVENT_TYPE_FLAG["fence_leave"]]: {
            icon: "fa-braille",
            type: "warning"
        }
    };

    export default {
        name: "DataServicesEventList",
        components: {
            TablePage,
            WindowContent
        },
        mixins: [TableMixin],
        data() {
            return {
                defaultTypes: [],
                currentType: null,
                eventType: null,
                languagesType: null,
                map: {
                    default: {
                        zoom: 0,
                        center: [],
                        handle: null
                    },
                    markers: [],
                    window: {
                        position: [0, 0],
                        visible: false,
                        info: {
                            sampled_at: "",
                            address: null,
                            plate_num: "",
                            device_sn: "",
                            type_show: "",
                            extra: {}
                        }
                    }
                },
                table: {
                    data: [],
                    page: 1,
                    pageSize: TABLE_INFO.DEFAULT_PAGE_SIZE,
                    total: 0,
                    filter: {},
                    mouseCurrentId: null,
                    mouseLeaveHandler: null
                }
            };
        },
        created() {
            this.initPage();
            this.importFontpack("DataService/Event/List");
        },
        watch: {
            $route(to, from) {
                if (
                    to.matched[to.matched.length - 1].path ==
                    from.matched[from.matched.length - 1].path
                ) {
                    this.initPage();
                    this.getTableData(true);
                    this.renderMapMarkers();
                    this.$refs.mapMarkers.getInstance()._redraw(true);
                }
            }
        },
        methods: {
            ...mapMutations({
                setAsideActiveIndex: types.global.mutations.SET_ASIDE_ACTIVE_INDEX
            }),
            handleFilterFocus(dateTimePicker) {
                if (this.onlyOnce) return;
                this.onlyOnce = true;
                this.$nextTick(() => {
                    dateTimePicker.popperElm.querySelector(".el-picker-panel__footer button").remove();
                })

            },
            initPage() {
                let vm = this;
                vm.$set(vm.table, "filter", {
                    types: [],
                    date_range: [
                        vm
                            .$moment()
                            .subtract(3, "days")
                            .format("YYYY-MM-DD HH:mm:ss"),
                        vm.$moment().format("YYYY-MM-DD HH:mm:ss")
                    ],
                    plate_num: "",
                    device_sn: ""
                });
                let type = vm.$route.path.split("/").pop();
                vm.currentType = type;
                vm.languagesType = type.toUpperCase();
                vm.eventType = EVENT_TYPE[type.toUpperCase()];
                vm.defaultTypes = Object.keys(vm.eventType);

                // vm.setAsideActiveIndex(`/events/type/${type}`);
            },
            afterResponse() {
                let vm = this;
                vm.$nextTick(() => {
                    vm.getEventList().then(response => {
                        vm.hideLoadingInc();
                        let data = response.data.data;
                        let list = data.list.map(v => {
                            v.type_show = vm.inputLocal(`${vm.languagesType}`)[
                                v.type
                                ];
                            if (v.trigger_gps) {
                                let tmp = v.trigger_gps.split(",");
                                tmp = new Gps(tmp[0], tmp[1]);
                                v.trigger_gps = tmp.isIllegal() ? null : tmp;
                            }
                            v.triggered_at = vm.$options.filters.formatDateTime(
                                v.triggered_at
                            );
                            return v;
                        });
                        vm.$set(vm.table, "data", list);
                        vm.$set(vm.table, "total", data.total);
                        vm.renderMapMarkers(response);
                    });
                });
            },
            /**
             * 是否显示 事件详情按钮
             * @param type
             * @returns {boolean}
             */
            isDetailButtonShow(type) {
                return (
                    [
                        EVENT_TYPE_FLAG["turn"],
                        EVENT_TYPE_FLAG["accelerate"],
                        EVENT_TYPE_FLAG["brake"],
                        EVENT_TYPE_FLAG["crash"],
                        EVENT_TYPE_FLAG["alarm"]
                    ].indexOf(type) >= 0
                );
            },
            renderMapMarkers(res) {
                let vm = this;
                if (res && res.data.data.list) {
                    let markers = res.data.data.list;
                    for (let i in markers) {
                        let data = markers[i];
                        if (data.trigger_gps) {
                            vm.map.markers.push({
                                id: data.id,
                                gps: data.trigger_gps.transform().toReArray(),
                                type: data.type,
                                icon: L.DomMarkers.icon({
                                    element: new Vue({
                                        render: h => {
                                            return h("el-button", {
                                                props: {
                                                    icon: `fas ${
                                                        EVENT_TYPE_ICON_MAPPER[
                                                            data.type
                                                            ].icon
                                                        } fa-fw`
                                                }
                                            });
                                        }
                                    }).$mount().$el,
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10],
                                    className: `map-event-marker el-button el-button--${
                                        EVENT_TYPE_ICON_MAPPER[data.type].type
                                        } is-circle`
                                })
                            });
                        }
                    }
                }
                if (!vm.map.markers || !vm.map.markers.length) return;
                vm.$nextTick(() => {
                    vm.$refs.map
                        .getInstance()
                        .fitBounds([vm.map.markers.map(m => m.gps)]);
                });
            },
            getEventList() {
                let vm = this;
                return vm.SaaSApi.getEvents(
                    vm.currentCompany.id,
                    vm.table.filter.date_range[0],
                    vm.table.filter.date_range[1],
                    vm.table.filter.types.length == 0
                        ? vm.defaultTypes
                        : vm.table.filter.types,
                    vm.table.filter.plate_num,
                    vm.table.filter.device_sn,
                    vm.table.page,
                    vm.table.pageSize
                );
            },
            handleTableMouseEnter(row, column, cell, event) {
                let vm = this;
                clearTimeout(vm.table.mouseLeaveHandler);
                if (vm.table.mouseCurrentId == row.id) {
                    return;
                }
                vm.table.mouseCurrentId = row.id;
                if (row.trigger_gps) {
                    vm.setWindowContent(row);
                    vm.map.window.visible = true;

                    vm.$set(
                        vm.map.window,
                        "position",
                        row.trigger_gps.transform().toReArray()
                    );
                    vm.$nextTick(() => {
                        if (vm.map.default.handle != null) {
                            clearTimeout(vm.map.default.handle);
                        }
                        vm.$refs.map
                            .getInstance()
                            .fitBounds([vm.map.window.position]);
                    });
                }
            },
            handleTableMouseLeave(row, column, cell, event) {
                let vm = this;
                vm.table.mouseLeaveHandler = setTimeout(() => {
                    vm.table.mouseCurrentId = null;
                    if (vm.map.window.position) {
                        vm.$set(vm.map.window, "position", null);
                        vm.map.window.visible = false;
                        vm.map.window.info.address = null;
                        vm.$nextTick(() => {
                            vm.map.default.handle = setTimeout(() => {
                                let mapInstance = vm.$refs.map.getInstance();
                                mapInstance.fitBounds([
                                    vm.map.markers.map(m => m.gps)
                                ]);
                            }, 200);
                        });
                    }
                }, 100);
            },
            setWindowContent(rowInfo) {
                let vm = this;
                if (rowInfo.triggered_at) {
                    vm.map.window.info.sampled_at = rowInfo.triggered_at;
                }
                vm.map.window.info.plate_num = rowInfo.vehicle.plate_num;
                vm.map.window.info.device_sn = rowInfo.device.id;
                vm.map.window.info.type_show = rowInfo.type_show;

                if (rowInfo.trigger_gps) {
                    vm.SaaSApi.geoRecode(
                        rowInfo.trigger_gps.longitude,
                        rowInfo.trigger_gps.latitude,
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
                            vm.map.window.info.address = vm.inputLocal("noaddress");
                        });
                }
            }
        }
    };
</script>

<style scoped lang="scss">
    .map-wrap {
        padding: 0 !important;
        background-color: #fff !important;
    }

    .l-date-picker {
        width: 100%;
    }

    .form-filter {
        display: flex;
        margin-bottom: 20px;
        & > div {
            margin-right: 10px;
        }
    }

    .type-select {
        width: 100%;
    }

    @media screen and (max-width: 992px) {
        .search-text {
            display: none;
        }
        .search-btn {
            left: 0px;
        }
    }
</style>
<style scoped>

</style>
