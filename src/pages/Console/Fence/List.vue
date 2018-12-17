<template>
    <table-page :table-info.sync="table"
                :table-container-span="12"
                :table-style="{ 'min-height':'520px' }"
                @table-resource="getTableData"
                @table-cell-mouse-enter="handleTableMouseEnter"
                @table-cell-mouse-leave="handleTableMouseLeave">
        <template slot="form-filter-prepend">
            <el-form-item>
                <el-select v-model="table.filter.tag_id"
                           clearable
                           filterable
                           remote
                           reserve-keyword
                           :placeholder="inputLocal('inputLabel')"
                           :remote-method="queryTagSearch"
                           :loading="tagLoading">
                    <el-option v-for="item in tagPool"
                               :key="item.id"
                               :label="item.value"
                               :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <!--<el-form-item>-->
            <!--<el-autocomplete -->
            <!--v-model="table.filter.tag_id" -->
            <!--:fetch-suggestions="querySearchAsync" -->
            <!--:placeholder="inputLocal('inputLabel')" -->
            <!--@select="handleTag">-->
            <!---->
            <!--</el-autocomplete>-->
            <!--</el-form-item>-->
            <el-form-item>
                <el-input v-model="table.filter.name"
                          :placeholder="inputLocal('inputFence')"></el-input>
            </el-form-item>
        </template>
        <template slot="form-filter-append">
            <el-form-item style="float: right;">
                <el-button icon="fas fa-plus fa-fw"
                           plain
                           type="primary"
                           size="mini"
                           v-if="!isActionBanned(RoleActions.CreateFence)"
                           @click="createFenceOpen({})">
                    {{$t('addFence')}}
                </el-button>
            </el-form-item>
        </template>
        <template slot="table-columns">
            <el-table-column prop="name"
                             min-width="50"
                             :label="inputLocal('name')">
            </el-table-column>
            <el-table-column prop="tags"
                             min-width="50"
                             :label="inputLocal('tags')">
                <template slot-scope="scope">
                    <el-tag size="mini"
                            v-for="tag in scope.row.tags"
                            :key="`table_tag_${tag.id}`">{{tag.name}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column min-width="50"
                             :label="inputLocal('created_at')">
                <template slot-scope="scope">
                    <span>{{ scope.row.created_at | formatDateTime }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="inputLocal('operation')">
                <template slot-scope="scope">
                    <el-button plain
                               type="primary"
                               size="mini"
                               icon="fas fa-edit fa-fw"
                               v-if="!isActionBanned(RoleActions.UpdateFence)"
                               @click="createFenceOpen(scope.row)">
                        {{$t('editor')}}
                    </el-button>
                    <el-button plain
                               type="primary"
                               size="mini"
                               icon="fas fa-trash-alt fa-fw"
                               v-if="!isActionBanned(RoleActions.DeleteFence)"
                               @click="deleteOpen(scope.row)">
                        {{$t('delete')}}
                    </el-button>
                </template>
            </el-table-column>
        </template>
        <template slot="dialog-container">
            <el-dialog :title="dialogName"
                       :visible="editorVisible"
                       @close="handleDialogClose"
                       :model="editableContainer"
                       :before-close="closeEditable"
                       width="45%">
                <el-form inline
                         ref="graphics"
                         size="mini">
                    <el-form-item prop="name">
                        <el-input v-model="editableContainer.name"
                                  :maxlength="20"
                                  :placeholder="inputLocal('fenceName')"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-radio-group v-model="editableContainer.type"
                                        @change="handleChange">
                            <el-radio-button label="circle"
                                             :disabled="editableContainer.id">
                                {{$t('circular')}}
                            </el-radio-button>
                            <el-radio-button label="polygon"
                                             :disabled="editableContainer.id">
                                {{$t('polygon')}}
                            </el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <br/>
                    <el-form-item>
                        <el-tag v-for="tag in editableContainer.tagsArr"
                                closable
                                :key="tag"
                                @close="handleClose(tag)">
                            {{tag}}
                        </el-tag>
                        <el-input class="input-new-tag"
                                  v-if="inputVisible"
                                  v-model="inputValue"
                                  ref="saveTagInput"
                                  size="small"
                                  @keyup.enter.native="handleInputConfirm"
                                  @blur="handleInputConfirm">
                        </el-input>
                        <el-button v-else
                                   class="button-new-tag"
                                   size="small"
                                   @click="showInput">+{{$t('addTags')}}
                        </el-button>
                    </el-form-item>
                    <el-row :gutter="20">
                        <el-col class="map-wrap"
                                :span="24">
                            <el-autocomplete class="inline-input"
                                             ref="searchInt"
                                             v-model="map.place"
                                             :fetch-suggestions="querySearch"
                                             placeholder="搜地点、找路线"
                                             :trigger-on-focus="false"
                                             @select="handleSelect"
                                             hide-loading>
                            </el-autocomplete>
                            <div v-if="map.circleRadius"
                                 class="now_radius">
                                <el-tag type="info">{{ $t('radius')}}:{{map.circleRadius}}M</el-tag>
                            </div>
                            <hb-map ref="dialogmap"
                                    mapId="dialogmap"
                                    vid="map-container"
                                    style="height: 500px;width:100%;"
                                    :editable="true"
                                    :options="{
                                        editable:true
                                    }">
                                <hb-map-marker ref="searchMarks"
                                               v-if="map.markers.length>0"
                                               v-for="(marker,index) in map.markers"
                                               :position="marker"
                                               :options="{
                                                    icon: handleIcon()
                                                }"
                                               :key="index"></hb-map-marker>
                                <hb-map-circle v-if="map.circle!=null"
                                               ref="circle"
                                               :position="map.circle.center"
                                               :options="{
                                                    radius: map.circle.radius,
                                                    fillOpacity:map.fillOpacity,
                                                    fillColor:map.fillColor,
                                                    strokeWeight:map.strokeWeight,
                                                    strokeOpacity:map.strokeOpacity,
                                                    editable:map.event
                                                }"></hb-map-circle>
                                <hb-map-polygon v-if="map.polygon!=null"
                                                ref="polygon"
                                                :position="map.polygon.path"
                                                :options="{
                                                    fillOpacity:map.fillOpacity,
                                                    fillColor:map.fillColor,
                                                    strokeWeight:map.strokeWeight,
                                                    strokeOpacity:map.strokeOpacity
                                                }"></hb-map-polygon>
                            </hb-map>
                            <div class="toolbar">
                                <el-button type="primary"
                                           :disabled="notSave"
                                           @click="changeEditable">
                                    {{$t('save')}}
                                </el-button>
                                <el-button type="primary"
                                           @click="closeEditable">{{$t('cancel')}}</el-button>
                            </div>
                        </el-col>
                    </el-row>
                </el-form>
            </el-dialog>
            <el-dialog :title="inputLocal('prompt')"
                       @close="deleteVisible=false"
                       :visible.sync="deleteVisible"
                       width="30%">
                <span>{{$t('sureRemove')}}</span>
                <div slot="footer"
                     class="dialog-footer">
                    <el-button @click="deleteVisible = false">{{$t('cancel')}}</el-button>
                    <el-button type="primary"
                               @click="deleteFence">{{$t('sure')}}</el-button>
                </div>
            </el-dialog>
        </template>
        <template slot="after-table-container">
            <el-col class="map-wrap"
                    :span="12">
                <hb-map ref="map"
                        mapId="map"
                        vid="map-container"
                        style="height: 100%;width:100%;">
                    <hb-map-circle v-for="(circle,index) in map.circles"
                                   ref="mapCircle"
                                   :position="circle.shape.center"
                                   :options="{
                                        radius: circle.shape.radius,
                                        fillOpacity:map.fillOpacity,
                                        fillColor:map.fillColor,
                                        strokeWeight:map.strokeWeight,
                                        strokeOpacity:map.strokeOpacity
                                    }"
                                   :key="`circle_${index}`"></hb-map-circle>
                    <hb-map-polygon v-for="(polygon,index) in map.polygons"
                                    ref="mapPolygon"
                                    :position="polygon.shape"
                                    :options="{
                                        fillOpacity:map.fillOpacity,
                                        fillColor:map.fillColor,
                                        strokeWeight:map.strokeWeight,
                                        strokeOpacity:map.strokeOpacity,
                                    }"
                                    :key="`polygon_${index}`"></hb-map-polygon>
                    <hb-map-circle v-if="map.redCircle"
                                   z-index="1000"
                                   ref="redCircle"
                                   :position="map.redCircle.center"
                                   :options="{
                                      radius:map.redCircle.radius,
                                      fillOpacity:map.fillOpacity,
                                      fillColor:map.fillColorRed,
                                      strokeWeight:map.strokeWeight,
                                      strokeOpacity:map.strokeOpacity
                                   }"></hb-map-circle>
                    <hb-map-polygon v-if="map.redPolygon"
                                    z-index="1000"
                                    ref="redPolygon"
                                    :position="map.redPolygon.path"
                                    :options="{
                                        fillOpacity:map.fillOpacity,
                                        fillColor:map.fillColorRed,
                                        strokeWeight:map.strokeWeight,
                                        strokeOpacity:map.strokeOpacity
                                    }"></hb-map-polygon>
                </hb-map>
            </el-col>
        </template>
    </table-page>
</template>
<script>
import { TABLE_INFO } from "@/consts";
import TablePage from "@/components/TablePage";
import TableMixin from "@/mixins/table-component";
import { icon } from "leaflet";

export default {
    components: {
        TablePage
    },
    mixins: [TableMixin],
    data() {
        return {
            inputVisible: false,
            inputValue: "",
            map: {
                // center: null,
                // zoom: null,
                markers: [],
                circles: [],
                polygons: [],
                circle: null,
                polygon: null,
                redCircle: null,
                redPolygon: null,
                fillOpacity: "0.4",
                fillColor: "#2C5076",
                fillColorRed: "#f10c0c",
                strokeWeight: 0.1,
                strokeOpacity: 0.1,
                // searchManager: null,
                seachPlace: "",
                // bingmap: null,
                // collection: [],
                place: "",
                circleRadius: null
            },
            // submissions: {
            //     tag_id: "",
            //     name: ""
            // },
            table: {
                // restaurants: [],
                data: [],
                page: 1,
                pageSize: TABLE_INFO.DEFAULT_PAGE_SIZE,
                total: 0,
                filter: {
                    name: "",
                    tag_id: ""
                }
            },
            tagLoading: false,
            tagPool: [],
            mouseLeaveHandler: null,
            fastChangeHandle: null,
            timeout: null,
            notSave: true,
            warningOut: null,
            editableContainer: [],
            editorVisible: false,
            deleteVisible: false
        };
    },
    computed: {},
    created() {
        this.importFontpack("Console");
        this.importFontpack("Console/Fence");
    },
    beforeDestroy() {
        ["redCircle", "redPolygon"].forEach(v => {
            let mapInstance = this.$refs[v];
            if (mapInstance) {
                mapInstance.$destroy(true);
            }
        });
        ["mapCircle", "mapPolygon"].forEach(v => {
            let mapInstance = this.$refs[v];
            if (mapInstance) {
                mapInstance.forEach(v => v.$destroy(true));
            }
        });
        ["map", "dialogmap"].forEach(v => {
            let mapInstance = this.$refs[v];
            if (mapInstance) {
                mapInstance.$destroy(true);
            }
        });
    },
    methods: {
        handleDialogClose() {
            this.editorVisible = false;
            this.map.circleRadius = null;
            this.map.markers = [];
        },
        querySearch(queryString, cb) {
            let vm = this;
            vm.getMapPlace(queryString).then(response => {
                let data = response.data.predictions;
                if (data.length > 0) {
                    let collection = data.map(v => {
                        v.value = v.structured_formatting.main_text;
                        return v;
                    });
                    clearTimeout(vm.timeout);
                    vm.timeout = setTimeout(() => {
                        cb(collection);
                    }, 1000);
                } else {
                    vm.openWarning("没有匹配到相关位置信息！");
                    cb([]);
                }
            });
        },
        getMapPlace(place) {
            return this.SaaSApi.queryPlaceId(place);
        },
        getPlaceLatLng(id, language) {
            return this.SaaSApi.querySearch(id, language);
        },
        handleSelect(item) {
            this.map.place = item.value;
            this.map.markers = false;
            this.addMarks(item);
        },
        handleIcon(vehicle) {
            return new icon({
                iconUrl:
                    "https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
                className: "hb-map-icon-marker",
                iconAnchor: [10, 31]
            });
        },
        addMarks(item) {
            let vm = this;
            vm.getPlaceLatLng(item.place_id, vm.locale).then(response => {
                let data = response.data.results;
                if (data.length > 0) {
                    let bounds = L.latLngBounds();
                    let markers = [];
                    for (let i = 0; i < data.length; i++) {
                        markers.push([
                            data[i].geometry.location.lat,
                            data[i].geometry.location.lng
                        ]);
                        let geoBounds = data[i].geometry;
                        if (geoBounds.bounds) {
                            bounds.extend(geoBounds);
                        } else {
                            bounds.extend(geoBounds.viewport);
                        }
                    }
                    vm.$set(vm.map, "markers", markers);
                    if (bounds.isValid()) {
                        vm.$refs.dialogmap.getInstance().fitBounds(bounds);
                    } else if (markers.length) {
                        vm.$refs.dialogmap.getInstance().fitBounds(markers);
                    }
                }
            });
        },
        queryTagSearch(queryString) {
            let vm = this;
            vm.tagLoading = true;
            vm.getFenceTagAutocomplete(queryString).then(response => {
                let data = response.data.data;
                vm.tagLoading = false;
                vm.tagPool = data.map(v => {
                    v.value =
                        v.name +
                        `(${vm.inputLocal("total")} ${
                        v.fences_count
                        }${vm.inputLocal("used")})`;
                    return v;
                });
                // vm.$set(vm.table, "restaurants", list);
                // let restaurant = vm.table.restaurants;
                // let results = queryString
                //     ? restaurant.filter(this.createStateFilter(queryString))
                //     : restaurant;
                // clearTimeout(vm.timeout);
                // vm.timeout = setTimeout(() => {
                //     cb(list);
                // }, 1000);
            });
        },
        // createStateFilter(queryString) {
        //     return state => {
        //         return (
        //             state.value
        //                 .toLowerCase()
        //                 .indexOf(queryString.toLowerCase()) === 0
        //         );
        //     };
        // },
        // handleTag(item) {
        //     let vm = this;
        //     vm.table.filter.tag_id = item.id;
        // },
        handleChange(value) {
            this.editableContainer.type = value;
            this.editor();
        },
        getFenceTagAutocomplete(queryString) {
            return this.SaaSApi.getFenceTagAutocomplete(
                this.currentCompany.id,
                queryString
            );
        },
        afterResponse() {
            let vm = this;
            vm.$set(vm.map, "circles", []);
            vm.$set(vm.map, "polygons", []);
            vm.getFences().then(response => {
                vm.hideLoadingInc();
                let data = response.data.data;
                let circles = [];
                let polygons = [];
                let list = data.list.map(v => {
                    if (v.type == "circle") {
                        v.shape.center = [
                            v.shape.center.latitude,
                            v.shape.center.longitude
                        ];
                        circles.push(v);
                    } else if (v.type == "polygon") {
                        v.shape = v.shape.map(point => [
                            point.latitude,
                            point.longitude
                        ]);
                        polygons.push(v);
                    }
                    v.tagsArr = v.tags.map(tag => tag.name);
                    return v;
                });
                vm.$set(vm.table, "data", list);
                vm.$set(vm.table, "total", data.total);
                vm.$set(vm.map, "circles", circles);
                vm.$set(vm.map, "polygons", polygons);
                setTimeout(() => {
                    let map = vm.$refs.map;
                    if (map.$children.length == 0) {
                        return;
                    }
                    map
                        .getInstance()
                        .fitBounds(
                            map.$children.reduce(
                                (b, m) => b.extend(m.getInstance().getBounds()),
                                L.latLngBounds()
                            )
                        );

                    // vm.center = [
                    //     map.getInstance().getCenter().lat,
                    //     map.getInstance().getCenter().lng
                    // ];
                    // vm.zoom = map.getInstance().getZoom();
                }, 200);
            });
        },
        getFences() {
            let vm = this;
            // if (vm.submissions.name != "") {
            //     vm.table.filter.name = vm.submissions.name;
            // } else {
            //     vm.table.filter.name = "";
            // }
            // if (vm.submissions.tag_id == "") {
            //     vm.table.filter.tag_id = "";
            // } else if (
            //     vm.submissions.tag_id != "" &&
            //     vm.table.filter.tag_id == ""
            // ) {
            //     vm.table.filter.tag_id = vm.submissions.tag_id;
            // }
            return this.SaaSApi.getFences(
                vm.currentCompany.id,
                vm.table.filter,
                vm.table.page,
                vm.table.pageSize
            );
        },
        createFence(shape) {
            let vm = this;
            vm.showLoadingInc();
            let successCallback = () => {
                vm.$nextTick(() => {
                    vm.getTableData();
                    vm.hideLoadingInc();
                    vm.editorVisible = false;
                });
            };
            if (vm.editableContainer.id) {
                return vm.SaaSApi.updateFence(
                    vm.editableContainer.id,
                    vm.editableContainer.name,
                    vm.editableContainer.type,
                    shape,
                    vm.editableContainer.tagsArr
                ).then(successCallback);
            } else {
                return vm.SaaSApi.createFence(
                    vm.currentCompany.id,
                    vm.editableContainer.name,
                    vm.editableContainer.type,
                    shape,
                    vm.editableContainer.tagsArr
                ).then(successCallback);
            }
        },
        deleteFence() {
            let vm = this;
            vm.showLoadingInc();
            let successCallback = () => {
                vm.$nextTick(() => {
                    vm.getTableData();
                    vm.hideLoadingInc();
                    vm.$notify({
                        title: vm.inputLocal("success"),
                        message: vm.inputLocal("successful"),
                        type: "success"
                    });
                    vm.deleteVisible = false;
                });
            };
            return vm.SaaSApi.deleteFence(vm.editableContainer.id).then(
                successCallback
            );
        },

        deleteOpen(row) {
            let vm = this;
            vm.deleteVisible = true;
            let copy = JSON.parse(JSON.stringify(row));
            vm.$set(vm.$data, "editableContainer", copy);
        },

        createFenceOpen(row) {
            let vm = this;
            vm.map.place = "";
            vm.editorVisible = true;
            let copy = JSON.parse(JSON.stringify(row));
            vm.$set(vm.$data, "editableContainer", copy);
            if (vm.editableContainer.id) {
                vm.editor();
                return;
            } else {
                vm.editableContainer.tagsArr = [];
            }
            setTimeout(() => {
                let map = vm.$refs.dialogmap;
                map.editable = true;
                if (vm.center && vm.zoom) {
                    map.getInstance().setView(vm.center, vm.zoom);
                } else {
                    map
                        .getInstance()
                        .setView([31.214885538501157, 121.47261771373452], 10);
                }
            }, 200);
        },
        tostr(arr) {
            return [arr[0] - 0, arr[1] - 0];
        },
        editor() {
            let vm = this;
            vm.notSave = false;
            // let switchs = false;
            vm.map.circle = null;
            vm.map.polygon = null;
            if (vm.editableContainer.type == "circle") {
                let cent;
                vm.map.circleRadius = null;
                if (!vm.editableContainer.shape) {
                    cent = vm.$refs.dialogmap.getInstance().getCenter();
                    cent = [cent.lat, cent.lng];
                }
                vm.map.circle = {
                    clickable: true,
                    center: vm.editableContainer.shape
                        ? vm.tostr(vm.editableContainer.shape.center)
                        : cent,
                    radius: vm.editableContainer.shape
                        ? vm.editableContainer.shape.radius
                        : vm.$refs.dialogmap.getInstance().getZoom() - 15 >= 0
                            ? 200
                            : (15 -
                                vm.$refs.dialogmap.getInstance().getZoom()) *
                            400
                };
                vm.map.circleRadius = parseInt(vm.map.circle.radius);
                vm.$nextTick(() => {
                    setTimeout(() => {
                        let Bounds = vm.$refs.circle.getInstance().getBounds();
                        Bounds = [
                            [Bounds._northEast.lat, Bounds._northEast.lng],
                            [Bounds._southWest.lat, Bounds._southWest.lng]
                        ];
                        vm.$refs.dialogmap.getInstance().fitBounds(Bounds);
                        vm.$refs.circle.getInstance().enableEdit();
                        vm.$refs.dialogmap
                            .getInstance()
                            .on("editable:editing", function (e) {
                                if (vm.map.circle == null) {
                                    return;
                                }
                                vm.map.circleRadius = parseInt(
                                    e.layer._mRadius
                                );
                                if (e.layer._mRadius > 5000) {
                                    vm.openWarning(
                                        vm.inputLocal("radiusCircle")
                                    );
                                    vm.notSave = true;
                                } else {
                                    vm.notSave = false;
                                }
                            })
                            .on("editable:disable", function (e) {
                                if (vm.map.circle == null || e.layer._latlngs) {
                                    return;
                                }
                                let shape = {
                                    center: {
                                        longitude: e.layer._latlng.lng,
                                        latitude: e.layer._latlng.lat
                                    },
                                    radius: e.layer._mRadius
                                };
                                vm.createFence(shape);
                                vm.$refs.circle.getInstance().remove();
                                vm.map.circle = null;
                            });
                    }, 200);
                });
            } else if (vm.editableContainer.type == "polygon") {
                let LngLat, southWest, northEast;
                if (!vm.editableContainer.shape) {
                    LngLat = vm.$refs.dialogmap.getInstance().getBounds();
                    southWest = [LngLat._southWest.lat, LngLat._southWest.lng];
                    northEast = [LngLat._northEast.lat, LngLat._northEast.lng];
                }
                vm.map.polygon = {
                    path: southWest
                        ? vm.getPath(southWest, northEast)
                        : vm.editableContainer.shape
                };
                vm.$nextTick(() => {
                    setTimeout(() => {
                        if (vm.editableContainer.shape) {
                            vm.$refs.dialogmap
                                .getInstance()
                                .fitBounds(vm.map.polygon.path);
                        }
                        vm.$refs.polygon.getInstance().enableEdit();
                        vm.$refs.dialogmap
                            .getInstance()
                            .on("editable:disable", function (e) {
                                if (vm.map.polygon == null || e.layer._latlng) {
                                    return;
                                }
                                let newPath = e.layer._latlngs[0].map(point => [
                                    point.lng,
                                    point.lat
                                ]);
                                let shape = newPath.map(c => {
                                    let arr = c;
                                    c = {};
                                    c.longitude = arr[0];
                                    c.latitude = arr[1];
                                    return c;
                                });
                                vm.createFence(shape);
                                vm.$refs.polygon.getInstance().remove();
                                vm.map.polygon = null;
                            });
                    }, 200);
                });
            }
        },
        // notChange(editableContainer) {
        //     return editableContainer.id ? true : false;
        // },
        openWarning(str) {
            let vm = this;
            if (vm.warningOut != null) {
                return;
            }
            this.$message({
                message: str,
                type: "warning"
            });
            vm.warningOut = setTimeout(() => {
                clearTimeout(vm.warningOut);
                vm.warningOut = null;
            }, 2000);
        },
        getPath(southWest, northEast) {
            let long = (northEast[0] - southWest[0]) / 4;
            let wide = (northEast[1] - southWest[1]) / 4;
            let path1 = [southWest[0] + long, northEast[1] - wide]; //左上
            let path2 = [southWest[0] + long, southWest[1] + wide]; //左下
            let path3 = [northEast[0] - long, southWest[1] + wide]; //右下
            let path4 = [northEast[0] - long, northEast[1] - wide]; //右上
            return [path1, path2, path3, path4];
        },
        getCenter(arr) {
            arr = arr.map(point => [point.lng, point.lat]);
            let long = (arr[3][0] - arr[0][0]) / 2;
            let wide = (arr[0][1] - arr[1][1]) / 2;
            let lng = arr[3][0] - long;
            let lat = arr[1][1] + wide;
            return [lng, lat];
        },
        changeEditable() {
            let vm = this;
            if (
                !vm.editableContainer.name ||
                vm.editableContainer.name.replace(/(^\s*)|(\s*$)/g, "") == ""
            ) {
                vm.openWarning(vm.inputLocal("noNull"));
                return;
            }
            if (vm.editableContainer.name.length > 100) {
                vm.openWarning("电子围栏名称最大不能超过100位");
                return;
            }
            if (vm.editableContainer.type == "circle") {
                vm.$refs.circle.getInstance().toggleEdit();
            } else if (vm.editableContainer.type == "polygon") {
                vm.$refs.polygon.getInstance().toggleEdit();
            }
        },

        closeEditable(done) {
            let vm = this;
            vm.map.circle = null;
            vm.map.polygon = null;
            vm.notSave = true;
            vm.editorVisible = false;
            try {
                done();
            } catch (error) {
            }
        },
        //搜索
        addMarker: function () {
            let lng = 121.5 + Math.round(Math.random() * 1000) / 10000;
            let lat = 31.197646 + Math.round(Math.random() * 500) / 10000;
            this.map.markers.push([lng, lat]);
        },
        onSearchResult(pois) {
            let latSum = 0;
            let lngSum = 0;
            this.map.markers = [];
            if (pois.length > 0) {
                pois.forEach(poi => {
                    let { lng, lat } = poi;
                    lngSum += lng;
                    latSum += lat;
                    this.map.markers.push([poi.lng, poi.lat]);
                });
                let center = {
                    lng: lngSum / pois.length,
                    lat: latSum / pois.length
                };
                this.center = [center.lng, center.lat];
            }
        },
        handleTableMouseEnter(row, column, cell, event, index) {
            let vm = this;
            clearTimeout(vm.mouseLeaveHandler);
            vm.map.redPolygon = null;
            vm.map.redCircle = null;
            setTimeout(() => {
                if (row.type == "polygon") {
                    vm.$set(vm.map, "redPolygon", {
                        path: row.shape
                    });
                } else {
                    vm.$set(vm.map, "redCircle", {
                        center: row.shape.center,
                        radius: row.shape.radius
                    });
                }
            }, 100);
            vm.$nextTick(() => {
                setTimeout(() => {
                    if (vm.fastChangeHandle != null) {
                        clearTimeout(vm.fastChangeHandle);
                    }
                    let map = vm.$refs.map;
                    if (row.type == "polygon") {
                        let entity = row.shape;
                        map.getInstance().fitBounds(entity);
                    } else if (vm.$refs.redCircle) {
                        // let Bounds = vm.$refs.redCircle
                        //     .getInstance()
                        //     .getBounds();
                        // Bounds = [
                        //     [Bounds._northEast.lat, Bounds._northEast.lng],
                        //     [Bounds._southWest.lat, Bounds._southWest.lng]
                        // ];
                        map
                            .getInstance()
                            .fitBounds(
                                vm.$refs.redCircle.getInstance().getBounds()
                            );
                    }
                }, 200);
            });
        },
        handleTableMouseLeave(row, column, cell, event) {
            let vm = this;
            vm.mouseLeaveHandler = setTimeout(() => {
                vm.map.redPolygon = null;
                vm.map.redCircle = null;
                vm.$nextTick(() => {
                    vm.fastChangeHandle = setTimeout(() => {
                        let map = vm.$refs.map;
                        map
                            .getInstance()
                            .fitBounds(
                                map.$children.reduce(
                                    (b, m) =>
                                        b.extend(m.getInstance().getBounds()),
                                    L.latLngBounds()
                                )
                            );
                    }, 200);
                });
            }, 100);
        },

        //新建标签
        handleClose(tag) {
            if (!this.editableContainer.id) {
                this.$forceUpdate();
            }
            this.editableContainer.tagsArr.splice(
                this.editableContainer.tagsArr.indexOf(tag),
                1
            );
        },

        showInput() {
            if (
                this.editableContainer.tagsArr &&
                this.editableContainer.tagsArr.length > 2
            ) {
                this.openWarning(this.inputLocal("most"));
                return;
            }
            this.inputVisible = true;
            this.$nextTick(() => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },

        handleInputConfirm() {
            let vm = this;
            let inputValue = this.inputValue;
            if (inputValue) {
                if (
                    vm.editableContainer.tagsArr.length > 0 &&
                    vm.editableContainer.tagsArr.indexOf(inputValue) >= 0
                ) {
                    vm.openWarning(vm.inputLocal("duplicate"));
                } else {
                    vm.editableContainer.tagsArr.push(inputValue);
                }
            }
            vm.inputVisible = false;
            vm.inputValue = "";
        }
    }
};
</script>

<style scoped lang="scss">
.now_radius {
  position: absolute;
  top: 23px;
  right: 70px;
  z-index: 1000;
}

.inline-input {
  width: 240px;
}

.search-box {
  position: absolute;
  top: 25px;
  left: 80px;
}

.map-wrap {
  padding: 10px;
  background-color: #fff !important;
}

.coordinate {
  max-height: 500px;
  overflow-y: scroll;
}

.el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  margin-bottom: 15px;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.toolbar {
  margin-top: 20px;
}

.inline-input {
  position: absolute;
  top: 21px;
  left: 70px;
  z-index: 1000;
}
</style>
