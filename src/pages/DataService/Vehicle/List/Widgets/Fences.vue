<template>
    <div>
        <hb-map-circle v-for="(circle,index) in fences.circles"
                       ref="mapCircle"
                       :position="circle.shape.center"
                       :options="{
                           radius: circle.shape.radius,
                           fillOpacity:map.fillOpacity,
                           fillColor:map.fillColor,
                           strokeWeight:map.strokeWeight,
                           strokeOpacity:map.strokeOpacity
                       }"
                       :key="`circle_${index}`"
        ></hb-map-circle>
        <hb-map-polygon v-for="(polygon,index) in fences.polygons"
                        ref="mapPolygon"
                        :position="polygon.shape"
                        :options="{
                            fillOpacity:map.fillOpacity,
                            fillColor:map.fillColor,
                            strokeWeight:map.strokeWeight,
                            strokeOpacity:map.strokeOpacity,
                        }"
                        :key="`polygon_${index}`"
        ></hb-map-polygon>
    </div>
</template>

<script>

    const MAX_FENCE_COUNT_PAGE_SIZE = 1000;

    export default {
        name: "vehicle-list-map-fences",
        data() {
            return {
                fences: {
                    polygons: [],
                    circles: []
                },
                map: {
                    fillOpacity: "0.4",
                    fillColor: "#2C5076",
                    strokeWeight: 0.1,
                    strokeOpacity: 0.1,
                },
            }
        },
        mounted() {
            this.getFences();
        },
        methods: {
            getFences() {
                let vm = this;
                return vm.SaaSApi.getFences(
                    vm.currentCompany.id, [],
                    1, MAX_FENCE_COUNT_PAGE_SIZE
                ).then(res => {
                    let data = res.data.data;
                    data.list.map(v => {
                        if (v.type == "circle") {
                            v.shape.center = [
                                v.shape.center.latitude,
                                v.shape.center.longitude
                            ];
                            vm.fences.circles.push(v);
                        } else if (v.type == "polygon") {
                            v.shape = v.shape.map(point => [
                                point.latitude,
                                point.longitude
                            ]);
                            vm.fences.polygons.push(v);
                        }
                        // v.tagsArr = v.tags.map(tag => tag.name);
                        return v;
                    });
                });
            }

        }
    }
</script>

<style scoped>

</style>
