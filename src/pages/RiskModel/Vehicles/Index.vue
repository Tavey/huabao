<template>
    <div class="page">
        <Breadcrumb></Breadcrumb>
        <el-row :gutter="10" class="filter">
            <el-col :span="24">
                <span>{{$t('last_update_time')}}  {{latestDate | formatDateTime('YYYY-MM-DD') | defaults(inputLocal('no'))}}</span>
            </el-col>
        </el-row>
        <el-row class="tab-bar">
            <el-col :span="12">
                <el-row>
                    <el-col :span="4">
                        <router-link :to="`/risk/vehicles/${vehicleId}`" tag="span">{{$t('comprehensive')}}
                        </router-link>
                    </el-col>
                    <el-col :span="4">
                        <span>{{$t('car')}}</span>
                    </el-col>
                    <el-col :span="4">
                        <span>{{$t('security')}}</span>
                    </el-col>
                    <el-col :span="4">
                        <span>{{$t('area')}}</span>
                    </el-col>
                    <el-col :span="4">
                        <span>{{$t('environment')}}</span>
                    </el-col>
                    <el-col :span="4">
                        <span>{{$t('performance')}}</span>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="12">
                <div class="add-model">
                    <i class="fa fa-plus-square"></i>
                    <span>{{$t('model')}}</span>
                </div>
            </el-col>
        </el-row>
        <el-row :gutter="10" class='basic'>
            <el-col :span="6">
                <div class="carInfo">
                    <div class="carInfo-head">
                        <span>{{$t('vehicleInfo')}}</span>
                        <img :src="carIcon"/>
                        <img :src="licenseplate" width="73" height="20"/>
                    </div>
                    <div class="carInfo-main">
                        <dl>
                            <dd>{{$t('score')}}</dd>
                            <dt>
                                <span class="score">{{nounScore | getValue | defaults(inputLocal('no'))}}</span>
                                <img :src='favorIcon' class="favor-icon"/>
                            </dt>
                        </dl>
                        <div class="basic-info-top"></div>
                        <div class="basic-info">
                            <h3>{{$t('benchmark')}}</h3>
                            <dl>
                                <dd>{{$t('load')}}</dd>
                                <dt>24{{$t('Tons')}}</dt>
                            </dl>
                            <dl>
                                <dd>{{$t('time')}}</dd>
                                <dt>{{totalTime | transFormSecToDay}}{{$t('day')}}</dt>
                            </dl>
                            <dl>
                                <dd>{{$t('mileage')}}</dd>
                                <dt>{{totalMile | transFormMileToKm}} km</dt>
                            </dl>
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="chart-box">
                    <div ref="radar" style="width:100%;height: 300px;"></div>
                    <p class="match">{{$t('compatibility')}} {{suitability | transFormToper |
                        defaults(inputLocal('no'))}}</p>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="apply">
                    <h3>{{$t('business_model')}}</h3>
                    <ul>
                        <el-radio-group v-model="modelType">
                            <li>
                                <el-radio size="mini" label="0" name="modeType" class="apply-radio" disabled>
                                    {{$t('such_model')}}
                                </el-radio>
                            </li>
                            <li>
                                <el-radio size="mini" label="1" name="modeType" class="apply-radio">
                                    {{$t('dangerous')}}
                                </el-radio>
                            </li>
                            <li>
                                <el-radio size="mini" label="2" name="modeType" class="apply-radio" disabled>
                                    {{$t('major')}}
                                </el-radio>
                            </li>
                            <li>
                                <el-radio size="mini" label="3" name="modeType" class="apply-radio" disabled>
                                    {{$t('general')}}
                                </el-radio>
                            </li>
                            <li>
                                <el-radio size="mini" label="4" name="modeType" class="apply-radio" disabled>
                                    {{$t('saturation')}}
                                </el-radio>
                            </li>
                        </el-radio-group>
                    </ul>
                    <span class="apply-btn" @click="applyModel">{{$t('application')}}</span>
                </div>
            </el-col>
        </el-row>
        <el-row :gutter="10">
            <el-col :span="12">
                <div class="ychart">
                    <div ref="Usage" style="height: 300px;width:100%;"></div>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="ychart">
                    <div ref="Safety" style="height: 300px;width:100%;"></div>
                </div>
            </el-col>
        </el-row>
        <el-row :gutter="10">
            <el-col :span="8">
                <div class="xchart">
                    <div ref="Environment" style="height: 300px;width:100%;"></div>
                </div>
            </el-col>
            <el-col :span="8">
                <div class="xchart">
                    <div ref="Road" style="height: 300px;width:100%;"></div>
                </div>
            </el-col>
            <el-col :span="8">
                <div class="xchart">
                    <div ref="xchart3" style="height: 300px;width:100%;position:relative;">
                        <h3 style="font-size:20px;color:#999;position:absolute;top:50%;left:50%;margin:auto">
                            {{$t('no_data')}}</h3>
                    </div>
                </div>
            </el-col>
        </el-row>
        <div class="masker" v-if="hasData">
            Coming Soon...
        </div>

    </div>

</template>

<script>
    import ChartMixin from '@/mixins/chart-component';
    import GlobalMixin from '@/mixins/global';
    import background from "@/assets/riskpage.png"
    import licenseplate from "@/assets/licenseplate.png"
    import {splitArrByOdd} from '@/utils/util'
    import {scoreMap, chartMap, mockData, labelMap, getSuitability} from './dataUtil.js'
    import Breadcrumb from "@/components/Breadcrumb.vue";

    export default {
        components: {Breadcrumb},
        mixins: [ChartMixin, GlobalMixin],
        data() {
            return {
                background: background,
                filterType: '',
                filterValue: '',
                licenseplate: licenseplate,
                lineIndex: 0,
                favorIcon: '',
                carIcon: '',
                hasData: true,
                latestDate: '',
                timeRange: [],
                nounScore: '',
                vehicleId: '',
                totalMile: '',
                totalTime: '',
                modelType: '',
                suitability: ''
            }
        },
        created() {
            this.timeRange = [this.$moment().format('L'), this.$moment().format('L')];
            this.importFontpack('RiskModel');
        },
        mounted() {
            this.init()
        },
        filters: {
            getValue(val) {
                return Object.values(val)[0]
            },
            transFormMileToKm(val) {
                return Math.round(val / 1000)
            },
            transFormSecToDay(val) {
                return Math.round(val / 86400) + 1
            },
            transFormToper(val) {
                if (val) return (val * 100).toString().substring(0, 3) + '%'
            }
        },
        methods: {
            init() {
                this.switchData()
                this.setIcon()
            },
            async setIcon() {
                this.favorIcon = await import('@/assets/favor.png');
                this.carIcon = await import('@/assets/tankIcon.png')
            },
            async switchData() {
                this.vehicleId = this.$route.params.vehicle_id
                const {radar, y, x} = mockData
                if (!this.vehicleId) {
                    y.forEach(data => this.renderYchart(data))
                    x.forEach(data => this.renderXchart(data))
                    this.renderRadar([mockData.radar[0]])
                    this.setScoreAndDate(mockData.radar[0], moment().format('L'))
                } else {
                    this.hasData = false
                    this.getTotalData()
                }
            },
            async getTotalData() {
                try {
                    let res = await this.SaaSApi.getVehicleScore(this.vehicleId, this.timeRange[0], this.timeRange[1])
                    if (res.status && res.data.data.calculated_at && res.data.data.statistical) {
                        this.setScoreAndDate(res.data.data)
                        let scores = res.data.data.scores
                        Object.keys(scores).forEach(key => {
                            if (scores[`${key}`] === null) return false
                            if (key !== 'total') {
                                let _key = key[0].toUpperCase() + key.substring(1)
                                this.handleBarData(scores[`${key}`], _key)
                            } else {
                                this.radarData = this.filterData(scores.total).slice(1)
                                this.renderRadar([this.radarData])
                            }
                        })
                    }
                } catch (err) {
                    console.log(err)
                }
            },
            handleBarData(Bardata, k) {
                let _bar = {
                    title: chartMap[`${k}`].title,
                    dom: k,
                    data: Bardata,
                    type: k,
                    methodType: chartMap[`${k}`].methodType,
                    label: labelMap[`${k}`]
                }
                this.renderBar(_bar)
            },
            renderBar(chart) {
                if (chart.methodType === 'y') {
                    this.renderYchart(chart)
                } else {
                    this.renderXchart(chart)
                }
            },
            async searchData() {
                await this.getTotalData()
            },
            filterData(data) {
                let keyArr = Object.keys(data)
                return keyArr.map(k => {
                    let i = scoreMap[`${k}`]
                    let v = data[`${k}`]
                    return {[`${i}`]: v}
                })
            },
            applyModel() {
                if (this.modelType && this.radarData) {
                    let data = [mockData.radar[this.modelType]]
                    data.unshift(this.radarData)
                    this.suitability = getSuitability(data[0], data[1])
                    this.renderRadar(data)
                }
            },
            setScoreAndDate({calculated_at, statistical, scores}) {
                this.totalMile = statistical.usage_mile
                this.totalTime = this.$moment(statistical.day_end).unix() - this.$moment(statistical.day_from).unix()
                this.latestDate = calculated_at
                this.nounScore = scores.total
            },
            renderRadar(data) {
                let chart = this.createChartFromDom(this.$refs.radar)
                let vm = this;
                let option = {
                    title: {
                        text: `${vm.inputLocal('business')} {gray|(${vm.inputLocal('delay')})}`,
                        textStyle: {
                            rich: {
                                gray: {
                                    color: '#999'
                                }
                            }
                        },
                    },
                    yAxis: {show: false},
                    xAxis: {show: false},
                    radar: {
                        name: {
                            formatter: (value) => {
                                let index = /([1-9]{1,4})/g.exec(value).index
                                return `${value.slice(0, index)}\n{bold| ${value.slice(index)}}`
                            },
                            rich: {
                                bold: {
                                    fontSize: 24,
                                    color: '#000',
                                    fontWeight: 700,
                                }
                            }
                        },
                        indicator: data[0].map(a => {
                            let key = Object.keys(a)[0]
                            return {text: `${key}${a[key]}`, max: 1000}
                        }),
                        startAngle: 18.5,
                    },
                    series: [{
                        type: 'radar',
                        data: data.map((d, i) => {
                            return {
                                value: d.map(a => a[Object.keys(a)[0]]),
                                lineStyle: {
                                    normal: {
                                        color: i === 0 ? '#2f8df9' : '#ffab25'
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        opacity: 0
                                    }
                                },
                                areaStyle: {
                                    normal: {
                                        color: i === 0 ? '#2f8df9' : '#ffab25',
                                        opacity: i === 0 ? '1' : '.8'
                                    }
                                }
                            }
                        })
                    }],
                };
                chart.setOption(option)
            },
            renderYchart({title, dom, data, label}) {
                let chart = this.createChartFromDom(this.$refs[dom])
                let dataArr = splitArrByOdd(data)
                let option = {
                    title: {
                        text: title
                    },
                    xAxis: {
                        type: 'value',
                        axisLine: {
                            lineStyle: {
                                color: "#ebeff7"
                            }
                        },
                    },
                    yAxis: {
                        type: 'category',
                        axisLine: {
                            lineStyle: {
                                color: "#ebeff7"
                            }
                        },
                        axisLabel: {
                            interval: 0,
                            fontSize: 12,
                            margin: 4,
                        },
                        data: label.slice().reverse()
                    },
                    series: [{
                        name: '',
                        type: 'bar',
                        barWidth: '60%',
                        barGap: '-100%',
                        data: dataArr[0],
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: '#b2d6ff',
                            }
                        }
                    }, {
                        name: '',
                        type: 'bar',
                        barWidth: '60%',
                        data: dataArr[1],
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: '#66adff',
                            }
                        }
                    }]
                }
                chart.setOption(option)
            },
            renderXchart({data, title, label, dom}) {
                let chart = this.createChartFromDom(this.$refs[dom])
                let dataArr = splitArrByOdd(data)
                let option = {
                    title: {
                        text: title
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: label.slice(0, Object.keys(data).length),
                            axisLabel: {
                                interval: 0
                            },
                            axisLine: {
                                lineStyle: {
                                    color: "#ebeff7"
                                }
                            },
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisLine: {
                                lineStyle: {
                                    color: "#ebeff7"
                                }
                            },
                        }
                    ],
                    series: [
                        {
                            type: 'bar',
                            barWidth: '20%',
                            barGap: '-100%',
                            data: dataArr[0],
                            label: {
                                normal: {
                                    show: true,
                                    position: 'top'
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#66adff',
                                }
                            }
                        },
                        {
                            type: 'bar',
                            barWidth: '20%',
                            data: dataArr[1],
                            label: {
                                normal: {
                                    show: true,
                                    position: 'top'
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#b2d6ff',
                                }
                            }

                        }
                    ]
                }
                chart.setOption(option)
            },
        },
    };
</script>
<style lang="scss" scoped>
    .masker {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        background: rgba(0, 0, 0, .4);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 72px;
        color: #fff;
    }

    .router-link-exact-active {
        color: #0276ff;
        border-bottom: 3px solid #0276ff;
        padding-bottom: 8px;
    }

    .white-bg {
        background-color: #fff;
        padding-top: 20px;
    }

    dd, ul, h3 {
        margin: 0;
        padding: 0;
        font-weight: 500;
    }

    .page {
        background-size: 100%;
    }

    .middle {
        height: 100%;
        display: inline-flex;
        align-items: center;
        cursor: pointer;
    }

    .basic {
        margin-top: 10px;
    }

    .head {
        display: flex;
        align-items: center;
        span:last-child {
            font-size: 14px;
        }
        .fa-list-alt {
            color: #999;
            margin-right: 10px;
        }
    }

    .filter {
        margin-top: 15px;
        span {
            font-size: 14px;
            color: #999;
            float: right;
        }
    }

    .carInfo {
        height: 330px;
        @extend .white-bg;
        padding-left: 10px;
        .carInfo-head {
            display: flex;
            align-items: center;
            justify-content: space-around;
            font-size: 16px;
            max-width: 200px;
        }
        .carInfo-main {
            padding-left: 4px;
            .basic-info-top {
                height: 10px;
                background-color: #f6f7f8;
                width: 110%;
                position: relative;
                left: -10%;
            }
            .basic-info {
                display: flex;
                position: relative;
                left: -15px;
                justify-content: space-around;
                text-align: center;
                flex-wrap: wrap;
                padding-top: 35px;
                h3 {
                    width: 100%;
                    text-align: left;
                    position: relative;
                    left: 20px;
                    font-size: 16px;
                }
            }
            dd {
                color: #999;
                font-size: 14px;
            }
            dt {
                font-size: 14px;
                .favor-icon {
                    position: relative;
                    top: -20px;
                    left: 10px;
                    width: 15px;
                }
            }
            .score {
                font-size: 46px;
                color: #0276ff;
            }
        }
    }

    .chart-box {
        background-color: #fff;
        height: 330px;
        display: flex;
        justify-content: center;
        padding-top: 20px;
        position: relative;
        .match {
            position: absolute;
            bottom: 0px;
            left: 20px;
            font-size: 14px;
            color: #999
        }
    }

    .apply {
        @extend .white-bg;
        height: 330px;
        ul {
            position: relative;
        }
        h3 {
            font-size: 16px;
            margin-bottom: 30px;
            padding-left: 20px;
        }
        li {
            padding-left: 20px;
            color: #999;
            margin: 20px 0;
            font-size: 12px;
            span {
                cursor: pointer;
            }
        }
        input:checked + span {
            color: #ff8a16;
            position: relative;
            &:before {
                content: '';
                display: block;
                width: 6px;
                height: 6px;
                background-color: #ff8a16;
                position: absolute;
                left: -13px;
                border-radius: 100%;
                top: 3px;
            }
        }
        .apply-radio {
            font-size: 12px;
        }
        .cursor {
            width: 5px;
            height: 18px;
            padding: 0;
            margin: 0;
            background-color: #0276ff;
            position: absolute;
            top: 0px;
            transition: all .5s;
        }
        .apply-btn {
            color: #0276ff;
            border: 1px solid #eee;
            font-size: 13px;
            margin: auto;
            width: 80%;
            line-height: 30px;
            text-align: center;
            height: 30px;
            cursor: pointer;
            display: block;
            &:hover {
                color: #fff;
                background-color: #0276ff;
            }
        }
    }

    .ychart {
        @extend .white-bg;
        margin-top: 10px;
        padding-top: 20px;
    }

    .xchart {
        @extend .ychart;
        height: 300px;
    }

    .tab-bar {
        background-color: #fff;
        margin-top: 10px;
        padding: 10px 0;
        color: #999;
        font-size: 14px;
        text-align: center;
        border: 1px solid #eff1f2;
        span {
            cursor: pointer;
            &:hover {
                color: #0276ff
            }
        }
        .add-model {
            text-align: right;
            padding-right: 30px;
            span {
                &:hover {
                    color: #999
                }
            }
        }
    }

    @media (max-width: 992px) {
        .carInfo {
            .carInfo-head {
                font-size: 14px;
            }
            .carInfo-main {
                dd {
                    font-size: 12px;
                }
                dt {
                    font-size: 12px;
                }
                .score {
                    font-size: 36px;
                }
            }
        }
        .apply {
            h3 {
                font-size: 14px;
            }
        }
    }
</style>
