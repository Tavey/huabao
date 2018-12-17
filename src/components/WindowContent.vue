<template>
    <div class="infoWindowWrap"
         :windowInfo="windowInfo"
         :windowStyle="windowStyle">
        <ul>
            <li>
                <span style="margin-right: 20px;">
                    <i class="fal fa-clock fa-fw"></i> {{ windowInfo.sampled_at | formatDateTime | defaults('') }}
                </span>
            </li>
            <li>
                <i class="fal fa-map-marker-alt fa-fw"></i> {{ windowInfo.address }}
            </li>
        </ul>
        <div class="other-info" v-if="hasEvent">
            <dl>
                <dd>{{$t('eventtype')}}</dd>
                <dt class="event">{{windowInfo.type_show}}</dt>
            </dl>
        </div>
        <div class="other-info" v-if="hasSpeed">
            <dl>
                <dd>{{$t('speed')}}</dd>
                <dt>{{windowInfo.speed}} km/h</dt>
            </dl>
        </div>
        <div class="other-info">
            <dl v-if="hasVehicle">
                <dd>{{$t('plateNum')}}</dd>
                <dt>{{windowInfo.plate_num}}</dt>
            </dl>
            <dl v-if="hasVehicle && windowInfo.use_type">
                <dd>{{$t('useType')}}</dd>
                <dt>{{windowInfo.use_type}}</dt>
            </dl>
            <dl v-if="hasDevice">
                <dd>{{$t('devicesn')}}</dd>
                <dt>{{windowInfo.device_sn}}</dt>
            </dl>
        </div>
        <div class="other-info" v-if="hasDriver">
            <dl>
                <dd>{{$t('driverName')}}</dd>
                <dt>{{windowInfo.driver_name}}</dt>
            </dl>
            <dl>
                <dd>{{$t('driverMobile')}}</dd>
                <dt>{{windowInfo.driver_mobile}}</dt>
            </dl>
        </div>
        <div class="other-info" v-if="windowInfo.speedOver">
            <dl>
                <dd>{{$t('speedOver.speed')}}</dd>
                <dt>{{windowInfo.speedOver.speed}}</dt>
            </dl>
            <dl>
                <dd>{{$t('speedOver.speedLimit')}}</dd>
                <dt>{{windowInfo.speedOver.speed_limit}}</dt>
            </dl>
            <dl>
                <dd>{{$t('speedOver.speedOverhead')}}</dd>
                <dt>{{windowInfo.speedOver.speed_overhead}}%</dt>
            </dl>
        </div>
        <slot name="before-controls"></slot>
    </div>
</template>

<script>

    export default {
        name: "window-content",
        props: {
            windowInfo: {
                type: Object,
                required: false
            },
            windowStyle: {
                type: Object,
                required: false
            },
            hasSpeed: {
                type: Boolean,
                default: false
            },
            hasEvent: {
                type: Boolean,
                default: false
            },
            hasDevice: {
                type: Boolean,
                default: false
            },
            hasVehicle: {
                type: Boolean,
                default: false
            },
            hasDriver: {
                type: Boolean,
                default: false
            }
        },
        created() {
            this.importFontpack('DataService/Event/List');
        },
        methods: {}
    };
</script>

<style scoped lang="scss">
    .event {
        max-width: 85px;
    }

    .infoWindowWrap {
        font-size: 12px;
        /*color: #999;*/
        min-width: 350px;
        ul {
            padding: 0;
            margin: 0;
            li {
                line-height: 25px;
            }
        }
        /*line-height: 14px;*/
    }

    .other-info {
        border-top: 1px solid #eee;
        padding: 5px 0;
        /*color: #999;*/
        display: flex;
        /*justify-content: space-between;*/
        dl {
            dd {
                text-align: left;
                margin: 0 5px 0 0;
            }
            display: flex;
            margin: 0 10px 0 0;
            /*justify-content: space-between;*/
        }
    }
</style>
