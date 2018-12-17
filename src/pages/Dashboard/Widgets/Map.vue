<template>
    <div class="map-box">
        <hb-map
            ref="map"
            mapId="map-container"
            :options="{
                    dragging:false,
                    zoomControl:false,
                    boxZoom:false,
                    touchZoom:false,
                    doubleClickZoom:false,
                    scrollWheelZoom:false,
                    keyboard:false
                }"
        >
            <hb-map-canvasmarker
                ref="canvasMarker"
                :markGroup="vehicles"
                :options="{
                    zoomAnimation: false
                }"
            ></hb-map-canvasmarker>
        </hb-map>
        <el-progress
            :percentage="loadPercentage"
            v-if="loadPercentage"
            status="success"
            :text-inside="true"
            :stroke-width="18"
        ></el-progress>
    </div>
</template>

<script>

    import Gps from '@/utils/gps';
    import axios from 'axios';

    export default {
        name: "dashboard-map",
        data() {
            return {
                vehicles: [],
                total: "",
                page: 1,
                loadPercentage: 0,
                cancelTokenSources: [],
                wholeBounds: L.latLngBounds([])
            }
        },
        watch: {
            loadPercentage(val) {
                if (val >= 100) {
                    this.loadPercentage = null;
                }
            }
        },
        beforeDestroy() {
            this.cancelAllRequest();
        },
        mounted() {
            let vm = this;
            if (vm.$refs.canvasMarker.getInstance()) {
                let canvas = vm.$refs.canvasMarker;
                vm.page = 1;
                vm.vehicles = [];
                vm.wholeBounds = L.latLngBounds([]);
                canvas.redraw(true);
            }
            vm.$emit('ready');
            vm.renderMap();
        },
        methods: {
            cancelAllRequest() {
                for (let i = 0; i < this.cancelTokenSources.length; i++) {
                    let current = this.cancelTokenSources[i];
                    if (typeof current.cancel == 'function') {
                        current.cancel();
                    }
                }
            },
            renderMap() {
                let vm = this;

                let source = axios.CancelToken.source();
                source.token.throwIfRequested = source.token.throwIfRequested;
                vm.cancelTokenSources.push(source);
                source.token.promise.then(() => {
                }).catch(() => {
                });

                vm.SaaSApi.getVehiclesOnlyLatestGpsByPage(this.currentCompany.id, vm.page, 10000, {
                    cancelToken: source.token,
                    disabledGlobalErrorHandler: true
                }).then(res => {
                    if (!res.data.data.data) return false;

                    vm.page++;

                    let _data = res.data.data.data.split(":").map(str => {
                        let tmp = str.split(',');
                        return new Gps(tmp[0], tmp[1]);
                    });
                    // 进度条总数必须在过滤前计算
                    let dataLength = _data.length;
                    _data = _data.filter(v => !v.isIllegal());

                    vm.total = res.data.data.total;
                    let newVehicle = _data.map(vm.handleIcon);

                    if (vm.vehicles.length > 0) {
                        vm.vehicles = [...vm.vehicles, ...newVehicle];
                    } else {
                        vm.vehicles = newVehicle;
                    }

                    vm.$nextTick(() => {
                        if (vm.handleFitnoun()) {
                            vm.$refs.map.getInstance().fitBounds(vm.wholeBounds);
                        }
                    });
                    vm.loadPercentage += Math.ceil(dataLength / vm.total * 100);

                    if (vm.loadPercentage < 100) {
                        vm.renderMap();
                    }
                })
            },
            handleFitnoun() {
                if (this.page === 2) return true;
                if (this.page % 5 === 0) return true;
                if (this.page === this.total) return true;
                return false;
            },
            handleIcon(latlng) {
                latlng = latlng.toReArray();
                let width = this.total > 100 ? 4 : 8;
                this.wholeBounds.extend(latlng);
                return {
                    position: latlng,
                    render: (ctx, {x, y}) => {
                        ctx.beginPath();
                        ctx.arc(x, y, width, 0, 2 * Math.PI, false);
                        ctx.strokeStyle = "#000";
                        ctx.fillStyle = "#0176ff";
                        ctx.fill();
                        ctx.stroke();
                    }
                }
            },
        }
    }
</script>

<style lang="scss" scoped>
    .map-box {
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        flex: 1;
        justify-content: space-between;
        margin-top: 20px;

        .map-container {
            width: 100%;
            display: flex;
            flex: 1;
        }

        .el-progress {
            display: flex;
            flex: none;
            height: 20px;
        }
    }

</style>
