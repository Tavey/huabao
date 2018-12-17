<template>
    <table-page :table-info.sync="table" @table-resource="getTableData"
                @table-selection-change="handleTableSectionChange">
        <template slot="form-filter-prepend">
            <el-form-item>
                <el-tooltip class="item"
                            effect="dark"
                            :content="inputLocal('fuzzyQuery')"
                            placement="top">
                    <el-input
                        :placeholder="inputLocal('devicesn')"
                        v-model="table.filter.device_sn">
                    </el-input>
                </el-tooltip>
            </el-form-item>
        </template>
        <template slot="form-filter-append">
            <el-form-item style="float: right">
                <el-button-group>
                    <el-button type="primary" plain
                               v-if="!isCompanyLevelLowest && !isActionBanned(RoleActions.DistributionDevice)"
                               :disabled="!sectionDistributable || isActionBanned(RoleActions.DistributionDevice)"
                               icon="fas fa-sitemap fa-fw" @click="distributionOpen(null)">
                        {{$t('distribution')}}
                    </el-button>
                    <el-button type="primary" plain
                               v-if="!isCompanyLevelLowest && !isActionBanned(RoleActions.RecycleDevice)"
                               :disabled="!sectionRecyclable || isActionBanned(RoleActions.RecycleDevice)"
                               icon="fas fa-recycle fa-fw" @click="recycleOpen(null)">
                        {{$t('recycle')}}
                    </el-button>
                </el-button-group>
                <el-button icon="fas fa-plus fa-fw"
                           v-if="hasFeature('create') && !isActionBanned(RoleActions.CreateDevice)"
                           :disabled="isActionBanned(RoleActions.CreateDevice)"
                           @click="handleEditorOpen({},'editableContainer')">
                    {{$t("addDevices")}}
                </el-button>
            </el-form-item>
        </template>
        <template slot="table-columns">
            <el-table-column v-if="!isCompanyLevelLowest" type="selection" width="55">
            </el-table-column>
            <el-table-column :label="inputLocal('devicesn')" prop="sn">
            </el-table-column>
            <el-table-column :label="inputLocal('company')">
                <template slot-scope="scope">
                    {{ scope.row.company.mch_name | defaults(inputLocal('null')) }}
                </template>
            </el-table-column>
            <el-table-column :label="inputLocal('type')" prop="type">
            </el-table-column>
            <el-table-column :label="inputLocal('work_mode')">
                <template slot-scope="scope">
                    {{ hardwareWorkMode[parseInt(scope.row.work_mode)] | defaults(inputLocal('unknown')) }}
                </template>
            </el-table-column>
            <el-table-column sort-by="firmware_version" :label="inputLocal('firmware_version')" prop="firmware_version">
            </el-table-column>
            <el-table-column :label="inputLocal('hardware_version')" prop="hardware_version">
            </el-table-column>
            <el-table-column :label="inputLocal('hardware_model')" prop="hardware_model">
            </el-table-column>
            <el-table-column :label="inputLocal('if_bind')">
                <template slot-scope="scope">
                    <span v-if="scope.row.if_bind == '0'">
                        <i class="fas fa-unlink fa-fw"></i> {{$t('unBind')}}</span>
                    <span v-else-if="scope.row.if_bind == '1'">
                        <i class="fas fa-link fa-fw"></i> {{$t('isBind')}}</span>
                    <span v-else>{{$t('unknown')}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="inputLocal('battery_remaining')" prop="battery_remaining">
            </el-table-column>
            <el-table-column :label="inputLocal('created_at')" prop="created_at">
            </el-table-column>
            <el-table-column :label="inputLocal('operation')" width="200px">
                <template slot-scope="scope">
                    <el-button type="primary" plain size="mini" icon="fa fa-edit fa-fw"
                               v-if="hasFeature('update') && !isActionBanned(RoleActions.UpdateDevice)"
                               :disabled="isActionBanned(RoleActions.UpdateDevice)"
                               @click="handleOpenEdit(scope.row,'editableContainer')">
                        {{$t('editor')}}
                    </el-button>
                    <el-button type="primary" plain size="mini" icon="fas fa-sitemap fa-fw"
                               v-if="scope.row.distributable && !isCompanyLevelLowest && !isActionBanned(RoleActions.DistributionDevice)"
                               :disabled="isActionBanned(RoleActions.DistributionDevice)"
                               @click="distributionOpen(scope.row)">
                        {{$t('distribution')}}
                    </el-button>
                    <el-button type="primary" plain size="mini" icon="fas fa-recycle fa-fw"
                               v-if="scope.row.recyclable && !isCompanyLevelLowest && !isActionBanned(RoleActions.RecycleDevice)"
                               :disabled="isActionBanned(RoleActions.RecycleDevice)" @click="recycleOpen(scope.row)">
                        {{$t('recycle')}}
                    </el-button>
                    <el-button type="primary" plain size="mini" icon="fas fa-unlink fa-fw"
                               v-if="scope.row.vehicle.id && !isActionBanned(RoleActions.UnbindDevice)"
                               :disabled="isActionBanned(RoleActions.UnbindDevice)" @click="unbindOpen(scope.row)">
                        {{$t('unbind')}}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column type="expand">
                <template slot-scope="props">
                    <el-form label-position="left" inline class="table-expand">
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('imei')">
                                    <span>{{ props.row.imei | defaults(inputLocal('isNotSet')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('firmwareUpgradeOption')">
                                    <span>{{ firmwareUpgradeOption[props.row.firmware_upgrade_option] | defaults(`${inputLocal('unknown')}(${props.row.firmware_upgrade_option}）`) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('initAngleX')">
                                    <span>{{ props.row.init_angle_x | defaults(inputLocal('isNotSet')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('latestUpgradedAt')">
                                    <span>{{ props.row.latest_upgraded_at | formatDateTime | defaults(inputLocal('null')) }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('iccid')">
                                    <span>{{ props.row.iccid | defaults(inputLocal('isNotSet')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('modifiedAt')">
                                    <span>{{ props.row.modified_at | formatDateTime | defaults(inputLocal('isNotSet')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('initAngleY')">
                                    <span>{{ props.row.init_angle_y | defaults(inputLocal('isNotSet')) }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <el-form-item label="MAC">
                                    <span>{{ props.row.mac | defaults(inputLocal('isNotSet')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('latestActivatedAt')">
                                    <span>{{ props.row.latest_activated_at | formatDateTime | defaults(inputLocal('isNotSet')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('initAngleZ')">
                                    <span>{{ props.row.init_angle_z | defaults(inputLocal('isNotSet')) }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </template>
            </el-table-column>
        </template>
        <template slot="dialog-container">
            <el-dialog :title="dialogName" :visible.sync="editorVisible" @close="editorVisible = false" width="45%">
                <el-form size="small" label-width="85px" class="form-item" :model="editableContainer"
                         ref="editableContainer">
                    <el-row :gutter="20">
                        <el-col>
                            <el-form-item :label="inputLocal('devicesn')" prop="sn"
                                          :rules="filterRules({type:'special',min:8,max:8,required:true})">
                                <el-input v-model="editableContainer.sn"
                                          :placeholder="inputLocal('inputDevice')"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col>
                            <el-form-item :label="inputLocal('deviceInfo')" prop="hardwareInfoOptions" :rules="[
                                                { type: 'array', required: true, message: inputLocal('must'), trigger: 'blur' }
                                           ]">
                                <el-cascader style="width: 100%;" :options="hardwareInfo"
                                             v-model="editableContainer.hardwareInfoOptions">
                                </el-cascader>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="editorVisible = false">{{$t('cancel')}}</el-button>
                    <el-button type="primary" @click="submitForm('editableContainer')">{{$t('save')}}</el-button>
                </div>
            </el-dialog>
            <el-dialog :title="inputLocal('unbind')" @close="unbindVisible=false" :visible.sync="unbindVisible"
                       width="30%">
                <el-form label-position="left" label-width="85px" size="mini" :model="editableContainer"
                         ref="editableContainer">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('vehicle_plate_num')">
                                <span>{{editableContainer.vehicle_plate_num}}</span>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('devicesn')">
                                <span>{{editableContainer.sn}}</span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>

                <span>{{$t('sureRemove')}}</span>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="unbindVisible = false">{{$t('cancel')}}</el-button>
                    <el-button type="primary" @click="unbindVehicleDevice">{{$t('sure')}}</el-button>
                </div>
            </el-dialog>
            <el-dialog :title="inputLocal('recycle')" @close="recycleClose" :visible.sync="recycleVisible" width="30%">
                <span>{{$t('sureRecycle')}}</span>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="recycleClose">{{$t('cancel')}}</el-button>
                    <el-button type="primary" @click="recycleDevice">{{$t('sure')}}</el-button>
                </div>
            </el-dialog>
            <el-dialog :title="inputLocal('distribution')" @close="distributionClose"
                       :visible.sync="distributionVisible" width="30%">
                <el-form label-position="left" label-width="85px" size="mini">
                    <el-form-item :label="inputLocal('company')">
                        <el-select :placeholder="inputLocal('choose_company')" style="width: 100%;"
                                   v-model="distributionCompanyId">
                            <el-option v-for="company in companies" :key="company.id" :label="company.name"
                                       :value="company.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>

                <div slot="footer" class="dialog-footer">
                    <el-button @click="distributionClose">{{$t('cancel')}}</el-button>
                    <el-button type="primary" :disabled="!distributionCompanyId" @click="distributionDevice">
                        {{$t('sure')}}
                    </el-button>
                </div>
            </el-dialog>
        </template>
    </table-page>

</template>

<script>
    import _ from "lodash";
    import {
        HARDWARE_INFO,
        HARDWARE_WORK_MODE,
        FIRMWARE_UPGRADE_OPTION,
        TABLE_INFO
    } from "@/consts";
    import TablePage from "@/components/TablePage";
    import TableMixin from "@/mixins/table-component";
    import CustomizedMixin from "@/mixins/customized-component";

    export default {
        components: {
            TablePage
        },
        mixins: [TableMixin, CustomizedMixin],
        data() {
            return {
                hardwareInfo: HARDWARE_INFO,
                hardwareWorkMode: HARDWARE_WORK_MODE,
                firmwareUpgradeOption: FIRMWARE_UPGRADE_OPTION,
                companies: [],
                table: {
                    sections: [],
                    data: [],
                    page: 1,
                    pageSize: TABLE_INFO.DEFAULT_PAGE_SIZE,
                    total: 0,
                    saveLoading: false,
                    filter: {
                        device_sn: ""
                    }
                },
                unbindVisible: false,
                distributionType: null,
                distributionVisible: false,
                distributionCompanyId: null,
                recycleType: null,
                recycleVisible: false,
                recycleCompanyId: null
            };
        },
        computed: {
            /**
             * 多选项可分配
             */
            sectionDistributable() {
                if (this.table.sections.length <= 0) return false;
                return _.reduce(
                    this.table.sections,
                    function (result, item) {
                        return result && item.distributable;
                    },
                    true
                );
            },
            /**
             * 多选项可回收
             */
            sectionRecyclable() {
                if (this.table.sections.length <= 0) return false;
                return _.reduce(
                    this.table.sections,
                    function (result, item) {
                        return result && item.recyclable;
                    },
                    true
                );
            }
        },
        created() {
            this.importFontpack("Console");
            this.importFontpack("Console/Device");
        },
        methods: {
            handleOpenEdit(row, formName) {
                let vm = this;
                vm.handleEditorOpen(row, formName, row => {
                    row.hardwareInfoOptions = [
                        row.type,
                        row.manufacturer,
                        row.hardware_model,
                        row.hardware_version
                    ];
                    let copy = JSON.parse(JSON.stringify(row));
                    vm.$set(vm.$data, "editableContainer", copy);
                });
            },
            afterResponse() {
                let vm = this;
                vm.getDeviceList().then(response => {
                    vm.hideLoadingInc();
                    let data = response.data.data;
                    let list = data.list.map(v => {
                        v.company =
                            v.mchRegShorts && v.mchRegShorts.length > 0
                                ? _.orderBy(
                                v.mchRegShorts,
                                ["level"],
                                ["desc"]
                                ).shift()
                                : null;
                        v.distributable =
                            !v.vehicle.id &&
                            v.company.mch_id == vm.currentCompany.id;
                        v.recyclable =
                            !v.vehicle.id &&
                            v.company.mch_id != vm.currentCompany.id &&
                            vm.currentCompany.level < v.company.level;

                        v.created_at = vm.$options.filters.formatDateTime(
                            v.created_at
                        );
                        v.vehicle_plate_num = v.vehicle.plate_num;
                        return v;
                    });
                    vm.$set(vm.table, "data", list);
                    vm.$set(vm.table, "total", data.total);
                });
            },
            /**
             * 分配窗口打开
             * @param row
             */
            distributionOpen(row) {
                let vm = this;
                vm.distributionVisible = true;
                vm.getCompanies().then(response => {
                    vm.hideLoadingInc();
                    let data = response.data.data;
                    vm.companies = data.list;
                });
                if (row) {
                    vm.distributionType = "single";
                    let copy = JSON.parse(JSON.stringify(row));
                    vm.$set(vm.$data, "editableContainer", copy);
                } else {
                    vm.distributionType = "multi";
                }
            },
            /**
             * 分配窗口关闭
             */
            distributionClose() {
                this.distributionVisible = false;
                this.distributionCompanyId = null;
            },
            /**
             * 设备分配逻辑
             */
            distributionDevice() {
                let vm = this;
                let devices = [];
                switch (vm.distributionType) {
                    case "single":
                        devices = [vm.editableContainer.sn];
                        break;
                    case "multi":
                        devices = vm.table.sections.map(v => v.sn);
                        break;
                    default:
                        break;
                }
                vm.showLoadingInc();
                vm.SaaSApi.distributeDevices(
                    vm.distributionCompanyId,
                    devices
                ).then(res => {
                    vm.hideLoadingInc();
                    vm.$notify({
                        title: vm.inputLocal("success"),
                        type: "success"
                    });
                    vm.getTableData();
                    vm.distributionClose();
                });
            },
            /**
             * 回收确认窗口打开
             */
            recycleOpen(row) {
                let vm = this;
                vm.recycleVisible = true;
                if (row) {
                    vm.recycleType = "single";
                    let copy = JSON.parse(JSON.stringify(row));
                    vm.$set(vm.$data, "editableContainer", copy);
                } else {
                    vm.recycleType = "multi";
                }
            },
            /**
             * 分配窗口关闭
             */
            recycleClose() {
                this.recycleVisible = false;
                this.recycleCompanyId = null;
            },
            /**
             * 回收设备
             */
            recycleDevice() {
                let vm = this;
                let devices = [];
                switch (vm.recycleType) {
                    case "single":
                        devices = [vm.editableContainer.sn];
                        break;
                    case "multi":
                        devices = vm.table.sections.map(v => v.sn);
                        break;
                    default:
                        break;
                }
                vm.showLoadingInc();
                vm.SaaSApi.recycleDevices(vm.currentCompany.id, devices).then(
                    res => {
                        vm.hideLoadingInc();
                        vm.$notify({
                            title: vm.inputLocal("success"),
                            type: "success"
                        });
                        vm.getTableData();
                        vm.recycleClose();
                    }
                );
            },
            /**
             * 解绑窗口打开
             * @param row
             */
            unbindOpen(row) {
                let vm = this;
                vm.unbindVisible = true;
                let copy = JSON.parse(JSON.stringify(row));
                vm.$set(vm.$data, "editableContainer", copy);
            },
            /**
             * 设备解绑逻辑
             * @return {*|PromiseLike<T>|Promise<T>}
             */
            unbindVehicleDevice() {
                let vm = this;
                const loading = this.$loading({
                    lock: true,
                    target: document.querySelector(".el-dialog")
                });
                let successCallback = () => {
                    vm.$nextTick(() => {
                        vm.getTableData();
                        loading.close();
                        vm.unbindVisible = false;
                    });
                };
                return vm.SaaSApi.deleteVehicleDevice(
                    vm.editableContainer.vehicle.id,
                    vm.editableContainer.sn
                ).then(successCallback);
            },
            queryDevice() {
                let vm = this;
                return vm.SaaSApi.getDeviceByCompany(
                    vm.currentCompany.id,
                    vm.editableContainer.sn.toUpperCase()
                );
            },
            saveInfo(successCallback) {
                let vm = this;
                vm.queryDevice().then(response => {
                    let data = response.data.data;
                    if (data != null && data.id != vm.editableContainer.id) {
                        vm.hideLoadingInc();
                        vm.$notify({
                            title: vm.inputLocal("error"),
                            message: vm.inputLocal("repeat"),
                            type: "error"
                        });
                    } else {
                        if (vm.editableContainer.id) {
                            return vm.SaaSApi.editDevice(vm.editableContainer.id, {
                                company_id: vm.currentCompany.id,
                                type: vm.editableContainer.hardwareInfoOptions[0],
                                manufacturer:
                                    vm.editableContainer.hardwareInfoOptions[1],
                                hardware_model:
                                    vm.editableContainer.hardwareInfoOptions[2],
                                hardware_version:
                                    vm.editableContainer.hardwareInfoOptions[3],
                                sn: vm.editableContainer.sn.toUpperCase()
                            }).then(successCallback);
                        } else {
                            return vm.SaaSApi.createDevice(this.currentCompany.id, {
                                type: vm.editableContainer.hardwareInfoOptions[0],
                                manufacturer:
                                    vm.editableContainer.hardwareInfoOptions[1],
                                hardware_model:
                                    vm.editableContainer.hardwareInfoOptions[2],
                                hardware_version:
                                    vm.editableContainer.hardwareInfoOptions[3],
                                sn: vm.editableContainer.sn.toUpperCase()
                            }).then(successCallback);
                        }
                    }
                });
            },
            /**
             * 请求当前商户子商户
             * 分配只允许向下分配
             * @return {*}
             */
            getCompanies() {
                return this.SaaSApi.getCompanies(this.currentCompany.id);
            },
            getDeviceList() {
                return this.SaaSApi.getDevices(
                    this.currentCompany.id,
                    {device_sn: this.table.filter.device_sn},
                    this.table.page,
                    this.table.pageSize
                );
            },
            /**
             * 表格行选择
             * @param section
             */
            handleTableSectionChange(section) {
                this.table.sections = section;
            }
        }
    };
</script>

<style scoped>
    /*@formatter:off*/
/* prettier-ignore */
.form-item >>> .el-form-item__label {
        text-align: left;
    }

/*@formatter:on*/
</style>
