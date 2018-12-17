<template>
    <el-dialog
        :title="inputLocal('title')"
        :visible="isVisible"
        @close="changeVisibleState(false)"
        custom-class="dialog-company-selector">
        <el-row :gutter="20">
            <el-col>
                <el-button plain
                           :type="loginInfo.company.id == currentCompany.id ? 'primary' : ''"
                           @click="handleChangeCompany(loginInfo.company)"
                >{{ loginInfo.company.name }}
                </el-button>
            </el-col>
        </el-row>
        <hr/>
        <el-row v-if="isCompaniesRequestError">
            <el-col>
                <p style="width: 100%;text-align: center;">{{$t("failure")}}</p>
                <el-button plain type="primary" size="small" @click="doGetCompanies">{{$t("retry")}}</el-button>
            </el-col>
        </el-row>
        <el-row :gutter="20" v-for="(group,i) in groupedCompanies" :key="i" v-else>
            <el-col :span="24/companiesGroupLength" v-for="c in group" :key="c.id">
                <el-button plain :type="c.id == currentCompany.id ? 'primary' : ''" @click="handleChangeCompany(c)">{{
                    c.name }}
                </el-button>
            </el-col>
        </el-row>

    </el-dialog>
</template>

<script>

    import * as types from '../store/types';
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';

    export default {
        name: "company-selector",
        data() {
            return {
                companiesGroupLength: 4,
                isCompaniesRequestError: true
            }
        },
        computed: {
            ...mapState({
                loginInfo: state => state.loginInfo,
                isVisible: state => state.isCompanySelectorVisible,
                companies: state => state.companies,
            }),
            groupedCompanies() {
                return this.companies.chunk(this.companiesGroupLength);
            },
        },
        created() {
            this.importFontpack('Global')
        },
        mounted() {
            this.doGetCompanies();
        },
        methods: {
            ...mapMutations({
                changeVisibleState: types.global.mutations.CHANGE_COMPANY_SELECTOR_STATE,
                setCurrentCompany: types.global.mutations.SET_CURRENT_COMPANY,
                setCompanies: types.global.mutations.SET_COMPANIES
            }),
            doGetCompanies() {
                let vm = this;
                return vm.getCompanies().then(response => {
                    vm.isCompaniesRequestError = false;
                    vm.setCompanies(response.list);
                }).catch(error => {
                    vm.isCompaniesRequestError = true;
                });
            },
            handleChangeCompany(company) {
                let vm = this;
                vm.setCurrentCompany({
                    id: company.id,
                    name: company.name,
                    level: company.level
                });
                vm.changeVisibleState(false);
                vm.$nextTick(() => {
                    // vm.$router.push('/');
                    window.location.href = '/';
                });
            },
            getCompanies() {
                return this.SaaSApi.getCompanies(this.loginInfo.company.id, {
                    disabledGlobalErrorHandler: true
                }).then(response => {
                    let data = response.data.data;
                    return data;
                }).catch(error => {
                    if (error.response) {
                        if (error.response.status != 404) {
                            let msg = error.response.data.msg;
                            Vue.prototype.$message({
                                showClose: true,
                                message: msg,
                                type: 'error'
                            });
                        }
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .el-row {
        padding: 10px 0;
        .el-col {
            text-align: center;
        }
    }

</style>
