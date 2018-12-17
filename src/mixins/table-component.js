export default {
    data() {
        return {
            editableContainer: {},
            editorVisible: false
        };
    },
    computed: {
        dialogName() {
            let routes = this.$route.path;
            if (routes.indexOf("console") < 0) {
                return "";
            }
            switch (routes) {
                case "/console/vehicles":
                    return (
                        (this.editableContainer.id ? "编辑" : "添加") + "车辆"
                    );
                    break;
                case "/console/devices":
                    return (
                        (this.editableContainer.id ? "编辑" : "添加") + "设备"
                    );
                    break;
                case "/console/companies":
                    return (
                        (this.editableContainer.id ? "编辑" : "添加") + "公司"
                    );
                    break;
                case "/console/users":
                    if (this.password) {
                        return "修改密码";
                    } else {
                        return (
                            (this.editableContainer.id ? "编辑" : "添加") +
                            "账号"
                        );
                    }
                    break;
                case "/console/role":
                    return (
                        (this.editableContainer.id ? "编辑" : "添加") + "角色"
                    );
                    break;
                default:
                    break;
            }
            return "";
        }
    },
    methods: {
        getTableData(initPage) {
            let vm = this;
            if (initPage) {
                vm.$set(vm.table, "page", 1);
            }
            vm.showLoadingInc();
            vm.$nextTick(() => {
                vm.afterResponse();
            });
        },
        //打开编辑  保存
        handleEditorOpen(row, formName, pretreatment, isReset) {
            let vm = this;
            if (vm.$refs[formName] && isReset) {
                vm.$refs[formName].resetFields();
            }
            if (pretreatment) {
                pretreatment(row);
            } else {
                let copy = JSON.parse(JSON.stringify(row));
                vm.$set(vm.$data, "editableContainer", copy);
            }

            vm.$nextTick(() => {
                vm.editorVisible = true;
            });
        },
        //提交
        submitForm(formName) {
            let vm = this;
            vm.$refs[formName].validate(valid => {
                if (valid) {
                    vm.handleEditorSave(vm.saveInfo);
                } else {
                    return false;
                }
            });
        },
        //保存
        handleEditorSave(callback) {
            let vm = this;
            vm.showLoadingInc();
            let successCallback = res => {
                console.log(res);
                vm.$nextTick(() => {
                    vm.getTableData();
                    vm.hideLoadingInc();
                    vm.$notify({
                        title: "成功",
                        message: "操作成功！",
                        type: "success"
                    });
                    // vm.successOpen()
                    vm.editorVisible = false;
                });
            };
            callback(successCallback);
        }
    }
};
