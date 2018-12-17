<template>
    <el-row class="login-page">
        <el-col :span="16" class="left" :style="{
                    backgroundImage: `url(${require(`@/assets/${Theme}/background.png`)})`
                }">
            <el-row style="display:flex;height: 100%;">
                <vue-particles color="#dedede" :particleOpacity="0.7" :particlesNumber="80" shapeType="circle" :particleSize="4" linesColor="#dedede" :linesWidth="1" :lineLinked="true" :lineOpacity="0.4" :linesDistance="150" :moveSpeed="3">
                </vue-particles>
                <el-col>
                    <img class="login-front-img" :src="require(`@/assets/${Theme}/text.svg`)" />
                </el-col>
            </el-row>
            <el-row class="copyright">
                <el-col :span="16">
                    <span class="copyrightText">Copyright © {{ copyright.year }} {{companyName}} | 浙ICP备17010660号-3</span>
                </el-col>
                <el-col :span="8" style="text-align: right">
                    <span class="policy" @click="dialogVisible=true">{{$t("policy")}}</span>
                    <!--|<span class="terms">{{$t("terms")}}</span>-->
                </el-col>
            </el-row>
        </el-col>
        <el-col :span="8" class="right">
            <div class="login-wrap">
                <el-row style="margin-bottom: 30px;">
                    <el-col class="logo-container">
                        <img :src="require(`@/assets/${Theme}/login-logo.png`)" />
                    </el-col>
                </el-row>
                <el-row>
                    <el-col class="slogan">
                        <transition name="el-fade-in-linear">
                            <div v-show="slogan.show">{{slogan.sets[slogan.index]}}</div>
                        </transition>
                    </el-col>
                </el-row>
                <el-row class="login-form">
                    <el-col>
                        <el-form :model="loginForm" status-icon ref="loginForm" @submit.native.prevent="handleFormSubmit">
                            <el-form-item prop="name" :rules="filterRules({required:true,type:'space',maxLength:36})" class="name-input">
                                <el-input v-model="loginForm.name" :placeholder="inputLocal('inputname')"></el-input>
                            </el-form-item>
                            <el-form-item prop="password" :rules="filterRules({required:true,type:'space',maxLength:36})">
                                <el-input type="password" v-model="loginForm.password" auto-complete="off" :placeholder="inputLocal('inputpassword')">
                                </el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-checkbox v-model="hasSave">{{$t("rember")}}</el-checkbox>
                                <el-checkbox>{{$t("autologin")}}</el-checkbox>
                            </el-form-item>
                            <el-form-item>
                                <el-button class="block" type="primary" native-type="submit">{{$t("login")}}</el-button>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </div>
        </el-col>
        <el-dialog :visible.sync="dialogVisible" width="768px" @close="editorVisible=false">
            <div class="title">{{$t('policy')}}</div>
            <el-row v-tableLoadMore="{
                fn:tableLoadMore,
                class:'textWrap'
            }">
                <div class="textWrap" ref='privacyScroll'>
                    <el-row :gutter="20">
                        <el-col :span="24">
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="22" :offset="1">
                            <div class="statement">{{ privacy.statement}}</div>
                        </el-col>
                    </el-row>
                    <el-row :gutter="5" v-for="(chapter,index) in privacy.chapter" :key="index">
                        <el-col :span="22" :offset="1">
                            <div class="chapter">
                                <p class="titles">{{chapter.title}}</p>
                                <p class="subtitle" v-if="chapter.subtitle">{{chapter.subtitle}}</p>
                                <p class="article" v-for="(article,keys) in chapter.article" :key="keys">{{article}}</p>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-row :gutter="25" v-if="sureBtn">
                    <el-col :span="23">
                        <el-button @click="dialogVisible = false">{{$t('disagree')}}</el-button>
                        <el-button type="primary" @click="agreePrivacy" :disabled="disabled">{{$t('agree')}}</el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>
    </el-row>
</template>

<script>
import * as types from "../store/types";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import { PRIVACY, SLOGAN } from "@/consts";
import VueParticles from "vue-particles/src/vue-particles/vue-particles";

export default {
    components: { VueParticles },
    data() {
        return {
            slogan: {
                show: true,
                sets: [],
                index: 0
            },
            copyright: {
                year: this.$moment().year()
            },
            hasSave: false,
            privacy: PRIVACY,
            disabled: true,
            dialogVisible: false,
            sureBtn: false,
            scroll: "",
            loginForm: {
                name: "",
                password: ""
            },
            loginInfo: null
            // formRule: {
            //     name: [
            //         {required: true, message: ' ', trigger: 'blur'},
            //         filterRules({required:true,type:'plateNum'})
            //     ],
            //     password: [
            //         {required: true, message: ' ', trigger: 'blur'},
            //     ],
            // }
        };
    },
    created() {
        this.importFontpack("Public/Login");
        this.slogan.sets = SLOGAN[this.Theme]
            ? SLOGAN[this.Theme]
            : SLOGAN["default"];
    },
    mounted() {
        this.setUserName();
        this.changeSlogan();
    },
    computed: {
        companyName() {
            switch (this.Theme) {
                // case "127":
                    case "zgc":
                    return "由宁波华保科技有限公司提供技术支持";
                default:
                    return this.inputLocal("huabao");
            }
        }
    },
    methods: {
        ...mapMutations({
            setLoginInfo: types.global.mutations.SET_LOGIN_INFO,
            hasLoggedOn: types.global.mutations.HAS_LOGGED_ON,
            setModules: types.global.mutations.SET_MODULES
        }),
        ...mapActions({
            setLan: types.global.actions.SET_LANGUAGE,
            setTimeZone: types.global.actions.SET_TIMEZONE
        }),
        inputLocal(val) {
            return this.$t(val);
        },
        changeSlogan() {
            let vm = this;
            if (vm.slogan.sets.length > 1) {
                vm.slogan.changeHandler = setInterval(function() {
                    vm.slogan.show = false;
                    vm.slogan.showHandler = setTimeout(function() {
                        vm.$set(
                            vm.slogan,
                            "index",
                            Math.round(Math.random() * 7)
                        );
                        vm.slogan.show = true;
                    }, 500);
                }, 10000);
            } else {
                vm.slogan.show = true;
            }
        },
        doLogin({ name, password }) {
            return this.SaaSApi.login(name, password, {
                disabledGlobalErrorHandler: true
            });
        },
        tableLoadMore() {
            if (!this.disabled) {
                return;
            }
            this.disabled = false;
        },
        setUserName() {
            if (localStorage.userName) {
                this.hasSave = true;
            }
            this.loginForm.name = localStorage.userName;
        },
        openPrivacy(completed) {
            let vm = this;
            vm.dialogVisible = true;
            vm.sureBtn = true;
        },
        handleFormSubmit() {
            let vm = this;
            vm.$refs["loginForm"].validate(valid => {
                if (valid) {
                    vm
                        .doLogin({
                            name: vm.loginForm.name,
                            password: vm.loginForm.password
                        })
                        .then(response => {
                            let data = response.data.data;
                            let hasLoggedOn = "";
                            if (localStorage.getItem("hasLoggedOn")) {
                                hasLoggedOn = localStorage.getItem(
                                    "hasLoggedOn"
                                );
                            }
                            let company = {
                                id: data["company"]["mchId"],
                                name: data["company"]["mchName"],
                                level: data["company"]["level"]
                            };
                            data["company"] = company;
                            vm.loginInfo = data;

                            if (
                                hasLoggedOn.indexOf(`"${vm.loginForm.name}"`) <
                                0
                            ) {
                                vm.openPrivacy();
                            } else {
                                vm.agreePrivacy();
                            }
                        })
                        .catch(error => {
                            let msg = error.response.data.msg;
                            vm.$message({
                                showClose: true,
                                message: msg,
                                type: "error"
                            });
                        });
                } else {
                    return false;
                }
            });
        },
        setLocale() {
            this.loginInfo.settings.timezone &&
                this.setTimeZone(this.loginInfo.settings.timezone);
            this.loginInfo.settings.language &&
                this.setLan({
                    payload: this.loginInfo.settings.language,
                    url: "/"
                });
        },
        getAndSetModules() {
            let vm = this;
            return vm.SaaSApi.getModules(vm.loginInfo.company.id).then(
                response => {
                    vm.setModules(response.data.data);
                }
            );
        },
        agreePrivacy() {
            if (this.hasSave) {
                localStorage.setItem("userName", this.loginForm.name);
            } else {
                localStorage.setItem("userName", "");
            }
            this.setLoginInfo(this.loginInfo);
            this.hasLoggedOn(this.loginForm.name);
            this.getAndSetModules().then(() => {
                this.$nextTick(() => {
                    this.setLocale();
                    // this.$router.replace("/")
                });
            });
        }
    }
};
</script>

<style scoped lang="scss">
.el-form-item {
    margin-bottom: 12px;
}

#particles-js {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
}

.login-page {
    display: flex;
    height: 100%;
    width: 100%;
    min-width: 992px;
    min-height: 600px;

    .left {
        height: 100%;
        background-size: cover;
        position: relative;

        .login-front-img {
            border: 0;
            justify-content: center;
            align-items: center;
            margin: 5% 0 0 0;
            flex: 1;
            position: relative;
            width: 100%;
            height: 80%;
        }
    }

    .right {
        display: flex;
        height: 100%;
        background-size: cover;
        justify-content: center;
        align-items: center;
    }
}

.login-wrap {
    display: flex;
    flex-direction: column;
    padding: 0 15%;
    width: 100%;

    .login-form {
        margin-top: 50px;
    }

    .slogan {
        font-size: 24px;
        min-height: 66px;
    }
}

.copyright {
    position: absolute;
    color: #fff;
    font-size: 12px;
    padding: 0 5%;
    box-sizing: border-box;
    /*position: absolute;*/
    bottom: 30px;
    width: 100%;
    span {
        padding: 0 12px;
    }
}

.textWrap {
    width: 100%;
    padding-top: 10px;
    max-height: 377px;
    display: block;
    margin: auto;
    overflow-y: scroll;
    overflow-x: hidden;
    background: #f0f0f0;
}

.dialog-footer {
    width: 100%;
    display: inline-block;
}

.title {
    text-align: center;
    font-size: 16px;
    margin-bottom: 15px;
}

.save-btn {
    display: flex;
    align-items: center;
}

.policy,
.terms {
    cursor: pointer;
}
</style>
<style scoped>
.name-input {
    margin-bottom: 19px;
}
</style>

