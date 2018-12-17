<template>
    <table-page
        :bread="bread" :table-info.sync="table"
        @table-resource="getTableData">
        <template slot="form-filter-prepend">
            <el-form-item>
                <el-tooltip
                    class="item"
                    effect="dark"
                    :content="inputLocal('formInputToolTip')"
                    placement="bottom-end">
                    <el-input
                        style="width:200px"
                        v-model="table.filter.device_sn"
                        suffix-icon="fas fa-question fa-fw"
                        :placeholder="inputLocal('deviceSn')"
                        clearable></el-input>
                </el-tooltip>
            </el-form-item>
            <el-form-item>
                <el-date-picker
                    v-model="table.filter.date_range"
                    type="datetimerange"
                    :range-separator="inputLocal('to')"
                    :start-placeholder="inputLocal('startTime')"
                    :end-placeholder="inputLocal('endTime')"
                    value-format="yyyy-MM-dd HH:mm:ss">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-tooltip
                    class="item"
                    effect="dark"
                    :content="inputLocal('formInputToolTip')"
                    placement="bottom-end">
                    <el-input style="width:200px"
                              v-model="table.filter.keywords"
                              suffix-icon="fas fa-question fa-fw"
                              :placeholder="inputLocal('keywords')"
                              clearable></el-input>
                </el-tooltip>
            </el-form-item>
        </template>
        <template slot="form-filter-append">
            <p style="line-height: 35px;margin-top: 0;">
                <el-checkbox
                    style="margin-left: 5px"
                    :indeterminate="isIndeterminate"
                    v-model="checkAll"
                    @change="handleCheckAllChange">
                    {{ inputLocal("selectAll") }}
                </el-checkbox>
                <br/>
                <el-checkbox-group
                    v-model="table.filter.event_types"
                    size="mini"
                    @change="handleCheckedEventTypesChange">
                    <el-checkbox-button
                        v-for="(n,i) in logType"
                        :key="i"
                        :label="i"
                    >
                        {{inputLocal(`LOG_TYPE.${i}`)}}
                    </el-checkbox-button>
                </el-checkbox-group>
            </p>
        </template>
        <template slot="additional-modules">
        <textarea
            ref="copyExtra"
            type="textarea"
            style="width:0;height:0;opacity:0;position:absolute;"
            v-model="copyText"
        ></textarea>
        </template>
        <template slot="table-columns">
            <el-table-column prop="device.id" width="100" :label="inputLocal('deviceId')"></el-table-column>
            <el-table-column prop="device.type" width="80" :label="inputLocal('deviceType')"></el-table-column>
            <el-table-column prop="triggered_at" :label="inputLocal('triggerTime')">
                <template slot-scope="scope">
                    <small>{{ scope.row.triggered_at | formatDateTime }}</small>
                </template>
            </el-table-column>
            <el-table-column prop="reported_at" :label="inputLocal('reportTime')">
                <template slot-scope="scope">
                    <small style="margin-right: 5px">{{ scope.row.reported_at | formatDateTime }}</small>
                    <small v-if="scope.row.reported_duration != 0" :class="{
                        'el-color-success':scope.row.reported_duration >= 0,
                        'el-color-danger':scope.row.reported_duration < 0,
                    }">
                        <span v-if="scope.row.reported_duration >= 0">+</span>
                        <span>{{ scope.row.reported_duration | formatDuration('h:mm:ss') }}</span>
                    </small>
                </template>
            </el-table-column>
            <el-table-column prop="received_at" :label="inputLocal('receiveTime')" sortable="custom">
                <template slot-scope="scope">
                    <small style="margin-right: 5px">{{ scope.row.received_at | formatDateTime }}</small>
                    <small v-if="scope.row.received_duration != 0" :class="{
                        'el-color-success':scope.row.received_duration > 0,
                        'el-color-danger':scope.row.received_duration < 0,
                    }">
                        <span v-if="scope.row.received_duration >= 0">+</span>
                        <span>{{ scope.row.received_duration | formatDuration('h:mm:ss') }}</span>
                    </small>
                </template>
            </el-table-column>
            <el-table-column width="120" prop="type_show" :label="inputLocal('eventType')">
                <template slot-scope="scope">
                    <small v-if="scope.row.type == 31">
                        <el-tooltip :content="scope.row.parsed_data" placement="top" transition="none">
                            <span>
                                {{ scope.row.type_show }}
                                <i class="fal fa-exclamation-circle fa-fw"></i>
                            </span>
                        </el-tooltip>
                    </small>
                    <small v-else>{{ scope.row.type_show }}</small>

                </template>
            </el-table-column>
            <el-table-column width="50" :label="inputLocal('verify')">
                <template slot-scope="scope">
                    <i :class="{
                        'fal':true,
                        'fa-thumbs-up': scope.row.is_validated == 1,
                        'fa-thumbs-down': scope.row.is_validated == 0,
                        'fa-fw': true,
                        'el-color-success':scope.row.is_validated == 1,
                        'el-color-danger':scope.row.is_validated == 0,
                    }"></i>
                </template>
            </el-table-column>
            <el-table-column width="120" :label="inputLocal('packetSize')">
                <template slot-scope="scope">
                    <small>
                        <span :class="{
                            'el-color-success':scope.row.data_size_device == scope.row.data_size_received,
                            'el-color-danger':scope.row.data_size_device != scope.row.data_size_received,
                        }">
                            {{ scope.row.data_size_device }}
                        </span>
                        <span v-if="scope.row.data_size_device != scope.row.data_size_received">
                            <span>/</span>
                            <span class="el-color-danger">
                                {{ scope.row.data_size_received - scope.row.data_size_device }}
                            </span>
                        </span>
                    </small>
                </template>
            </el-table-column>
            <el-table-column width="80" :label="inputLocal('protocol')">
                <template slot-scope="scope">
                    <small v-if="scope.row.protocol_version">{{ scope.row.protocol_version }}</small>
                    <small v-else class="el-color-danger"> -</small>
                </template>
            </el-table-column>
            <el-table-column type="expand">
                <template slot-scope="props">
                    <el-row>
                        <el-col :span="3">Event ID</el-col>
                        <el-col :span="21">
                            <el-tooltip placement="top" transition="none">
                                <div slot="content">{{ inputLocal('clickToCopy') }}</div>
                                <span class="expand_item" @click="handleCopy">{{ props.row.id }}</span>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                    <el-row style="margin-top: 10px">
                        <el-col :span="3">{{ inputLocal('parsedData') }}</el-col>
                        <el-col :span="21">
                            <el-tooltip placement="top" transition="none">
                                <div slot="content">{{ inputLocal('clickToCopy') }}</div>
                                <span class="expand_item" @click="handleCopy">{{ props.row.parsed_data }}</span>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                    <el-row style="margin-top: 10px">
                        <el-col :span="3">{{ inputLocal('rawData') }}</el-col>
                        <el-col :span="21" style="word-break: break-all">
                            <el-tooltip placement="top" transition="none">
                                <div slot="content">{{ inputLocal('clickToCopy') }}</div>
                                <span class="expand_item" @click="handleCopy">{{ props.row.raw_data }}</span>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
        </template>

    </table-page>
    <!-- </div> -->
</template>

<script>
import { LOG_TYPE, TABLE_INFO } from "@/consts";
import TablePage from "@/components/TablePage";
import TableMixin from "@/mixins/table-component";
import PageMixin from "@/mixins/page-component";

export default {
    components: {
        TablePage
    },
    mixins: [TableMixin, PageMixin],
    data() {
        return {
            logType: LOG_TYPE,
            bread: [
                {
                    text: "数据",
                    icon: "hb-icon hb-icon-chart"
                }
            ],
            checkAll: true,
            isIndeterminate: false,
            table: {
                data: [],
                page: 1,
                pageSize: 100 || TABLE_INFO.DEFAULT_PAGE_SIZE,
                total: 0,
                filter: {
                    event_types: [],
                    date_range: [],
                    device_sn: "",
                    keywords: ""
                },
                sort: {
                    prop: "received_at",
                    order: "descending"
                }
            },
            copyText: ""
        };
    },
    created() {
        let vm = this;
        vm.table.filter.date_range = [
            vm
                .$moment()
                .subtract(3, "days")
                .format("YYYY-MM-DD HH:mm:ss"),
            vm.$moment().format("YYYY-MM-DD HH:mm:ss")
        ];
        vm.table.filter.event_types = Object.keys(vm.logType);
        vm.importFontpack("Console/Logs");
    },
    mounted() {},
    methods: {
        handleCheckAllChange(value) {
            this.table.filter.event_types = value
                ? Object.keys(this.logType)
                : [];
            this.isIndeterminate = false;
        },
        handleCheckedEventTypesChange(value) {
            let checkedCount = value.length;
            this.checkAll = checkedCount === Object.keys(this.logType).length;
            this.isIndeterminate =
                checkedCount > 0 &&
                checkedCount < Object.keys(this.logType).length;
        },
        getTableData(initPage) {
            let vm = this;
            return new Promise((resolve, reject) => {
                if (initPage) {
                    vm.$set(vm.table, "data", []);
                    vm.$set(vm.table, "page", 1);
                }
                vm.showLoadingInc();
                vm.$nextTick(() => {
                    vm.getLogList().then(response => {
                        vm.hideLoadingInc();
                        let data = response.data.data;

                        let list = data.list.map(v => {
                            v.type_show = vm.inputLocal(`LOG_TYPE.${v.type}`);
                            let triggered_at = vm.$moment(v.triggered_at);
                            let reported_at = vm.$moment(v.reported_at);
                            let received_at = vm.$moment(v.received_at);

                            v.reported_duration =
                                reported_at.unix() - triggered_at.unix();
                            v.received_duration =
                                received_at.unix() - reported_at.unix();

                            v.protocol_version = parseFloat(
                                v.protocol_version
                            ).toFixed(2);
                            return v;
                        });
                        vm.$set(vm.table, "total", data.total);
                        vm.$set(vm.table, "data", list);
                        resolve(list);
                    });
                });
            });
        },
        getLogList() {
            let vm = this;
            let sortString = null;
            if (vm.table.sort) {
                let map = {
                    ascending: "asc",
                    descending: "desc"
                };
                sortString = `${vm.table.sort.prop},${
                    map[vm.table.sort.order]
                }`;
            }
            return vm.SaaSApi.getLogs(
                vm.currentCompany.id,
                vm.table.filter.date_range[0],
                vm.table.filter.date_range[1],
                [].join.call(vm.table.filter.event_types, ","),
                vm.table.filter.device_sn,
                vm.table.filter.keywords,
                sortString,
                vm.table.page,
                vm.table.pageSize
            );
        },
        handleCopy(e) {
            let vm = this;
            vm.copyText = e.srcElement.innerText;
            setTimeout(() => {
                vm.$refs.copyExtra.select();
                document.execCommand("copy");
                vm.SuccessTip();
            }, 100);
        },
        SuccessTip() {
            let vm = this;
            vm.$message({
                duration: 1000,
                message: vm.inputLocal("copySuccess"),
                type: "success"
            });
        }
    }
};
</script>

<style scoped lang="scss">
.extra_scroll {
    min-width: 300px;
    max-width: 500px;
    max-height: 400px;
    overflow-y: scroll;
    word-wrap: break-word;
}

.el-tag--medium {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 90px;
}

.expand_item {
    word-break: break-all;
    &:hover {
        cursor: pointer;
        background-color: rgba(64, 158, 255, 0.1);
    }
    &:active {
        background-color: rgba(64, 158, 255, 0.5);
    }
}
</style>
<style scoped>
/*@formatter:off*/
.el-checkbox-group>>>.el-checkbox-button {
    margin: 0 5px;
}
.el-checkbox-group>>>.el-checkbox-button__inner {
    border: none;
    border-radius: 4px;
}
/*@formatter:on*/
</style>
