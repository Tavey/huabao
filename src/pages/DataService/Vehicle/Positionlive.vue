<template>
    <div class="page">
        <Breadcrumb/>
        <div class="info-container">
            <el-row>
            <el-col 
                class="info-box" 
                :xl="12"
                :span="24"
            >
                <span>
                    {{$t('speed')}}: {{parseInt(latestPoint.speed)}} km/h
                </span>
                <span>
                    {{$t('time')}}: {{latestPoint.sampled_at | formatDateTime | defaults(inputLocal('nonow'))}}
                </span>
                <span>
                    {{$t('address')}}: {{latestPoint.address | defaults(inputLocal('nonow'))}}
                </span>
            </el-col>
            </el-row>
            <hb-map
                ref="map"
                mapId="positionLive"
            >
                <hb-map-popup
                    :visible="latestPoint.visible"
                    :position="latestPoint.position"
                    maxWidth="auto"
                    :options="{
                        offset: [0, 0],
                        maxWidth: 'auto'
                    }"
                    ref="infoWindow"
                >
                    <window-content
                        :windowInfo="latestPoint"
                    ></window-content>
                </hb-map-popup>
                <hb-map-polyline
                    :position="latlngArr"
                    :options="{
                        color: '#b2d6ff',
                        weight: 5,
                    }"
                    ref="line"
                ></hb-map-polyline>
            </hb-map>
        </div>

    </div>
</template>
<script>
    import Breadcrumb from "@/components/Breadcrumb";
    import Gps from '@/utils/gps'

    import WindowContent from '@/components/WindowContent'
    import {COORDINATE_GCJ02} from "@/consts";

    export default {
        name: 'PositionLive',

        data() {
            return {
                endIdx: 0,
                deviceId: '',
                latestTime: '',
                lastIndex: 0,
                latlngArr: [],
                latestPoint: {
                    speed: 0,
                    sampled_at: '',
                    address: '',
                    position: [],
                    visible: false,
                },
                mapInfo: {
                    window: {
                        position: [0, 0],
                        visible: false,
                        info: {}
                    }
                },
            }
        },
        created() {
            this.importFontpack('DataService/VehiclesList/PositionLive');
        },
        mounted() {
            this.init();
        },
        components: {
            Breadcrumb,
            WindowContent
        },
        watch: {
            async 'endIdx'(val) {
                await this.setMapInfoWindow(this.latest[val - 1])
            },
        },
        beforeRouteLeave(to, from, next) {
            clearTimeout(this.time)
            clearTimeout(this.renderTimout)
            next()
        },
        methods: {
            init() {
                this.deviceId = this.$route.params.deviceId;
                this.getPosition();
            },
            async setMapInfoWindow(info) {
                let vm = this;
                if (!info.longitude) {
                    vm.mapInfo.window.visible = false;
                }
                vm.mapInfo.window.position = vm.movingMarker.getLatLng();
                vm.mapInfo.window.visible = true;

                vm.SaaSApi.geoRecode(longitude, latitude, vm.locale, COORDINATE_GCJ02).then(response => {
                    let data = response.data;
                    if (data.status === true) {
                        vm.mapInfo.window.info = {
                            speed: parseInt(info.speed),
                            sampled_at: vm.$options.filters.formatDateTime(info.sampled_at),
                            address: data.data.formatted_address
                        }
                    }
                }).catch((err) => {
                    console.log(err);
                });
            },
            getPosition() {   // 获取实时位置
                let _getPosition = async () => {
                    try {
                        let res = await this.SaaSApi.getDeviceLatestPoint(this.deviceId)
                        if (res.data && res.status) {
                            this.handleRes(res);
                        }
                    } catch (err) {
                        console.log(err)
                    }
                    this.time = setTimeout(_getPosition, 5000)
                }

                _getPosition()
            },
            handleRes(res) {
                let {data} = res.data;
                if (!data && !data.length && !this.isIllegal(data)) return false;

                if (!this.latestTime) {
                    this.renderMarker(data);
                    this.setPointInfo(data);
                }
                
                if (this.diffpathTime(data)) {
                    this.setPointInfo(this.locusArr[this.lastIndex]);
                }
            },
            renderMarker(data) {
                console.log(data);
                let {latitude, longitude} = data
                this.movingMarker = L.Marker.movingMarker([[latitude, longitude]], [], {
                    icon: L.divIcon({
                        iconUrl: "<div></div>",
                        className: "path-lifer",
                    })
                }).addTo(this.$refs.map.getInstance());
                this.latestTime = data.sampled_at;
                this.$refs.map && this.$refs.map.getInstance().fitBounds([this.movingMarker.getLatLng()]);
            },
            async renderWay(data) {
                this.locusArr = await this.getLocus(this.latestTime, data.sampled_at);
                this.latestTime = data.sampled_at;

                if (this.locusArr.length > 1) {
                    this.expandPath();
                }
            },
            expandPath() {
                if (this.lastIndex === (this.locusArr.length - 1)) return;
                if (this.movingMarker.isRunning()) return false;
                let pre = this.locusArr[this.lastIndex].sampled_at;
                let next = this.locusArr[this.lastIndex + 1].sampled_at;
                let duration = Math.abs(this.$moment(pre).diff(next));

                this.lastIndex++;
                let {latitude, longitude} = this.locusArr[this.lastIndex];
                let lastPosition = this.transFormPath(longitude, latitude);
                this.movingMarker.moveTo(lastPosition, duration);
                this.$refs.map && this.$refs.map.getInstance().flyToBounds([lastPosition]);
            },
            setPointInfo(data) {
                let vm = this;
                let index = this.lastIndex > 0 ? this.lastIndex : 0;
                let {speed, sampled_at, latitude, longitude} = data;
                this.latestPoint.position = [latitude, longitude];
                this.latestPoint.speed = speed;
                this.latestPoint.sampled_at = sampled_at;
                vm.SaaSApi.geoRecode(longitude, latitude, vm.locale, COORDINATE_GCJ02).then(response => {
                    let data = response.data;
                    if (data.status === true) {
                        vm.latestPoint.address = data.data.formatted_address
                    } else {
                        vm.latestPoint.address = vm.inputLocal('noaddress');
                    }

                }).catch(() => {
                    vm.map.window.info.address = this.inputLocal('noaddress');
                });
                this.latestPoint.visible = true;
            },
            filtersamePath(path) {  // 过滤相同或者速度为0的轨迹点
                let _p = path[0]
                return [].filter.call(path, (p, i) => {
                    if (i > 0) {
                        if (p.speed <= 1) return false
                        if (p.sampled_at === _p.sampled_at) {
                            return false
                        } else {
                            _p = p
                        }
                    }
                    return true
                })
            },
            isIllegal(path) {   // 判断是否违法
                console.log(path);
                return new Gps(path.longitude, path.latitude).isIllegal()
            },
            transFormPath(longitude, latitude) {  // 转换地址
                return new Gps(longitude, latitude).transform().toReArray()
            },
            diffpathTime(data) {  // 对比实时位置的时间戳
                if (!this.latestTime) {
                    return true
                }
                else {
                    return this.latestTime !== data.sampled_at
                }
            },
            async getLocus(startTime, endTime) {   // 获取轨迹节点
                try {
                    let res = await this.SaaSApi.getDeviceTrack(this.deviceId, startTime, endTime); 
                    if (res.status && res.data) {
                        return res.data.data
                    }
                } catch (err) {
                    console.log(err)
                }
            },
        }
    }
</script>
<style lang="scss" scoped>
    #map {
        height: 100%;
    }

    .info-container {
        height: 100%;
        background-color: #fff;
        border: 1px solid #dcdfe6;
        .info-box {
            color: #999;
            padding: 0 20px;
            min-height: 50px;
            display: flex;
            align-items: center;
            font-size: 14px;
            justify-content: space-between;
        }
    }


</style>
<style scoped>
    /*@formatter:off*/
#positionLive >>> .path-lifer {
    position: absolute;
    border-radius: 5px;
    background-color: rgb(39, 83, 204);
    border: 2px solid #fff;
    border-radius: 100%;
    width: 14px;
    height: 14px;
}
  /*@formatter:on*/
</style>

