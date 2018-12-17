<template>
    <div class="page">
        <Breadcrumb></Breadcrumb>
        <el-row type="flex" :gutter="20">
            <el-col :span="14">
                <trip-list-map ref="trip-map"
                               :map.sync="map"
                               :vehicle-id="vehicleId"
                               @bad-trip="handleBadTrip"
                               :route-params="routeParams"
                ></trip-list-map>
            </el-col>
            <el-col :span="10">
                <el-container>
                    <el-header>
                        <div class="header">
                            <el-row :gutter="20" v-if="entity" class="top-info">
                                <el-col :span="8">
                                    <small>
                                        <div class="top-title">{{$t('plateNum')}}</div>
                                        <div class="top-content">{{ entity.plate_num }}</div>
                                    </small>
                                </el-col>
                                <el-col :span="8">
                                    <small>
                                        <div class="top-title">{{$t('devicesn')}}</div>
                                        <div class="top-content">{{ entity.device }}</div>
                                    </small>
                                </el-col>
                                <el-col :span="8">
                                    <small>
                                        <div class="top-title">{{$t('driver')}}</div>
                                        <div class="top-content">{{ entity.driver }}</div>
                                    </small>
                                </el-col>
                            </el-row>
                            <el-form inline class="form-filter" size="mini"
                                     @submit.native.prevent="getTableData(true)">
                                <el-form-item style="margin-bottom: 10px;width: 100%;">
                                    <el-date-picker
                                        v-model="table.filter.dateRange"
                                        size="mini"
                                        type="datetimerange"
                                        :range-separator="inputLocal('to')"
                                        :start-placeholder="inputLocal('starttime')"
                                        :end-placeholder="inputLocal('endtime')"
                                        value-format="yyyy-MM-dd HH:mm:ss"
                                        width="100%">
                                    </el-date-picker>
                                </el-form-item>
                                <el-form-item>
                                    <el-button-group v-if="hasMergeButton">
                                        <el-button
                                            type="primary"
                                            native-type='submit'
                                            size="mini"
                                            plain
                                            icon="fal fa-search fa-fw">
                                            {{$t('search')}}
                                        </el-button>
                                        <el-button
                                            size="mini"
                                            plain
                                            icon="fal fa-code-merge fa-fw"
                                            @click="handleMergeView">
                                            {{ $t('merge') }}
                                        </el-button>
                                    </el-button-group>
                                    <el-button
                                        v-else
                                        type="primary"
                                        native-type='submit'
                                        size="mini"
                                        plain
                                        icon="fal fa-search fa-fw">
                                        {{$t('search')}}
                                    </el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-header>
                    <el-main>
                        <div class="list-wrapper">
                            <ul class="hb-list">
                                <li v-for="(trip,i) in table.data" :key="trip.tripId"
                                    @mouseenter="handleListMouseEnter(i)"
                                    @mouseleave="handleListMouseLeave(i)"
                                    :class="{'disabled': isBadTrip(trip.tripId)}"
                                    @click="handleListClick(i)">
                                    <el-row type="flex" :gutter="20">
                                        <el-col :span="6">
                                            <time>
                                                <span>{{ trip.end_at.date }}</span>
                                                <br/>
                                                <span>{{ trip.end_at.time }}</span>
                                            </time>
                                            <time>
                                                <span>{{ trip.begin_at.date }}</span>
                                                <br/>
                                                <span>{{ trip.begin_at.time }}</span>
                                            </time>
                                        </el-col>
                                        <el-col :span="2">
                                            <div class="trip-line">
                                                <div></div>
                                                <div></div>
                                            </div>
                                        </el-col>
                                        <el-col :span="14">
                                            <address class="text-truncate">{{ trip.isDriving ?
                                                inputLocal('notfinished') : trip.endAddress }}
                                            </address>
                                            <small>
                                                <small>{{ trip.mileage }}{{$t('kilometre')}}</small>
                                                <small style="margin-left: 15px">{{ trip.duration }}</small>
                                            </small>
                                            <address class="text-truncate">{{ trip.isDriving ?
                                                inputLocal('driving') : trip.beginAddress }}
                                            </address>
                                        </el-col>
                                    </el-row>
                                </li>
                            </ul>
                        </div>
                    </el-main>
                    <el-footer v-if="hasPagination">
                        <div class="bottom">
                            <el-pagination
                                background
                                layout="prev, pager, next"
                                :total="table.total"
                                :page-size="table.pageSize"
                                :current-page.sync="table.page"
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
    import {TABLE_INFO} from "@/consts";
    import Breadcrumb from "@/components/Breadcrumb";
    import TripListMap from "./List/Map";

    import CustomizedMixin from "@/mixins/customized-component";

    const MAX_PAGE_SIZE = 100;
    const MAX_QUERY_TIME = 7;

    export default {
        components: {
            TripListMap,
            Breadcrumb
        },
        mixins: [CustomizedMixin],
        data() {
            return {
                map: {
                    currentTripId: null,
                    shownTripIds: [],
                    markers: [],
                    handle: null,
                    loadPercentage: 0,
                },
                vehicleId: null,
                badTripIds: [],
                table: {
                    data: [],
                    page: 1,
                    pageSize: 10,
                    total: 0,
                    filter: {
                        dateRange: []
                    }
                }
            };
        },
        computed: {
            entity() {
                if (this.table.data.length == 0) {
                    return null;
                }
                let tmp = this.table.data[0];
                return {
                    driver: tmp.driver,
                    device: tmp.deviceId,
                    plate_num: tmp.plateNum
                };
            },
            hasMergeButton() {
                return this.hasFeature('merge');
            },
            hasPagination() {
                return this.hasFeature('pagination');
            },
            /**
             * 在这里做请求验证
             * return boolean
             */
            isIllegalQuery() {
                return !this.hasPagination &&
                    this.table.filter.dateRange &&
                    this.$moment(this.table.filter.dateRange[1]).diff(this.$moment(this.table.filter.dateRange[0]), 'days') > MAX_QUERY_TIME
            }
        },
        created() {
            let vm = this;
            //引入语言包
            vm.importFontpack('Public/TripList');
            //初始化数据&&初始请求
            vm.vehicleId = vm.$route.params.vehicle_id;
            vm.table.filter.dateRange = [
                vm.$moment()
                    .subtract(1, "weeks")
                    .format("YYYY-MM-DD HH:mm:ss"),
                vm.$moment().format("YYYY-MM-DD HH:mm:ss")
            ];
            vm.$nextTick(function () {
                vm.getTableData(true);
            });
        },
        watch: {
            "table.data": function (val) {
                let vm = this;
                vm.map.shownTripIds = [];
                for (let i = 0; i < val.length; i++) {
                    vm.map.shownTripIds.push(val[i].tripId);
                }
            },
        },
        methods: {
            isBadTrip(tripId) {
                return this.badTripIds.filter(v => v == tripId).length > 0;
            },
            handleBadTrip(tripId) {
                if (this.badTripIds.indexOf(tripId) < 0) {
                    this.badTripIds.push(tripId);
                }
            },
            /**
             * 列表项鼠标移入
             * @param index
             */
            handleListMouseEnter(index) {
                this.map.currentTripId = this.table.data[index].tripId;
            },
            /**
             * 列表项鼠标移出
             * @param index
             */
            handleListMouseLeave(index) {
                this.map.currentTripId = null;
            },
            /**
             * 列表项点击
             * @param index
             */
            handleListClick(index) {
                let vm = this;
                let tripId = vm.table.data[index].tripId;
                if (vm.isBadTrip(tripId)) {
                    vm.$alert(vm.inputLocal('nodata'), vm.inputLocal('tips'), {
                        confirmButtonText: vm.inputLocal('sure'),
                        callback: action => {
                        }
                    });
                } else {
                    vm.$router.push({path: `/vehicles/${vm.vehicleId}/trips/${tripId}`});
                }
            },
            /**
             * 翻页事件
             * 由于page变量异步更新，所以需要在 nextTick 中调用
             */
            handlePageChange() {
                let vm = this;
                vm.$nextTick(() => {
                    vm.getTableData();
                })
            },
            getTableData(initPage, afterResponse) {
                let vm = this;
                //如果不分页只能查询7天数据
                if (vm.isIllegalQuery) {
                    vm.$message({
                        message: vm.inputLocal('illegalRequest'),
                        type: "warning",
                    });
                    return false;
                }
                //重新加载列表数据，取消之前的所有未完成请求
                if (vm.$refs['trip-map']) {
                    vm.$refs['trip-map'].cancelAllRequest();
                }
                if (initPage) {
                    vm.$set(vm.table, "page", 1);
                }
                vm.map.loadPercentage = null;
                vm.showLoadingInc();
                vm.getTripList().then(response => {
                    vm.hideLoadingInc();
                    let data = response.data.data;
                    if (data.total > MAX_PAGE_SIZE) {
                        vm.$message({
                            message: vm.inputLocal('countLimit'),
                            type: 'warning'
                        });
                    }
                    let list = data.list.map(v => {
                        v.mileage = Math.round(v.mileage / 100) / 10;
                        v.begin_at = {
                            date: vm.$moment(v.beginTime).format("ll"),
                            time: vm.$moment(v.beginTime).format("LTS")
                        };
                        v.end_at = {
                            date: vm.$moment(v.endTime).format("ll"),
                            time: vm.$moment(v.endTime).format("LTS")
                        };
                        v.duration = vm.shorthand(vm.$options.filters.formatDuration(v.duration));
                        //服务端地址反查使用高德，所以返回 unknow 时，需要前端反查
                        let addressChecker = [
                            'begin',
                            'end'
                        ];
                        for (let i in addressChecker) {
                            if (
                                (typeof addressChecker[i] == 'string' &&
                                    v[`${addressChecker[i]}Address`] &&
                                    v[`${addressChecker[i]}Gps`] &&
                                    v[`${addressChecker[i]}Address`].toLowerCase() == 'unknow')
                            ) {
                                let gps = v[`${addressChecker[i]}Gps`].split(',');
                                if (gps.length != 2) {
                                    v[`${addressChecker[i]}Address`] = vm.inputLocal('noaddress');
                                    continue;
                                }
                                vm.SaaSApi.geoRecode(gps[0], gps[1], vm.locale).then(response => {
                                    if (!response.data.data) {
                                        throw new Error();
                                    }
                                    v[`${addressChecker[i]}Address`] = response.data.data.formatted_address
                                }).catch(e => {
                                    v[`${addressChecker[i]}Address`] = vm.inputLocal('noaddress')
                                });
                            }
                        }
                        return v;
                    });
                    vm.$set(vm.table, "data", list);
                    vm.$set(vm.table, "total", data.total);
                });
            },
            shorthand(str){
                return  str.replace('mins','m').replace('secs','s');
            },
            getTripList() {
                return this.SaaSApi.getTripList(
                    this.vehicleId,
                    this.table.filter.dateRange[0],
                    this.table.filter.dateRange[1],
                    this.table.page,
                    this.hasPagination ? this.table.pageSize : MAX_PAGE_SIZE
                );
            },
            /**
             * 查看合并视图
             */
            handleMergeView() {
                let vm = this;

                let dateRange = vm.table.filter.dateRange;

                let from = vm.$moment(dateRange[0]).unix();
                let to = vm.$moment(dateRange[1]).unix();

                let duration = vm.$moment.duration(to - from, 'seconds');
                if (duration.days() > 7) {
                    vm.$alert(vm.inputLocal("mergeAlert"), vm.inputLocal("warning"), {
                        confirmButtonText: vm.inputLocal("confirm"),
                    });
                    return;
                }

                vm.$router.replace({
                    path: `/vehicles/${vm.vehicleId}/trips/merge`,
                    query: {
                        "from": dateRange[0],
                        "to": dateRange[1]
                    }
                });
            }
        }
    };
</script>

<style scoped lang="scss">
    .el-row--flex {
        height: 100%;
    }

    .stroke-btn {
        background: transparent;
        color: #409eff;
        padding: 7px 15px;
        &:hover {
            background-color: #157bfb;
        }
    }

    .hb-list {
        li {
            color: #ccc;
            background-color: #fafafa;
            padding: 8px 20px;
            border-bottom: 1px solid #e7ebf0;
            &:not(.disabled):hover {
                color: initial;
                position: relative;
                cursor: pointer;
                background-color: #fff;
                box-shadow: 0 2px 5px #ccc;
                time {
                    span {
                        &:first-child {
                            color: #cdd1d5;
                        }
                        &:last-child {
                            color: #354052;
                        }
                    }
                }
                address:first-child {
                    color: #3088f6;
                }
                address:last-child {
                    color: #f12c39;
                }
                .trip-line {
                    background: #4ab4f0;
                    div {
                        border-radius: 7px;
                        margin-left: -6px;
                        width: 14px;
                        height: 14px;
                        background: #4ab4f0;
                        &:first-child {
                            background-color: #3088f6;
                            background: url('../../../assets/endpoint.png') no-repeat;
                            background-size: 100%;
                        }
                        &:last-child {
                            background-color: #f12c39;
                            background: url('../../../assets/startpoint.png') no-repeat;
                            background-size: 100%;
                        }
                    }
                }
            }

            time {
                font-size: 80%;
            }
            address {
                font-size: 80%;
                font-style: normal;
            }
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
                    transition: all .3s;
                    transition-delay: .05s;
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
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                small {
                    width: 100%;
                    padding: 2px 0;

                    &:first-child {
                        align-items: flex-start;
                    }
                    &:nth-child(2) {
                        align-items: center;
                    }
                    &:last-child {
                        align-items: flex-end;
                    }
                }

                &:first-child {
                }

                &:nth-child(2) {
                    text-align: center;
                }
                &:last-child {
                }
            }
        }
    }

    .top-title {
        line-height: 24px;
        color: #cdd1d5;

    }

    .top-info {
        height: 58px;
        border-bottom: 1px solid #e7ebf0;
        margin: 0 !important;
        padding: 0px 0 5px 5px;
        box-sizing: border-box;
    }

    .top-content {
        line-height: 24px;
        color: #354052;
        margin-bottom: 5px;
    }

    .el-form {
        height: auto;
        padding: 15px 0 0 10px;
        box-sizing: border-box;
    }

    .form-filter .el-form-item {
        margin-bottom: 0;
    }

    .el-card__body {
        padding-bottom: 1px;
    }

    .el-container {
        height: 100%;
        border: 1px solid #e7ebf0;
    }

    .el-header {
        height: auto !important;
        background: #fff;
        border-bottom: 1px solid #e7ebf0;
        padding: 10px 0px;
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

    .el-footer {
        height: 40px !important;
        margin-top: 5px;
        padding-top: 5px;
        text-align: center;
        background: #fff;
        box-sizing: border-box;
    }

</style>
