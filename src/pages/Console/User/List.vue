<template>
    <table-page no-filter-button
                :table-info.sync="table"
                @table-resource="getTableData">
        <template slot="form-filter-append">
            <el-form-item style="float: right">
                <el-button icon="fas fa-plus fa-fw"
                           v-if="!isActionBanned(RoleActions.CreateAccount)"
                           :disabled="isActionBanned(RoleActions.CreateAccount)"
                           @click="handleEditorOpen({},'editableContainer',pretreatment)">{{$t('addUse')}}
                </el-button>
            </el-form-item>
        </template>
        <template slot="table-columns">
            <el-table-column :label="inputLocal('user_name')"
                             prop="name">
            </el-table-column>
            <el-table-column :label="inputLocal('mobile')"
                             prop="mobile">
            </el-table-column>
            <el-table-column :label="inputLocal('role')">
                <template slot-scope="scope">
                    {{ scope.row.role ? scope.row.role.name : inputLocal('null') }}
                </template>
            </el-table-column>
            <el-table-column :label="inputLocal('latest_login_at')">
                <template slot-scope="scope">
                    <span v-if="scope.row.latest_login_at">{{ scope.row.latest_login_at | formatDateTime }}</span>
                    <span v-else>{{$t('never_login')}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="inputLocal('created_at')">
                <template slot-scope="scope">
                    <span v-if="scope.row.created_at">{{ scope.row.created_at | formatDateTime }}</span>
                    <span v-else> {{$t('non_platform')}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="inputLocal('operation')"
                             width="300">
                <template slot-scope="scope">
                    <el-button type="primary"
                               size="mini"
                               plain
                               icon="fas fa-edit fa-fw"
                               v-if="!isActionBanned(RoleActions.UpdateAccount)"
                               :disabled="isActionBanned(RoleActions.UpdateAccount) ||
                                    scope.row.id == loginInfo.user.id"
                               @click="handleEditorOpen(scope.row,'editableContainer',pretreatment)">
                        {{$t('editor')}}
                    </el-button>
                    <el-button type="primary"
                               size="mini"
                               plain
                               icon="fas fa-file-edit fa-fw"
                               v-if="!isActionBanned(RoleActions.UpdateAccount)"
                               :disabled="isActionBanned(RoleActions.UpdateAccount)"
                               @click="changePassword(scope.row)">
                        {{$t('change_password')}}
                    </el-button>
                </template>

            </el-table-column>
        </template>

        <template slot="dialog-container">
            <el-dialog :visible.sync="editorVisible"
                       @close="editorVisible=false,password=false"
                       width="45%">
                <slot name="title">
                    <span class="title">{{dialogName}}</span>
                </slot>
                <el-form label-position="left"
                         :model="editableContainer"
                         label-width="80px"
                         ref="editableContainer">
                    <el-row v-if="!password"
                            :gutter="20">
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item v-if="!editableContainer.id"
                                              :label="inputLocal('company_id')"
                                              prop="company_id"
                                              class="ridLine"
                                              :rules="filterRules({change:true})">
                                    <el-select v-model="editableContainer.company_id"
                                               :placeholder="inputLocal('choose_company')"
                                               style="width: 100%;"
                                               prop="company_id">
                                        <el-option :label="inputLocal('current')"
                                                   :value="currentCompany.id"></el-option>
                                        <el-option v-for="company in companies"
                                                   :key="company.id"
                                                   :label="company.name"
                                                   :value="company.id">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item :label="inputLocal('mobile')"
                                              prop="mobile"
                                              :rules="filterRules({required:true,maxLength:36})">
                                    <el-input v-model="editableContainer.mobile"
                                              :placeholder="inputLocal('input_mobile')"></el-input>
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item :label="inputLocal('user_name')"
                                              prop="name"
                                              :rules="filterRules({required:true,type:'space',minLength:4,maxLength:36})">
                                    <el-input v-model="editableContainer.name"
                                              :placeholder="inputLocal('input_name')"></el-input>
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item :label="inputLocal('role')"
                                              prop="role_id">
                                    <el-select v-model="editableContainer.role_id"
                                               :placeholder="inputLocal('choose_role')"
                                               :disabled="allRoles.length <= 0">
                                        <el-option v-for="(role,i) in allRoles"
                                                   :key="i"
                                                   :label="role.name"
                                                   :value="role.id">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>

                            <el-col v-if="!editableContainer.id"
                                    :span="12">
                                <el-form-item :label="inputLocal('password')"
                                              prop="password"
                                              :rules="filterRules({required:true,type:'space',minLength:6,maxLength:20})">
                                    <el-input type="password"
                                              auto-complete="off"
                                              v-model="editableContainer.password"
                                              :placeholder="inputLocal('input_password')"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-row>
                    <el-row v-else
                            :gutter="20">
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('user_name')"
                                              class="not-red">
                                    {{ editableContainer.name}}
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item :label="inputLocal('password')"
                                              prop="password"
                                              :rules="filterRules({required:true,type:'space',minLength:6,maxLength:20})">
                                    <el-input type="password"
                                              auto-complete="off"
                                              v-model="editableContainer.password"
                                              :placeholder="inputLocal('input_password')"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-row>
                </el-form>
                <span slot="footer"
                      class="dialog-footer">
                    <el-button @click="editorVisible = false,password=false">{{$t('cancel')}}</el-button>
                    <el-button type="primary"
                               @click="submitForm('editableContainer')">{{$t('save')}}</el-button>
                </span>
            </el-dialog>
        </template>
    </table-page>
</template>

<script>
import { TABLE_INFO } from "@/consts";
import { mapState } from "vuex";
import TablePage from "@/components/TablePage";
import TableMixin from "@/mixins/table-component";

export default {
    components: {
        TablePage
    },
    mixins: [TableMixin],
    data() {
        return {
            allRoles: [],
            companies: [],
            table: {
                data: [],
                page: 0,
                pageSize: TABLE_INFO.DEFAULT_PAGE_SIZE,
                total: 0,
                filter: {
                    device_sn: ""
                }
            },
            password: false
        };
    },
    created() {
        this.importFontpack("Console");
        this.importFontpack("Console/User");
    },
    computed: {
        ...mapState({
            loginInfo: state => state.loginInfo
        })
    },
    watch: {
        "editableContainer.company_id"(val) {
            let vm = this;
            vm.allRoles = [];
            if (val) {
                vm.SaaSApi.getAllRoles(val).then(response => {
                    vm.allRoles = response.data.data;
                });
            }
        }
    },
    mounted() {},
    methods: {
        afterResponse() {
            let vm = this;
            vm.getUsers().then(response => {
                vm.hideLoadingInc();
                let data = response.data.data;
                vm.$set(vm.table, "data", data.list);
                vm.$set(vm.table, "total", data.total);
            });
        },
        getUsers() {
            return this.SaaSApi.getUsers(
                this.currentCompany.id,
                this.table.page,
                this.table.pageSize
            );
        },
        changePassword(row) {
            row.role = row.role || {};
            this.handleEditorOpen(row, "editableContainer");
            this.password = true;
        },
        getCompanies() {
            return this.SaaSApi.getCompanies(this.currentCompany.id);
        },
        pretreatment(row) {
            let vm = this;
            vm.getCompanies().then(response => {
                vm.hideLoadingInc();
                let data = response.data.data;
                vm.companies = data.list;
            });

            let copy = JSON.parse(JSON.stringify(row));
            copy.role = copy.role || {};
            vm.$set(vm.$data, "editableContainer", copy);
        },
        saveInfo(successCallback) {
            let vm = this;
            if (vm.editableContainer.password && vm.editableContainer.id) {
                return vm.SaaSApi.editUser(vm.editableContainer.id, {
                    password: vm.editableContainer.password
                }).then(successCallback);
            } else if (vm.editableContainer.id) {
                return vm.SaaSApi.editUser(vm.editableContainer.id, {
                    name: vm.editableContainer.name,
                    mobile: vm.editableContainer.mobile,
                    role_id: vm.editableContainer.role_id
                }).then(successCallback);
            } else {
                return vm.SaaSApi.createUser(vm.currentCompany.id, {
                    company_id: vm.editableContainer.company_id,
                    created_by: vm.loginInfo.user.id,
                    name: vm.editableContainer.name,
                    password: vm.editableContainer.password,
                    mobile: vm.editableContainer.mobile,
                    role_id: vm.editableContainer.role_id
                }).then(successCallback);
            }
        }
    }
};
</script>

<style scoped lang="scss">
.gray {
    color: #999;
}

.not-red {
    padding-left: 10px;
}

.title {
    position: relative;
    top: -30px;
    font-size: 16px;
}

.ridLine {
    overflow: hidden;
    height: 40px;
}
</style>
