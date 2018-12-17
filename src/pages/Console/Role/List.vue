<template>
    <table-page noFilterButton
                :table-info.sync="table"
                @table-resource="getTableData">
        <template slot="form-filter-append">
            <el-form-item style="float: right">
                <el-button icon="fas fa-plus fa-fw"
                           v-if="!isActionBanned(RoleActions.CreateRole)"
                           :disabled="isActionBanned(RoleActions.CreateRole)"
                           @click="handleEditorOpen({},'editableContainer',pretreatment)">
                    {{$t('add_role')}}
                </el-button>
            </el-form-item>
        </template>
        <template slot="table-columns">
            <el-table-column prop="name"
                             :label="inputLocal('role')">
            </el-table-column>
            <el-table-column :label="inputLocal('ban') ">
                <template slot-scope="scope">
                    <time>{{ scope.row.banned_actions.length == 0 ? inputLocal('access_control') : `${inputLocal('has')}${scope.row.banned_actions.length}${inputLocal('rules')}` }}
                    </time>
                </template>
            </el-table-column>
            <el-table-column :label="inputLocal('created_at')">
                <template slot-scope="scope">
                    <time>{{ scope.row.created_at | formatDateTime }}</time>
                </template>
            </el-table-column>
            <el-table-column :label="inputLocal('operation')">
                <template slot-scope="scope">
                    <el-button type="primary"
                               plain
                               size="mini"
                               icon="fas fa-edit fa-fw"
                               v-if="!isActionBanned(RoleActions.UpdateRole)"
                               :disabled="isActionBanned(RoleActions.UpdateRole)"
                               @click="handleEditorOpen(scope.row,'editableContainer',pretreatment)">
                        {{$t('editor')}}
                    </el-button>
                    <el-button type="primary"
                               plain
                               size="mini"
                               icon="fas fa-trash-alt fa-fw"
                               v-if="!isActionBanned(RoleActions.DeleteRole)"
                               :disabled="isActionBanned(RoleActions.DeleteRole)"
                               @click="deleteOpen(scope.row)">
                        {{$t('delete')}}
                    </el-button>
                </template>
            </el-table-column>
        </template>
        <template slot="dialog-container">
            <el-dialog class="dialogScroll"
                       :title="dialogName"
                       :visible="editorVisible"
                       @close="editorVisible=false"
                       @before-close="closeDialog"
                       width="45%">
                <el-form label-position="top"
                         size="small"
                         :model="editableContainer"
                         ref="editableContainer"
                         @submit.native.prevent>
                    <el-form-item :label="inputLocal('name')"
                                  prop="name"
                                  :rules="filterRules({required:true})">
                        <el-input v-model="editableContainer.name"
                                  :placeholder="inputLocal('input_name')"
                                  :maxlength="20">
                        </el-input>
                    </el-form-item>
                    <small style="color:red">* {{$t('check')}}</small>
                    <el-checkbox-group v-model="checked">
                        <el-form-item :label="group_name"
                                      v-for="(group,group_name) in actionList.tree"
                                      :key="group_name">
                            <el-row :gutter="20">
                                <el-col :span="6"
                                        v-for="(value,name) in group"
                                        :key="value">
                                    <el-checkbox :label="value">{{name}}</el-checkbox>
                                </el-col>
                            </el-row>
                        </el-form-item>
                    </el-checkbox-group>
                </el-form>
                <span slot="footer"
                      class="dialog-footer">
                    <el-button @click="editorVisible = false"> {{$t('cancel')}}</el-button>
                    <el-button type="primary"
                               @click="submitForm('editableContainer')">{{$t('save')}}</el-button>
                </span>
            </el-dialog>

            <el-dialog :title="inputLocal('prompt')"
                       @close="deleteVisible=false"
                       :visible.sync="deleteVisible"
                       width="30%">
                <p>{{$t('role')}}: {{ editableContainer.name }}</p>
                <p>{{$t('confirm_deletion')}}</p>
                <div slot="footer"
                     class="dialog-footer">
                    <el-button @click="deleteVisible = false">{{$t('cancel')}}</el-button>
                    <el-button type="primary"
                               @click="deleteRole">{{$t('sure')}}</el-button>
                </div>
            </el-dialog>
        </template>
    </table-page>
</template>

<script>
import { TABLE_INFO } from "@/consts";
import TablePage from "@/components/TablePage";
import HbPopover from "@/components/Popover";
import TableMixin from "@/mixins/table-component";
import CustomizedMixin from "@/mixins/customized-component";

export default {
    components: {
        TablePage,
        HbPopover
    },
    mixins: [TableMixin, CustomizedMixin],
    data() {
        return {
            actionList: {},
            checked: [],
            table: {
                data: [],
                page: 0,
                pageSize: TABLE_INFO.DEFAULT_PAGE_SIZE,
                total: 0,
                filter: {}
            },
            deleteVisible: false
        };
    },
    created() {
        this.importFontpack("Console");
        this.importFontpack("Console/Role");
    },
    mounted() {
        let vm = this;
        vm.getActionList().then(response => {
            vm.actionList = response.data.data;
            let exclude = vm.hasFeature("exclude");
            if (exclude && exclude.length > 0) {
                for (let group in vm.actionList.tree) {
                    let list = vm.actionList.tree[group];
                    for (let name in list) {
                        let key = list[name];
                        if (exclude.indexOf(key) >= 0) {
                            delete list[name];
                        }
                    }
                    if (list.length <= 0) {
                        delete vm.actionList.tree[group];
                    }
                }

                for (let i = 0; i < exclude.length; i++) {
                    if (vm.actionList.key_value[exclude[i]]) {
                        delete vm.actionList.key_value[exclude[i]];
                    }
                    let tmp = vm.actionList.keys.indexOf(exclude[i]);
                    if (tmp >= 0) {
                        vm.actionList.keys.splice(tmp, 1);
                    }
                }
            }
        });
    },
    methods: {
        // changePopover(row) {
        //     return `popover_${row.id}`;
        // },
        afterResponse() {
            let vm = this;
            vm.getRoleList().then(response => {
                vm.hideLoadingInc();
                let data = response.data.data;
                let list = data.list.map(v => {
                    return v;
                });
                vm.$set(vm.table, "data", list);
                vm.$set(vm.table, "total", data.total);
            });
        },
        getActionList() {
            return this.SaaSApi.getActions();
        },
        pretreatment(row) {
            let vm = this;
            let copy = JSON.parse(JSON.stringify(row));
            vm.$set(vm.$data, "editableContainer", copy);
            let banned = copy.banned_actions
                ? copy.banned_actions.pluck("action_name")
                : [];
            vm.checked = vm.actionList.keys.filter(a => banned.indexOf(a) < 0);
        },
        closeDialog() {
            this.editorVisible = false;
        },
        deleteOpen(row) {
            let vm = this;
            vm.deleteVisible = true;
            let copy = JSON.parse(JSON.stringify(row));
            vm.$set(vm.$data, "editableContainer", copy);
        },
        deleteRole() {
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
            return vm.SaaSApi.deleteRole(vm.editableContainer.id).then(
                successCallback
            );
        },
        getRoleList() {
            return this.SaaSApi.getRoles(
                this.currentCompany.id,
                this.table.page,
                this.table.pageSize
            );
        },
        saveInfo(successCallback) {
            let vm = this;
            if (vm.editableContainer.id) {
                return vm.SaaSApi.editRole(
                    vm.editableContainer.id,
                    vm.editableContainer.name,
                    vm.actionList.keys.filter(a => vm.checked.indexOf(a) < 0)
                ).then(successCallback);
            } else {
                return vm.SaaSApi.createRole(
                    this.currentCompany.id,
                    vm.editableContainer.name,
                    vm.actionList.keys.filter(a => vm.checked.indexOf(a) < 0)
                ).then(successCallback);
            }
        }
    }
};
</script>
