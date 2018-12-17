<template>
    <el-card class="box-card trip-info-container">
        <div slot="header" class="header">
            <div class="basic-info">{{$t('travelInformation')}}
                <i
                    class="copy-btn"
                    @click="handleCopyId"
                >{{$t('copy')}}</i>
                <textarea
                    ref="id"
                    style="width:0;height:0;opacity:0;"
                    v-model="trip.tripId"
                ></textarea>
                <div class="basic-info">
                    <span v-if="trip.plateNum">{{$t('plateNum')}} : {{trip.plateNum | defaults('')}}</span>
                    <span v-if="trip.deviceId">{{$t('devicesn')}}: {{trip.deviceId | defaults('')}}</span>
                    <span v-if="trip.driver">{{$t('driver')}}: {{trip.driver | defaults('')}}</span>
                </div>
            </div>
            <div class="load-status" v-if="currentCompany.id == 100059">
                <el-select
                    v-model="loadStatus"
                    :placeholder="inputLocal('loadStatus')"
                    size="mini"
                    @change="handleLoadStatusChange"
                >
                    <el-option value="0" :label="inputLocal('loadEmpty')">{{$t('loadEmpty')}}</el-option>
                    <el-option value="1" :label="inputLocal('loadFull')">{{$t('loadFull')}}</el-option>
                </el-select>
            </div>
        </div>
        <el-row type="flex" :gutter="10" class="trip-info" justify="space-around">
            <el-col :span="7" :lg="8" :xl="8" class="start">
                <div class="point"><img src="@/assets/startpoint.png" alt=""></div>
                <div class="start-end">
                    <p>{{ trip.beginTime | formatDateTime | defaults(inputLocal('noData')) }}</p>
                    <div v-if="
                        formattedAddress.begin.province &&
                        formattedAddress.begin.district &&
                        (formattedAddress.begin.street || formattedAddress.begin.streetNumber)
                    ">
                        <p>
                            {{ `${formattedAddress.begin.province} - ${formattedAddress.begin.district}` }}
                        </p>
                        <p>{{ formattedAddress.begin.showAddress | defaults(inputLocal('noData')) }}</p>
                    </div>
                    <p v-else-if="formattedAddress.begin.showAddress">
                        {{ formattedAddress.begin.showAddress }}
                    </p>
                    <p v-else>{{ trip.beginAddress }}</p>
                </div>
            </el-col>
            <el-col :span="10" :lg="8" :xl="8" class="middle">
                <el-row type="flex" justify="space-around">
                    <el-col :span="8">
                        {{$t('duration')}}
                        <p>{{ trip.duration | formatDuration("hh:mm:ss") | defaults(inputLocal('noData')) }}</p>
                    </el-col>
                    <el-col :span="8">
                        {{$t('mileage') | defaults(inputLocal('noData'))}}
                        <p v-if="trip.mileage">{{ Math.round(trip.mileage/100)/10 | defaults(inputLocal('noData'))
                            }} </p>
                    </el-col>
                    <el-col :span="8">
                        {{$t('averageSpeed') | defaults(inputLocal('noData'))}}
                        <p v-if="trip.averageSpeed">{{ trip.averageSpeed | defaults(inputLocal('noData')) }} </p>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="7" :lg="8" :xl="8" class="end">
                <div class="start-end">
                    <p>{{ trip.endTime | formatDateTime | defaults(inputLocal('noData')) }}</p>
                    <div v-if="
                        formattedAddress.end.province &&
                        formattedAddress.end.district &&
                        (formattedAddress.end.street || formattedAddress.end.streetNumber)
                    ">
                        <p>
                            {{ `${formattedAddress.end.province} - ${formattedAddress.end.district}` }}
                        </p>
                        <p>{{ formattedAddress.end.showAddress | defaults(inputLocal('noData')) }}</p>
                    </div>
                    <p v-else-if="formattedAddress.end.showAddress">
                        {{ formattedAddress.end.showAddress }}
                    </p>
                    <p v-else>{{ trip.endAddress }}</p>
                </div>
                <div class="point">
                    <img src="@/assets/endpoint.png" alt="">
                </div>
            </el-col>
        </el-row>
    </el-card>
</template>

<script>

    import {AMapService} from "@/utils/util";
    import * as types from '@/store/types';
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import Gps from "@/utils/gps";

    export default {
        name: "trip-detail-intro",
        props: {
            trip: {
                required: true,
                type: Object
            }
        },
        filters: {
            formatToMin(time) {
                return parseInt(time / 60)
            }
        },
        computed: {
            ...mapGetters({
                currentCompany: types.global.getters.CURRENT_COMPANY
            }),
        },
        created() {
            this.importFontpack('Public/TripDetail/intro');
            this.decodeBeginAndEnd();
        },
        data() {
            return {
                formattedAddress: {
                    begin: {},
                    end: {}
                },
                loadStatus: null
            }
        },
        methods: {
            handleCopyId() {
                let vm = this;
                vm.$refs.id.select();
                document.execCommand("copy");
                vm.$message({
                    duration: 1000,
                    message: vm.inputLocal('copySuccess'),
                    type: 'success'
                });
            },
            //逆编码起点与终点
            decodeBeginAndEnd() {
                let vm = this;
                let pending = ['begin', 'end'];
                for (let i = 0; i < pending.length; i++) {
                    if (vm.trip[`${pending[i]}Gps`]) {
                        let lnglat = vm.trip[`${pending[i]}Gps`].split(',');
                        let gps = new Gps(lnglat[0], lnglat[1]);
                        vm.SaaSApi.geoRecode(gps.longitude, gps.latitude, vm.locale, null, {disabledGlobalErrorHandler: true}).then(response => {
                            let data = response.data;
                            if (data.status === true) {
                                let addressComponent = data.data.address_components;
                                vm.$set(vm.formattedAddress, pending[i], {
                                    province: addressComponent.province,
                                    district: addressComponent.district,
                                    neighborhood: addressComponent.neighborhood,
                                    street: addressComponent.street,
                                    streetNumber: addressComponent.street_number,
                                    showAddress: data.data.formatted_address
                                });
                                // let tmp = vm.formattedAddress[pending[i]];
                                // tmp.showAddress = data.data.formatted_address
                                // `${tmp.street || ''}${tmp.streetNumber || ''}${tmp.neighborhood || ''}`
                            }

                        }).catch(e => {
                            vm.$set(vm.formattedAddress, pending[i], {
                                showAddress: vm.trip[`${pending[i]}Address`]
                            });
                        });
                    }
                }
            },
            handleLoadStatusChange(val) {
                this.SaaSApi.setCarLoadStatus(this.trip.id, this.trip.vehicle.id, val).then(res => {
                    this.$notify({
                        type: 'success'
                    })
                }).catch(err => {
                    this.$notify({
                        title: `Error: ${err}`,
                        type: "error"
                    })
                })
            }
        }
    }
</script>

<style scoped lang="scss">
    .header {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        .basic-info {
            display: flex;
            align-items: center;
            .basic-info {
                margin-left: 20px;
                color: #999;
            }
            span {
                margin: 0 8px;
            }
        }
        .copy-btn {
            font-style: normal;
            font-size: 12px;
            border: 1px solid #999;
            border-radius: 16px;
            padding: 3px 5px;
            margin-left: 10px;
            display: inline-block;
            cursor: pointer;
            &:hover {
                color: #fff;
                background-color: #999;
            }
        }
    }

    .trip-info {
        p {
            margin: 2px 0;
        }
        align-items: center;
        font-size: 14px;
        .start-end {
            display: flex;
            flex-direction: column;

            & > * {

                justify-content: space-around;
            }
        }

        .start {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            .point {
                margin-right: 10px;
            }
        }
        .middle {
            color: #999;
            .el-col {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            p {
                margin: 0;
                font-size: 25px;
                color: #333;
            }
        }
        .end {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            .point {
                margin-left: 10px;
            }
        }
    }
</style>
