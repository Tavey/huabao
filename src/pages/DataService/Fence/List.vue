<template>
    <table-page
        :table-info.sync="table"
        :table-container-span="9"
        :table-style="{ 'min-height':'520px' }"
        @table-resource="getTableData"
        @table-row-click="handleFenceRowClick">
        <template slot="form-filter-prepend">
            <el-form-item>
                <el-select
                    v-model="table.filter.tag_id"
                    clearable
                    filterable
                    remote
                    reserve-keyword
                    :placeholder="inputLocal('inputLabel')"
                    :remote-method="queryTagSearch"
                    :loading="tagLoading">
                    <el-option
                        v-for="item in tagPool"
                        :key="item.id"
                        :label="item.value"
                        :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-input v-model="table.filter.name"
                          :placeholder="inputLocal('name')"
                          style="max-width: 120px;"
                ></el-input>
            </el-form-item>
        </template>
        <template slot="table-columns">
            <el-table-column
                prop="name"
                min-width="50"
                :label="inputLocal('name')">
            </el-table-column>
            <el-table-column
                prop="tags"
                min-width="50"
                :label="inputLocal('tags')">
                <template slot-scope="scope">
                    <el-tag size="mini" v-for="tag in scope.row.tags" :key="`table_tag_${tag.id}`">{{tag.name}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                min-width="50"
                :label="inputLocal('created_at')">
                <template slot-scope="scope">
                    <span>{{ scope.row.created_at | formatDateTime }}</span>
                </template>
            </el-table-column>
        </template>
        <template slot="after-table-container">
            <el-col :span="15">
                <el-card v-if="currentFence">
                    <div slot="header" class="clearfix">
                        <p>
                            <small>{{$t('fence')}}: {{currentFence.name}}</small>
                            <small v-if="eventsTable.total > 0">{{$t('eventCount')}}: {{eventsTable.total}}</small>
                        </p>
                        <el-form
                            inline size="small"
                            v-model="eventsTable.filter"
                            @submit.native.prevent="handleEventFilter">
                            <el-form-item style="max-width: 120px;">
                                <el-input v-model="eventsTable.filter.plate_num"
                                          :placeholder="inputLocal('plateNum')"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-date-picker
                                    v-model="eventsTable.filter.time_range"
                                    type="datetimerange"
                                    :start-placeholder="inputLocal('triggerTime')"
                                    :end-placeholder="inputLocal('triggerTime')"
                                    value-format="yyyy-MM-dd HH:mm:ss">
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item>
                                <el-button
                                    type="primary"
                                    native-type='submit'
                                    icon="el-icon-search"
                                >{{ $t('search') }}
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                    <el-row :gutter="20" class="tablewrap">
                        <el-col class="table-container">
                            <el-table
                                :data="eventsTable.data"
                                height="53"
                                style="min-height: 520px;"
                                @row-click="handleEventRowClick">
                                <el-table-column
                                    :label="inputLocal('plateNum')">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.vehicle ? scope.row.vehicle.plateNum : $t("null") }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                    :label="inputLocal('driver')"
                                    width="180">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.vehicle ? scope.row.vehicle.driver : $t("null") }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                    :label="inputLocal('triggerTime')">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.triggerTime | formatDateTime }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                    :label="inputLocal('fenceEventType')">
                                    <template slot-scope="scope">
                                        <span>{{ $t(`fenceType.${scope.row.type}`) }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                    :label="inputLocal('vehicleType')">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.showVehicleUseType ? scope.row.showVehicleUseType : $t("null") }}</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="pagination-container">
                                <el-pagination
                                    layout="total, prev, pager, next"
                                    :total="eventsTable.total"
                                    :page-size="eventsTable.pageSize"
                                    :current-page.sync="eventsTable.page"
                                    @current-change="doGetFenceEvents"
                                >
                                </el-pagination>
                            </div>

                        </el-col>
                    </el-row>
                </el-card>

            </el-col>
        </template>
    </table-page>
</template>

<script>

    import {TABLE_INFO, VEHICLE_USE_TYPE} from "@/consts";
    import TableMixin from "@/mixins/table-component";
    import TablePage from "@/components/TablePage";
    import ElFormItem from "element-ui/packages/form/src/form-item";

    export default {
        components: {
            ElFormItem,
            TablePage
        },
        mixins: [TableMixin],
        data() {
            return {
                // tagAutoComplete: null,
                currentFence: null,
                tagLoading: false,
                tagPool: [],
                eventsTable: {
                    data: [],
                    page: 1,
                    pageSize: TABLE_INFO.DEFAULT_PAGE_SIZE,
                    total: 0,
                    filter: {
                        plate_num: null,
                        time_range: null
                    }
                },
                table: {
                    data: [],
                    page: 1,
                    pageSize: TABLE_INFO.DEFAULT_PAGE_SIZE,
                    total: 0,
                    filter: {
                        name: "",
                        tag_id: ""
                    }
                }
            }
        },
        created() {
            this.importFontpack("Console/Fence");
        },
        watch: {
            "currentFence.id"(val) {
                this.doGetFenceEvents();
            }
        },
        methods: {
            afterResponse() {
                let vm = this;
                vm.$nextTick(() => {
                    vm.getFences().then(response => {
                        vm.hideLoadingInc();
                        let data = response.data.data;
                        let list = data.list.map(v => {
                            v.tagsArr = v.tags.map(tag => tag.name);
                            return v;
                        });
                        vm.$set(vm.table, "data", list);
                        vm.$set(vm.table, "total", data.total);
                    });
                });
            },
            getFences() {
                let vm = this;
                return vm.SaaSApi.getFences(
                    vm.currentCompany.id,
                    vm.table.filter,
                    vm.table.page,
                    vm.table.pageSize
                );
            },
            doGetFenceEvents() {
                let vm = this;
                vm.showLoadingInc();
                vm.$nextTick(() => {
                    vm.getFenceEvents().then(response => {
                        vm.hideLoadingInc();
                        let data = response.data.data;
                        if (!data.list) {
                            data.list = [];
                        }
                        let list = data.list.map(v => {
                            v.showVehicleUseType = v.vehicle ? VEHICLE_USE_TYPE[v.vehicle.useType] : null;
                            return v;
                        });
                        // console.log(list);
                        vm.$set(vm.eventsTable, "data", list);
                        vm.$set(vm.eventsTable, "total", data.total);

                    });
                });
            },
            getFenceEvents() {
                let vm = this;
                return vm.SaaSApi.getFenceEvents(
                    vm.currentFence.id,
                    {
                        plate_num: vm.eventsTable.filter.plate_num || null,
                        begin_at: vm.eventsTable.filter.time_range ?
                            vm.$moment(vm.eventsTable.filter.time_range[0]).format("YYYY-MM-DD\THH:mm:ssZZ") :
                            null,
                        end_at: vm.eventsTable.filter.time_range ?
                            vm.$moment(vm.eventsTable.filter.time_range[1]).format("YYYY-MM-DD\THH:mm:ssZZ") :
                            null,
                    },
                    vm.eventsTable.page,
                    vm.eventsTable.pageSize,
                )
            },
            /**
             * 自动完成标签名
             * @param queryString
             */
            queryTagSearch(queryString) {
                let vm = this;
                vm.tagLoading = true;
                vm.SaaSApi.getFenceTagAutocomplete(
                    this.currentCompany.id,
                    queryString
                ).then(response => {
                    vm.tagLoading = false;
                    let data = response.data.data;
                    vm.tagPool = data.map(v => {
                        v.value =
                            v.name +
                            `(${vm.inputLocal("total")} ${
                                v.fences_count
                                }${vm.inputLocal("used")})`;
                        return v;
                    });
                });
            },
            /**
             * 围栏列表 Table Row 点击
             * @param row
             * @param event
             * @param column
             */
            handleFenceRowClick(row, event, column) {
                this.currentFence = row;
            },
            /**
             * 围栏事件列表 Table Row 点击
             * @param row
             * @param event
             * @param column
             */
            handleEventRowClick(row, event, column) {
                if (row.tripId && row.vehicleId) {
                    this.$router.push({path: `/vehicles/${row.vehicleId}/trips/${row.tripId}`});
                } else {
                    this.$message({
                        message: this.inputLocal("noTripInfo"),
                        type: 'warning'
                    });
                }
                // console.log(row);
            },
            handleEventFilter() {
                this.eventsTable.page = 1;
                this.doGetFenceEvents();
            }
        }

    }
</script>

<style lang="scss" scoped>
    .el-tag {
        margin-left: 10px;
    }

    .el-card {
        p {
            margin-top: 0;
            small {
                margin-right: 20px;
            }
        }
    }

</style>
<style scoped>
    /*@formatter:off*/
    .el-card >>> .el-card__header {
        padding-bottom: 0;
    }
    /*@formatter:on*/
</style>
