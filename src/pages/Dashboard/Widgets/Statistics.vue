<template>
    <div id="statistics">
        <el-row :gutter="20" class="container">
            <el-col :span="2" class="count-box">
                <div class="count">
                    <div class="hidden-md-and-down" style="padding: 3px 6px 3px 3px;">
                        <img src="@/assets/chart_1_4.svg" style="width: 40px;height: 40px;"/>
                    </div>
                    <div>
                        <span>{{$t('statistics')}}</span><br/>
                        <small>Statistics</small>
                    </div>
                </div>
            </el-col>
            <el-col :span="20">
                <el-row type="flex" justify="space-between">
                    <el-col v-if="hasItem('driving')">
                        <p>{{ statistics.drving_count ? statistics.drving_count : 0 }}</p>
                        <small>{{$t('driving')}}</small>
                    </el-col>
                    <el-col v-if="hasItem('stopped')">
                        <p>
                            {{ statistics.all_count ? (statistics.all_count - statistics.drving_count) : 0 }}
                        </p>
                        <small>{{$t('stopped')}}</small>
                    </el-col>
                    <el-col v-if="hasItem('usage_mile')">
                        <p>
                            {{ statistics.usage_mile ? Math.round(statistics.usage_mile / 1000) : 0 }}
                        </p>
                        <small>{{$t('allmile')}}</small>
                    </el-col>
                    <el-col v-if="hasItem('usage_time')">
                        <p>
                            {{ statistics.usage_time ? Math.round(statistics.usage_time / 60 / 60) : 0 }}
                        </p>
                        <small>{{$t('alltime')}}</small>
                    </el-col>
                    <el-col v-if="hasItem('emergency')">
                        <p>{{ statistics.crash_count ? statistics.crash_count : 0 }}</p>
                        <router-link tag="small" class="blue-under" to="/events/type/emergency">
                            {{$t('emergency')}}
                        </router-link>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import _ from 'lodash';

    export default {
        name: "dashboard-statistics",
        props: {
            options: {
                type: Array
            },
        },
        data() {
            return {
                statistics: {},
            }
        },
        mounted() {
            this.renderStatistics();
        },
        methods: {
            getCompanyGlobalStatistics() {
                return this.SaaSApi.getCompanyGlobalStatistics(this.currentCompany.id);
            },
            renderStatistics() {
                let vm = this;
                return new Promise((resolve, reject) => {
                    vm.getCompanyGlobalStatistics().then(response => {
                        let data = response.data.data;
                        for (let i = 0; i < data.length; i++) {
                            vm.$set(vm.statistics, data[i].count_type, data[i].count_sum);
                        }
                        vm.$emit('ready');
                        resolve(response);
                    }).catch((response) => {
                        reject(response);
                    });
                })
            },
            hasItem(name) {
                return _.indexOf(this.options, name) >= 0;
            }
        }
    }
</script>

<style scoped lang="scss">
    #statistics {
        padding-bottom: 20px;
        margin-top: 10px;
        text-align: center;
        p {
            margin: 5px 0;
            font-size: 26px;
        }
        small {
            color: #999;
            font-size: 12px;
        }
        .container {
            display: flex;
            align-items: center;
        }
        .blue-under {
            color: #0077ff;
            cursor: pointer;
            text-decoration: underline;
        }
        .count {
            display: inline-flex;
        }
    }

    @media (max-width: 1000px) {
        #statistics {
            p {
                font-size: 20px;
            }
        }
        .count-box {
            margin-right: 30px;
            margin-bottom: -10px;
        }
    }

</style>
