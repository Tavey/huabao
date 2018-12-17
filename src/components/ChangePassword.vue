<template>
    <el-dialog
        title="修改密码"
        :visible="isVisible"
        @close="closeVisible"
        width="30%">
        <el-form label-width="80px"
                 :model="editableContainer"
                 ref="editableContainer">
            <el-form-item label="用户名">
                {{ loginInfo.user.name }}
            </el-form-item>
            <el-form-item label="原密码" prop="old_password"
                          :rules="filterRules({required:true,type:'space',minLength:6,maxLength:20})">
                <el-input v-model="editableContainer.old_password" type="password" placeholder="请输入原密码"></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="password"
                          :rules="filterRules({required:true,type:'space',minLength:6,maxLength:20})">
                <el-input v-model="editableContainer.password" type="password" placeholder="请输入新密码"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="closeVisible">{{$t("cancel")}}</el-button>
            <el-button type="primary" @click="submitForm('editableContainer')">{{$t("confirm")}}</el-button>
        </span>
    </el-dialog>

</template>

<script>
    import * as types from '../store/types';
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';

    export default {
        name: 'change-password',
        components: {},
        data() {
            return {
                editableContainer: {}
            }

        },
        computed: {
            ...mapState({
                loginInfo: state => state.loginInfo,
                isVisible: state => state.isChangePasswordVisible,
            }),
            ...mapGetters({
                currentCompany: types.global.getters.CURRENT_COMPANY
            }),
        },
        mounted() {

        },
        methods: {
            ...mapMutations({
                changeVisibleState: types.global.mutations.CHANGE_PASSWORD_STATE,
            }),
            closeVisible() {
                this.editableContainer.old_password = '';
                this.editableContainer.password = '';
                this.$refs.editableContainer.resetFields();
                this.changeVisibleState(false);
            },
            handleEditorSaves(callback) {
                let vm = this;
                vm.showLoadingInc();
                let successCallback = () => {
                    vm.hideLoadingInc();
                    vm.$nextTick(() => {
                        this.$notify({
                            title: '成功',
                            message: '操作成功！',
                            type: 'success'
                        });
                        vm.changeVisibleState(false);
                    });
                };
                callback(successCallback)
            },
            submitForm(formName) {
                let vm = this;
                vm.$refs[formName].validate((valid) => {
                    if (valid) {
                        vm.handleEditorSaves(vm.saveInfo)
                    } else {
                        // console.log('error submit!!');
                        return false;
                    }
                });
            },
            saveInfo(successCallback) {
                let vm = this;
                return vm.SaaSApi.editOwnPassword(
                    vm.editableContainer.old_password,
                    vm.editableContainer.password
                ).then(successCallback);
            }
        },

    }
</script>

<style scoped lang="scss">


</style>
