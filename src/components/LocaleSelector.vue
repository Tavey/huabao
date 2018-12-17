<template>
    <el-dialog
        :visible="isVisible"
        @open="handleOpen"
        @close="closeSelector(false)"
    >
        <h3 slot="title" class="title">{{ $t("localeSelector") }}</h3>
        <el-row :gutter="20">
            <el-col>
                <h3>{{ $t("languageSelector") }}</h3>
                <el-radio-group v-model="selectLanguage">
                    <el-radio label="en">English</el-radio>
                    <el-radio label="zh-cn">中文</el-radio>
                </el-radio-group>
            </el-col>
            <el-col>
                <h3>{{ $t('timezoneSelector') }}</h3>
                <el-select
                    v-model="selectTimezone"
                >
                    <el-option
                        v-for="(zone, i) in timezones"
                        :key="i"
                        :value="zone[0]"
                        :label="zone[0]"
                    >
                        <span>{{ zone[0] }}</span>
                        <span
                            style="float:right"
                        >{{ zone[1] | strFormat }}</span>
                    </el-option>
                </el-select>
            </el-col>
        </el-row>
        <div class="btn-group">
            <el-button
                @click="closeSelector(false)"
            >{{$t("cancel")}}
            </el-button>
            <el-button
                type="primary"
                @click="setLocale"
            >{{$t("confirm")}}
            </el-button>
        </div>
    </el-dialog>
</template>
<script>
    import * as types from '../store/types';
    import {TIMEZONE} from '@/consts'
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex'

    export default {
        data() {
            return {
                selectLanguage: "zh-cn",
                selectTimezone: "Asia/Shanghai",
                timezones: TIMEZONE
            }
        },
        computed: {
            ...mapState({
                isVisible: state => state.localeSelectorStatus,
                timezone: state => state.timezone
            }),
            ...mapGetters({
                locale: types.global.getters.LOCALE
            }),

        },
        filters: {
            strFormat(val) {
                return val + ":00"
            }
        },
        methods: {
            ...mapActions({
                setLan: types.global.actions.SET_LANGUAGE,
                setTimeZone: types.global.actions.SET_TIMEZONE
            }),
            ...mapMutations({
                closeSelector: types.global.mutations.SET_LOCALE_SELECTOR_STATE
            }),
            handleOpen() {
                if (this.locale) this.selectLanguage = this.locale;
                if (this.timezone) this.selectTimezone = this.timezone;
            },
            setLocale() {
                this.SaaSApi.setSettingsI18n(
                    this.selectLanguage,
                    this.selectTimezone
                ).then(res => {
                    if (res.data && res.data.status) {
                        this.setTimeZone(this.selectTimezone);
                        this.closeSelector(false);
                        this.setLan({
                            payload: this.selectLanguage
                        });
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .btn-row {
        margin: 20px 0;
    }

    .title {
        margin: 0;
    }

    .btn-group {
        margin: 20px 0;
        display: flex;
        justify-content: flex-end;
    }
</style>
