<template>
    <table-page :table-info.sync="table"
                @table-resource="getTableData">
        <template slot="form-filter-prepend">
            <el-form-item style="width: 250px;">
                <el-tooltip class="item" effect="dark" :content="inputLocal('fuzzyQuery')"
                            placement="top">
                    <el-input :placeholder="inputLocal('input_content')"
                              v-model="table.filter.value"
                              class="input-with-select"
                              style="width: 100%;">
                        <el-select v-model="table.filter.type"
                                   slot="prepend">
                            <el-option :label="inputLocal('plate_num')"
                                       value="plate_num">
                            </el-option>
                            <el-option :label="inputLocal('device_sn')"
                                       value="device_sn"></el-option>
                        </el-select>
                    </el-input>
                </el-tooltip>
            </el-form-item>
        </template>
        <template slot="form-filter-append">
            <el-form-item style="float: right">
                <el-button icon="fas fa-plus fa-fw"
                           v-if="hasFeature('create') && !isActionBanned(RoleActions.CreateVehicle)"
                           :disabled="isActionBanned(RoleActions.CreateVehicle)"
                           @click="handleEditorOpen({},'editableContainer')">
                    {{$t('add_vehicle')}}
                </el-button>
            </el-form-item>
        </template>
        <template slot="table-columns">
            <el-table-column :label="inputLocal('serial')"
                             prop="vehicleId">
            </el-table-column>
            <el-table-column :label="inputLocal('plate_num')"
                             prop="plateNum">
            </el-table-column>
            <el-table-column :label="inputLocal('device_sn')">
                <template slot-scope="scope">
                    <span>{{ scope.row.bindDevice | defaults(inputLocal('null')) }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="inputLocal('driver')"
                             prop="driver">
            </el-table-column>
            <el-table-column :label="inputLocal('brand_name')"
                             prop="brandName">
            </el-table-column>
            <el-table-column :label="inputLocal('use_type')"
                             prop="useTypeShow">
            </el-table-column>
            <el-table-column :label="inputLocal('modified_at')">
                <template slot-scope="scope">
                    <span>{{ scope.row.modifyTime | formatDateTime | defaults(inputLocal('null')) }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="inputLocal('operation')"
                             width="320">
                <template slot-scope="scope">
                    <el-button type="primary"
                               size="mini"
                               plain
                               icon="fas fa-edit fa-fw"
                               v-if="hasFeature('update') && !isActionBanned(RoleActions.UpdateVehicle)"
                               :disabled="isActionBanned(RoleActions.UpdateVehicle)"
                               @click="handleEditorOpen(scope.row,'editableContainer')">{{$t('editor')}}
                    </el-button>
                    <!--<el-button type="primary" plain size="mini"-->
                    <!--:disabled="isActionBanned(RoleActions.TripList)"-->
                    <!--@click="$router.push({-->
                    <!--path:`vehicles/${scope.row.id}/trips`,-->
                    <!--query:{-->
                    <!--driver_name:scope.row.driver,-->
                    <!--plate_num:scope.row.plateNum,-->
                    <!--device_sn:scope.row.bindDevice-->
                    <!--}-->
                    <!--})">-->
                    <!--{{$t('tripList')}}-->
                    <!--</el-button>-->
                    <el-button type="primary"
                               plain
                               size="mini"
                               icon="fas fa-unlink fa-fw"
                               v-if="hasFeature('unbind') && scope.row.bindDevice && !isActionBanned(RoleActions.UnbindDevice)"
                               :disabled="isActionBanned(RoleActions.UnbindDevice)"
                               @click="deleteOpen(scope.row)">
                        {{$t('unbundling_devices')}}
                    </el-button>
                    <el-button type="primary"
                               plain
                               size="mini"
                               icon="fas fa-exchange-alt fa-fw"
                               v-if="hasFeature('rebind') && scope.row.bindDevice && !isActionBanned(RoleActions.RebindDevice) /* && scope.row.if_bind == 1 */"
                               :disabled="isActionBanned(RoleActions.RebindDevice)"
                               @click="changeOpen(scope.row)">
                        {{$t('replace_devices')}}
                    </el-button>
                    <el-button type="primary"
                               plain
                               size="mini"
                               icon="fas fa-link fa-fw"
                               v-if="hasFeature('bind') &&  !scope.row.bindDevice && !isActionBanned(RoleActions.BindDevice) /*|| scope.row.if_bind == 0*/"
                               :disabled="isActionBanned(RoleActions.BindDevice)"
                               @click="changeOpen(scope.row)">
                        {{$t('binding_devices')}}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column type="expand"
                             v-if="!isActionBanned(RoleActions.VehicleDetail)">
                <template slot-scope="props">
                    <el-form label-position="left"
                             inline
                             class="table-expand"
                             label-width="100px">
                        <el-row :gutter="20">
                            <el-col :span="12">
                                {{$t('vehicle_info')}}
                            </el-col>
                            <el-col :span="12"
                                    v-if="props.row.bindDevice">
                                {{$t('devices_info')}}
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('name')">
                                    <span>{{ props.row.driver | defaults(inputLocal('not_set')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('mobile')">
                                    <span>{{ props.row.mobile | defaults(inputLocal('not_set')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6"
                                    v-if="props.row.bindDevice">
                                <el-form-item :label="inputLocal('device_type')">
                                    <span>{{ props.row.extraDevice && props.row.extraDevice.deviceType | defaults(inputLocal('null'))}}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6"
                                    v-if="props.row.bindDevice">
                                <el-form-item :label="inputLocal('firmware_version')">
                                    <span>{{ props.row.extraDevice && props.row.extraDevice.fwVer | defaults(inputLocal('null')) }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('plate_num')">
                                    <span>{{ props.row.plateNum | defaults(inputLocal('not_set')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('use_vehicle_type')">
                                    <span>{{ props.row.use_type_show | defaults(inputLocal('notSet')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6"
                                    v-if="props.row.bindDevice">
                                <el-form-item :label="inputLocal('sn_serial')">
                                    <span>{{ props.row.bindDevice | defaults(inputLocal('null'))}}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('model_id')">
                                    <span>{{ props.row.modelId }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('created_at')">
                                    <span>{{ props.row.createTime | formatDateTime | defaults(inputLocal('not_set')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6"
                                    v-if="props.row.bindDevice">
                                <el-form-item :label="inputLocal('latest_activated_at')">
                                    <span>{{ props.row.extraDevice && props.row.extraDevice.latestActiveTime | formatDateTime | defaults(inputLocal('null')) }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('total_mile')">
                                    <span>{{toKM(props.row.totalMile) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('avg_speed')">
                                    <span>{{ props.row.avgSpeed && props.row.avgSpeed.toFixed(2)+' km/h' | defaults(inputLocal('no_data')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6"
                                    v-if="props.row.bindDevice">
                                <el-form-item :label="inputLocal('hardware_model')">
                                    <span>{{ props.row.extraDevice && props.row.extraDevice.hwModel | defaults(inputLocal('null')) }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('total_duration')">
                                    <span>{{toHour(props.row.totalDuration)}}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item :label="inputLocal('avg_trip')">
                                    <span>{{ props.row.avgTrip && props.row.avgTrip.toFixed(2) +' km'| defaults(inputLocal('no_data')) }}</span>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6"
                                    v-if="props.row.bindDevice">
                                <el-form-item :label="inputLocal('hardware_version')">
                                    <span>{{ props.row.extraDevice && props.row.extraDevice.hwVer | defaults(inputLocal('null')) }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </template>
            </el-table-column>
        </template>
        <template slot="dialog-container">
            <el-dialog :visible.sync="editorVisible"
                       width="35%"
                       @close="editorVisible=false"
                       :title="dialogName">
                <el-form label-position="left"
                         label-width="95px"
                         :model="editableContainer"
                         ref="editableContainer">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('plate_num')"
                                          prop="plateNum"
                                          :rules="filterRules({required:true,type:'plateNum'})">
                                <el-input v-model="editableContainer.plateNum"
                                          :placeholder="inputLocal('input_plate_num')"
                                          :maxlength="10">
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('vin')"
                                          prop="vin"
                                          :rules="filterRules({required:true})">
                                <el-input v-model="editableContainer.vin"
                                          :maxlength="17"
                                          :placeholder="inputLocal('input_vin')">
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('engine_num')"
                                          prop="engineNum"
                                          :rules="filterRules({required:true})">
                                <el-input v-model="editableContainer.engineNum"
                                          :placeholder="inputLocal('input_engine_num')"
                                          :maxlength="20">
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('use_type')"
                                          prop="useType"
                                          :rules="filterRules({change:true})">
                                <el-select v-model="editableContainer.useType"
                                           :placeholder="inputLocal('choose')"
                                           style="width: 100%;"
                                           prop="useType">
                                    <el-option v-for="(n,i) in vehiclesType"
                                               :key="i"
                                               :label="n"
                                               :value="i">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('brand_name')"
                                          prop="brandName"
                                          :rules="filterRules({required:true})">
                                <el-input v-model="editableContainer.brandName"
                                          :placeholder="inputLocal('input_brand')"
                                          :maxlength="20"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('specific')"
                                          prop="modelId"
                                          :rules="filterRules({required:true})">
                                <el-input v-model="editableContainer.modelId"
                                          :placeholder="inputLocal('input_specific')"
                                          :maxlength="20"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('driver')"
                                          prop="driver"
                                          :rules="filterRules({required:true})">
                                <el-input v-model="editableContainer.driver"
                                          :placeholder="inputLocal('input_driver')"
                                          :maxlength="10"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('contact')"
                                          prop="mobile"
                                          :rules="filterRules({required:true,maxLength:36})">
                                <el-input v-model="editableContainer.mobile"
                                          :placeholder="inputLocal('input_contact')"
                                          :maxlength="11"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-form-item :label="inputLocal('purchased_at')"
                                          prop="purchaseDate"
                                          :rules="filterRules({required:true})">
                                <el-date-picker style="width: 100%;"
                                                v-model="editableContainer.purchaseDate"
                                                type="date"
                                                :placeholder="inputLocal('choose_date')"
                                                align="right"
                                                value-format="yyyy-MM-dd">
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <span slot="footer"
                      class="dialog-footer">
                    <el-button @click="editorVisible = false">{{$t('close')}}</el-button>
                    <el-button type="primary"
                               @click="submitForm('editableContainer')">{{$t('save')}}</el-button>
                </span>
            </el-dialog>
            <el-dialog width="40%"
                       @close="bindVisible=false"
                       :title="dialogDeviceName"
                       :visible.sync="bindVisible">
                <el-form label-position="left"
                         label-width="85px"
                         :model="editableContainer"
                         ref="editableContainer">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('device_sn')"
                                          prop="bindDevice"
                                          :rules="filterRules({required:true})">
                                <el-input v-model="editableContainer.bindDevice"
                                          :placeholder="bindDevicePlaceholder ? bindDevicePlaceholder : inputLocal('input_device_sn')"
                                          :maxlength="8"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <span slot="footer"
                      class="dialog-footer">
                    <el-button @click="bindVisible = false">{{$t('cancel')}}</el-button>
                    <el-button type="primary"
                               @click="submitBind('editableContainer')"
                               :disabled="editableContainer.bindDevice === ''">
                        {{$t('sure')}}
                    </el-button>
                </span>
            </el-dialog>
            <el-dialog :title="inputLocal('prompt')"
                       @close="deleteVisible=false"
                       :visible.sync="deleteVisible"
                       width="30%">

                <span class="tips">{{$t('sure_remove')}}</span>
                <span slot="footer"
                      class="dialog-footer">
                    <el-button @click="deleteVisible = false">{{$t('cancel')}}</el-button>
                    <el-button type="primary"
                               @click="deleteVehicleDevice">{{$t('sure')}}</el-button>
                </span>
            </el-dialog>
        </template>
    </table-page>
</template>

<script>
    import {TABLE_INFO, VEHICLE_USE_TYPE} from "@/consts";
    import TablePage from "@/components/TablePage";
    import TableMixin from "@/mixins/table-component";
    import CustomizedMixin from "@/mixins/customized-component";

    export default {
        name: "Devices",
        components: {
            TablePage
        },
        mixins: [TableMixin, CustomizedMixin],
        data() {
            return {
                vehiclesType: VEHICLE_USE_TYPE,
                bindVisible: false,
                deleteVisible: false,
                dialogDeviceName: "",
                bindDevicePlaceholder: null,
                table: {
                    data: [],
                    page: 1,
                    pageSize: TABLE_INFO.DEFAULT_PAGE_SIZE,
                    total: 0,
                    filter: {
                        type: "plate_num",
                        value: ""
                    }
                }
            };
        },
        created() {
            this.importFontpack("Console");
            this.importFontpack("Console/Vehicle");
        },
        methods: {
            toHour: function (val) {
                return val
                    ? this.$moment.duration(val, "seconds").format("h") + "h"
                    : this.inputLocal("no_data");
            },
            toKM: function (val) {
                return val
                    ? (val / 1000).toFixed(2) + "km"
                    : this.inputLocal("no_data");
            },
            afterResponse() {
                let vm = this;
                vm.getVehicles().then(response => {
                    vm.hideLoadingInc();
                    let data = response.data.data;
                    let list = data.list.map(v => {
                        v.if_bind_show = v.if_bind
                            ? vm.inputLocal("isBind")
                            : vm.inputLocal("noBind");
                        v.useTypeShow = VEHICLE_USE_TYPE[v.useType];
                        v.purchaseDate = vm.$options.filters.formatDateTime(
                            v.purchaseDate
                        );
                        // v.modified_at = vm.$options.filters.formatDateTime(
                        //     v.modified_at
                        // );
                        // v.purchased_at = vm.$options.filters.formatDateTime(
                        //     v.purchased_at
                        // );
                        // v.driver_mobile = v.driver.mobile;
                        // v.driver_name = v.driver.name;
                        // v.device_sn = v.device.sn;
                        return v;
                    });
                    vm.$set(vm.table, "data", list);
                    vm.$set(vm.table, "total", data.total);
                });
            },

            deleteOpen(row) {
                let vm = this;
                vm.deleteVisible = true;
                let copy = JSON.parse(JSON.stringify(row));
                vm.$set(vm.$data, "editableContainer", copy);
            },
            handleDeviceInput(val) {
                let vm = this;
                vm.$set(vm.editableContainer, "$bindDevice", val);
            },
            //解绑设备
            deleteVehicleDevice() {
                let vm = this;

                vm.showLoadingInc();
                let successCallback = () => {
                    vm.$nextTick(() => {
                        vm.getTableData();
                        vm.hideLoadingInc();
                        vm.deleteVisible = false;
                    });
                };
                return vm.SaaSApi.deleteVehicleDevice(
                    vm.editableContainer.vehicleId,
                    vm.editableContainer.bindDevice
                ).then(successCallback);
            },
            //绑定、更换设备
            changeOpen(row) {
                let vm = this;
                vm.bindVisible = true;
                let copy = JSON.parse(JSON.stringify(row));
                vm.$set(vm.$data, "editableContainer", copy);
                if (vm.editableContainer.bindDevice == null) {
                    vm.bindDevicePlaceholder = "";
                    vm.dialogDeviceName = vm.inputLocal("binding_devices");
                } else {
                    vm.bindDevicePlaceholder = vm.editableContainer.bindDevice;
                    vm.editableContainer.bindDevice = "";
                    vm.dialogDeviceName = vm.inputLocal("replace_devices");
                }
            },
            submitBind(formName) {
                let vm = this;
                vm.$refs[formName].validate(valid => {
                    if (valid) {
                        vm.bindSave();
                    } else {
                        return false;
                    }
                });
            },
            //保存设备
            bindSave() {
                let vm = this;
                vm.showLoadingInc();
                let successCallback = res => {
                    // console.log(res);
                    vm.$nextTick(() => {
                        vm.getTableData();
                        vm.hideLoadingInc();
                        vm.$notify({
                            title: vm.inputLocal("success"),
                            message: vm.inputLocal("successful"),
                            type: "success"
                        });
                        vm.bindVisible = false;
                    });
                };

                let origin = vm.table.data
                    .filter(function (v) {
                        return v.vehicleId == vm.editableContainer.vehicleId;
                    })
                    .shift();

                if (origin) {
                    if (origin.bindDevice) {
                        return vm.SaaSApi.changeVehicleDevice(
                            vm.editableContainer.vehicleId,
                            origin.bindDevice,
                            origin.bindDevice === vm.editableContainer.bindDevice
                                ? vm.editableContainer.$bindDevice
                                : vm.editableContainer.bindDevice
                        ).then(successCallback);
                    } else {
                        return vm.SaaSApi.bindNewVehicleDevice(
                            vm.editableContainer.vehicleId,
                            vm.editableContainer.bindDevice
                        ).then(successCallback);
                    }
                }
            },
            saveInfo(successCallback) {
                let vm = this;
                if (vm.editableContainer.vehicleId) {
                    return vm.SaaSApi.editVehicle(vm.editableContainer.vehicleId, {
                        plate_num: vm.editableContainer.plateNum,
                        vin: vm.editableContainer.vin,
                        engine_num: vm.editableContainer.engineNum,
                        use_type: vm.editableContainer.useType,
                        brand_name: vm.editableContainer.brandName,
                        purchased_at: vm.editableContainer.purchaseDate,
                        driver_name: vm.editableContainer.driver,
                        driver_mobile: vm.editableContainer.mobile.replace(
                            /(^\s*)|(\s*$)/g,
                            ""
                        ), //前后空格
                        model_id: vm.editableContainer.modelId
                        // ...vm.editableContainer
                    }).then(successCallback);
                } else {
                    return vm.SaaSApi.createVehicle(
                        this.currentCompany.id,
                        vm.editableContainer.plateNum,
                        {
                            vin: vm.editableContainer.vin,
                            engine_num: vm.editableContainer.engineNum,
                            use_type: vm.editableContainer.useType,
                            brand_name: vm.editableContainer.brandName,
                            purchased_at: vm.editableContainer.purchaseDate,
                            driver_name: vm.editableContainer.driver,
                            driver_mobile: vm.editableContainer.mobile.replace(
                                /(^\s*)|(\s*$)/g,
                                ""
                            ), //前后空格
                            model_id: vm.editableContainer.modelId
                        }
                    ).then(successCallback);
                }
            },
            getVehicles() {
                let vm = this;
                let plate_num, device_sn;
                switch (vm.table.filter.type) {
                    case "plate_num":
                        plate_num = vm.table.filter.value;
                        break;
                    case "device_sn":
                        device_sn = vm.table.filter.value;
                        break;
                }
                return vm.SaaSApi.getVehicles(
                    vm.currentCompany.id,
                    plate_num,
                    device_sn,
                    ["devices", "driver"],
                    vm.table.page,
                    vm.table.pageSize
                );
            }
        }
    };
</script>

<style scoped lang="scss">
    .tips {
        position: relative;
        left: -10px;
        top: -10px;
        margin-left: 10px;
    }

    .input-with-select {
        width: 50%;
    }
</style>
