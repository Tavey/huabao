<template>
    <table-page no-filter-button
                no-pagination
                :table-info.sync="table"
                @table-resource="getTableData">
        <template slot="form-filter-append">
            <el-form-item style="float: right">
                <el-button icon="fas fa-plus fa-fw"
                           v-if="!isCompanyLevelLowest && !isActionBanned(RoleActions.CreateCompany)"
                           :disabled="isActionBanned(RoleActions.CreateCompany)"
                           @click="handleEditorOpen({},'editableContainer')">{{$t('add_company')}}
                </el-button>
            </el-form-item>
        </template>
        <template slot="table-columns">
            <el-table-column :label="inputLocal('serial')"
                             prop="id">
            </el-table-column>
            <el-table-column :label="inputLocal('name')"
                             prop="name">
            </el-table-column>
            <el-table-column :label="inputLocal('type')"
                             prop="type">
            </el-table-column>
            <el-table-column :label="inputLocal('address')"
                             prop="address">
            </el-table-column>
            <el-table-column :label="inputLocal('contact')"
                             prop="contact">
            </el-table-column>
            <el-table-column :prop="inputLocal('created_at')">
            </el-table-column>
            <el-table-column :label="inputLocal('operation')"
                             width="200">
                <template slot-scope="scope">
                    <el-button type="primary"
                               size="mini"
                               plain
                               icon="fas fa-edit fa-fw"
                               v-if="!isActionBanned(RoleActions.UpdateCompany)"
                               :disabled="isActionBanned(RoleActions.UpdateCompany)"
                               @click="handleEditorOpen(scope.row,'editableContainer')">
                        {{$t('editor')}}
                    </el-button>
                </template>
            </el-table-column>
        </template>
        <template slot="dialog-container">
            <el-dialog :title="dialogName"
                       :visible="editorVisible"
                       @close="editorVisible=false"
                       width="45%">
                <el-form label-position="left"
                         label-width="80px"
                         :model="editableContainer"
                         ref="editableContainer">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('name')"
                                          prop="name"
                                          :rules="filterRules({required:true})">
                                <el-input v-model="editableContainer.name"
                                          :placeholder="inputLocal('input_name')"
                                          :maxlength="16"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('type')"
                                          prop="type"
                                          :rules="filterRules({change:true})">
                                <el-select v-model="editableContainer.type"
                                           :placeholder="inputLocal('choose')"
                                           style="width: 100%;">
                                    <el-option v-for="(n,i) in companyType"
                                               :key="i"
                                               :label="n"
                                               :value="companyType[n]">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('city')"
                                          prop="city"
                                          :rules="filterRules({required:true})">
                                <el-input v-model="editableContainer.city"
                                          :placeholder="inputLocal('input_city')"
                                          :maxlength="10"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="inputLocal('contact')"
                                          prop="contact"
                                          :rules="filterRules({required:true,type:'mobile',maxLength:20})">
                                <el-input v-model="editableContainer.contact"
                                          :placeholder="inputLocal('input_contact')"
                                          :maxlength="12"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="18">
                            <el-form-item :label="inputLocal('address')"
                                          prop="address"
                                          :rules="filterRules({required:true})">
                                <el-input v-model="editableContainer.address"
                                          :placeholder="inputLocal('input_address')"
                                          :maxlength="30"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <span slot="footer"
                      class="dialog-footer">
                    <el-button @click="editorVisible = false">{{$t('cancel')}}</el-button>
                    <el-button type="primary"
                               @click="submitForm('editableContainer')">{{$t('save')}}</el-button>
                </span>
            </el-dialog>
        </template>
    </table-page>
</template>

<script>
    import {mapState, mapMutations} from "vuex";
    import * as types from "@/store/types";
    import {COMPANY_TYPE, TABLE_INFO} from "@/consts";
    import TablePage from "@/components/TablePage";
    import TableMixin from "@/mixins/table-component";

    export default {
        name: "Company",
        components: {
            TablePage
        },
        mixins: [TableMixin],
        data() {
            return {
                companyType: COMPANY_TYPE,
                table: {
                    data: [],
                    page: 1,
                    pageSize: TABLE_INFO.DEFAULT_PAGE_SIZE,
                    total: 0,
                    filter: {
                        device_sn: ""
                    }
                }
            };
        },
        computed: {
            ...mapState({
                loginInfo: state => state.loginInfo
            })
        },
        created() {
            this.importFontpack("Console");
            this.importFontpack("Console/Company");
        },
        methods: {
            ...mapMutations({
                setAsideActiveIndex: types.global.mutations.SET_ASIDE_ACTIVE_INDEX,
                setCompanies: types.global.mutations.SET_COMPANIES
            }),
            afterResponse() {
                let vm = this;
                vm.getCompanies().then(response => {
                    vm.hideLoadingInc();
                    let data = response.data.data;
                    let list = data.list.map(v => {
                        v.created_at = vm.$options.filters.formatDateTime(
                            v.created_at
                        );
                        return v;
                    });
                    vm.$set(vm.table, "data", list);
                    vm.$set(vm.table, "total", data.total);
                    vm.$set(vm.table, "pageSize", data.total);
                    //创建更新后，更新公司选择器数据
                    if (vm.currentCompany.id == vm.loginInfo.company.id) {
                        vm.setCompanies(data.list);
                    }
                });
            },
            getCompanies() {
                return this.SaaSApi.getCompanies(this.currentCompany.id);
            },
            saveInfo(successCallback) {
                let vm = this;
                if (vm.editableContainer.id) {
                    return vm.SaaSApi.editCompany(vm.editableContainer.id, {
                        name: vm.editableContainer.name,
                        address: vm.editableContainer.address,
                        type: vm.editableContainer.type,
                        contact: vm.editableContainer.contact,
                        city: vm.editableContainer.city
                    }).then(successCallback);
                } else {
                    return vm.SaaSApi.createCompany(vm.currentCompany.id, {
                        created_by: vm.loginInfo.user.id,
                        name: vm.editableContainer.name,
                        address: vm.editableContainer.address,
                        type: vm.editableContainer.type,
                        contact: vm.editableContainer.contact,
                        city: vm.editableContainer.city
                    }).then(successCallback);
                }
            }
        }
    };
</script>

<style scoped lang="scss">
</style>
