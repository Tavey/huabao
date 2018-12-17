<template>
    <table-page :table-info.sync="table" :noFilterButton="true">
        <template slot="table-columns">
            <el-table-column label="ID" prop="id"></el-table-column>
            <el-table-column :label="inputLocal('plateNum')" prop="plate_num"></el-table-column>
            <el-table-column :label="inputLocal('devicesn')" prop="device_id"></el-table-column>
            <el-table-column :label="inputLocal('gpsStatus')" prop="gps_success" :formatter="formatStatus"></el-table-column>
            <el-table-column :label="inputLocal('powerStatus')" prop="power_success" :formatter="formatStatus"></el-table-column>
            <el-table-column :label="inputLocal('heartBeatStatus')" prop="heart_beat_success" :formatter="formatStatus"></el-table-column>
            <el-table-column :label="inputLocal('isConfirm')" prop="confirm_submission" :formatter="formatConfirm"></el-table-column>
            <el-table-column :label="inputLocal('isReview')" prop="review_pass" :formatter="formatReview"></el-table-column>
            <el-table-column :label="inputLocal('operation')" width="200">
                <template slot-scope="scope">
                    <el-button size="mini"  plain type="primary"
                               v-if="scope.row.review_pass === 3"
                               @click="handleEditorOpen(scope.row,'editableContainer', preloadData)">
                        {{$t('approval')}}
                    </el-button>
                    <el-button size="mini" plain type="primary"
                               v-if="scope.row.review_pass === 3 && !isActionBanned(RoleActions.UpdateSetupApproval)"
                               @click="rejectWorkOrder(scope.row)">
                        {{$t('reject')}}
                    </el-button>
                </template>
            </el-table-column>
        </template>
        <template slot="dialog-container">
            <el-dialog :visible.sync="editorVisible" @close="handleDialogClose">
                <div v-if="confirmVisible">
                    <el-form label-position="left" label-width="95px" :model="editableContainer" ref="editableContainer">
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('plate_num')" prop="plate_num" :rules="filterRules({required:true,type:'plateNum'})">
                                    <el-input v-model="editableContainer.plate_num" :placeholder="inputLocal('input_plate_num')"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('vin')" prop="vin" :rules="filterRules({required:true})">
                                    <el-input v-model="editableContainer.vin" :maxlength="17" :placeholder="inputLocal('input_vin')"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('engine_num')" prop="engine_num" :rules="filterRules({required:true})">
                                    <el-input v-model="editableContainer.engine_num" :placeholder="inputLocal('input_engine_num')"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('use_type')" prop="use_type" :rules="filterRules({change:true})">
                                    <el-select v-model="editableContainer.use_type" :placeholder="inputLocal('choose')" style="width: 100%;" prop="use_type_show">
                                        <el-option v-for="(n,i) in vehiclesType" :key="i" :label="n" :value="i">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('brand_name')" prop="brand_name" :rules="filterRules({required:true})">
                                    <el-input v-model="editableContainer.brand_name" :placeholder="inputLocal('input_brand')"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('specific')" prop="model_id" :rules="filterRules({required:true})">
                                    <el-input v-model="editableContainer.model_id" :placeholder="inputLocal('input_specific')"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('purchased_at')" prop="purchased_at" :rules="filterRules({required:true})">
                                    <el-date-picker style="width: 100%;" v-model="editableContainer.purchased_at" type="date" :placeholder="inputLocal('choose_date')" align="right" value-format="yyyy-MM-dd">
                                    </el-date-picker>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('driver')" prop="driver_name" :rules="filterRules({required:true})">
                                    <el-input v-model="editableContainer.driver_name" :placeholder="inputLocal('input_driver')"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('contact')" prop="driver_mobile" :rules="filterRules({required:true,maxLength:36})">
                                    <el-input v-model="editableContainer.driver_mobile" :placeholder="inputLocal('input_contact')"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('company_id')" prop="company_id" class="ridLine" :rules="filterRules({change:true})">
                                    <el-select v-model="editableContainer.company_id" :placeholder="inputLocal('selectCompany')" style="width: 100%;" prop="company_id" disabled>
                                        <el-option :value="currentCompany.id" :label="currentCompany.name"></el-option>
                                        <el-option v-for="(company, i) in companies" :key="i" :label="company.name" :value="company.id">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </div>
                <div class="confirm-window" v-else>
                    <el-row>
                        <el-col :span="12">

                            <dl>
                                <dd>车牌号:</dd>
                                <dt>{{editableContainer.plate_num}}</dt>
                            </dl>
                        </el-col>
                        <el-col :span="12">

                            <dl>
                                <dd>设备号:</dd>
                                <dt>{{editableContainer.device_id}}</dt>
                            </dl>
                        </el-col>
                    </el-row>
                    <dl>
                        <el-row>
                            <el-col :span="12">
                                <dl>
                                    <dd>
                                        安装照片:
                                    </dd>
                                </dl>
                            </el-col>
                        </el-row>
                        <el-row>
                            <dl>
                                <dd>
                                    <img :src="url" width="300" height="300" style="margin-right: 30px" alt="" v-for="(url, index) in editableContainer.device_images" :key="index">
                                </dd>
                            </dl>
                        </el-row>
                    </dl>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="handleDialogClose">{{$t('close')}} </el-button>
                    <el-button type="primary" v-if="!isActionBanned(RoleActions.UpdateSetupApproval)" @click="handleDialogSubmit">{{$t('submit')}}</el-button>
                </span>
            </el-dialog>
        </template>
    </table-page>
</template>
<script>
import { TABLE_INFO, VEHICLE_USE_TYPE } from "@/consts";
import TablePage from "@/components/TablePage";
import TableMixin from "@/mixins/table-component";

export default {
    name: "Approval",
    mixins: [TableMixin],
    components: {
        TablePage
    },
    created() {
        this.init();
    },
    data() {
        return {
            editorVisible: false,
            vehiclesType: VEHICLE_USE_TYPE,
            confirmVisible: false,
            companies: [],
            editableContainer: {},
            table: {
                data: [],
                page: 1,
                pageSize: 30 | TABLE_INFO.DEFAULT_PAGE_SIZE,
                total: 0,
                filter: {
                    type: "plate_num",
                    value: ""
                }
            }
        };
    },
    filters: {},
    methods: {
        init() {
            this.importFontpack("Console/Vehicle");
            this.importFontpack("Console/User");
            this.importFontpack("Console/Approval");
            this.getApprovalList();
        },
        getApprovalList() {
            this.SaaSApi.getApprovalList(this.currentCompany.id)
                .then(res => {
                    if (res.data.status) {
                        this.table.data = res.data.data.list;
                    }
                })
                .catch(err => console.log(err));
        },
        preloadData(row) {
            let vm = this;
            vm.getCompanies(vm.currentCompany.id).then(res => {
                vm.hideLoadingInc();
                if (res.data.status) {
                    vm.companies = res.data.data.list;
                }
            });

            // 预填数据
            vm.editableContainer = row;
            vm.editableContainer.company_id = vm.currentCompany.id;
        },
        handleDialogClose() {
            this.editorVisible = false;
            if (this.confirmVisible) {
                this.confirmVisible = false;
            }
        },
        handleDialogSubmit() {
            if (this.confirmVisible) {
                this.submitForm("editableContainer");
            } else {
                this.confirmVisible = true;
            }
        },
        getCompanies(id) {
            return this.SaaSApi.getCompanies(id);
        },
        rejectWorkOrder(row) {
            this.SaaSApi.approvalWorkOrder(row.id, 2)
                .then(res => {
                    if (res.data === "success") {
                        this.$notify({
                            title: "成功",
                            message: "操作成功！",
                            type: "success"
                        });
                        // row.review_passs = 1;
                    } else {
                        let vm = this;
                        this.$notify({
                            title: vm.inputLocal("error"),
                            type: "error"
                        });
                    }
                    this.getApprovalList();
                })
                .catch(err => {
                    console.log(err);
                });
        },
        // 审核通过
        saveInfo() {
            let { id, ...rest } = this.editableContainer;
            this.SaaSApi.approvalWorkOrder(id, 1, rest).then(res => {
                if (res.data === "success") {
                    this.$notify({
                        title: "成功",
                        message: "操作成功！",
                        type: "success"
                    });
                    this.getApprovalList();
                }
            });
            // .catch(err => {
            //     this.$notify({
            //         title: this.inputLocal("error"),
            //         type: "error"
            //     });
            // });
            this.hideLoadingInc();
            this.editableContainer = {};
            this.editorVisible = false;
        },
        formatReview(row, column, val) {
            switch (val) {
                case 1:
                    return "通过";
                case 2:
                    return "拒绝";
                case 3:
                    return "未审核";
                default:
                    return "未审核";
            }
        },
        formatConfirm(row, column, val) {
            switch (val) {
                case 1:
                    return "已确认";
                case 2:
                    return "未确认";
            }
        },
        formatStatus(row, column, val) {
            switch (val) {
                case 1:
                    return "正常";
                case 2:
                    return "检测中";
            }
        }
    }
};
</script>
<style scoped>
.confirm-window dd,
dt {
    display: inline-block;
}
</style>

