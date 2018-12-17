<template>
    <div class="modelWrap">
        <el-button
            @click="getCarModel"
            size="mini"
            :round="true"
            v-if="loading"
            class="car-model-btn"
        >受力模型
        </el-button>
        <div id="load" v-if="load">
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                 x="0px"
                 y="0px"
                 width="24px"
                 height="24px"
                 viewBox="0 0 24 24"
                 class="svg"
                 xml:space="preserve">
                <rect
                    x="0"
                    y="0"
                    width="4"
                    height="7"
                    fill="#e47957">
                    <animateTransform
                        attributeType="xml"
                        attributeName="transform"
                        type="scale"
                        values="1,1; 1,3; 1,1"
                        begin="0s"
                        dur="0.6s"
                        repeatCount="indefinite"
                    >
                    </animateTransform>
                </rect>
                <rect
                    x="10"
                    y="0"
                    width="4"
                    height="7"
                    fill="#e47957">
                    <animateTransform
                        attributeType="xml"
                        attributeName="transform"
                        type="scale"
                        values="1,1; 1,3; 1,1"
                        begin="0.2s"
                        dur="0.6s"
                        repeatCount="indefinite">
                    </animateTransform>
                </rect>
                <rect
                    x="20"
                    y="0"
                    width="4"
                    height="7"
                    fill="#e47957">
                    <animateTransform
                        attributeType="xml"
                        attributeName="transform"
                        type="scale"
                        values="1,1; 1,3; 1,1"
                        begin="0.4s"
                        dur="0.6s"
                        repeatCount="indefinite">
                    </animateTransform>
                </rect>
            </svg>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import "@/utils/orbit-controls.js";
    import {
        Scene,
        WebGLRenderer,
        PerspectiveCamera,
        Color,
        Fog,
        OrbitControls,
        PointLight,
        ObjectLoader,
        LoadingManager,
        Geometry,
        Vector3,
        Line,
        LineBasicMaterial

    } from 'three';


    export default {
        name: "carModel",
        props: {
            carInfo: {
                type: Object,
                required: false
            },
        },
        data() {
            return {
                three: {},
                loading: true,
                load: false,
            };
        },
        beforeDestroy() {
            this.three.renderer && this.clearThree();
            window.removeEventListener("resize", this.onWindowResize, false);
            window.cancelAnimationFrame(this.threeId);
        },
        methods: {
            getCarModel() {
                this.loading = false
                this.load = true
                this.init();
                this.animate();
            },
            clearThree() {
                this.three.renderer.domElement.remove();
                this.three.renderer.resetGLState();
                this.three.renderer.dispose();
                this.three.renderer.info.programs.forEach(p => p.destroy());
                this.three.renderer = null;
                disposeChild(this.three.scene);
                this.three.scene.children = [];
                this.three.scene = null;
                this.three.camera = null;
                this.three.carDom = null;
                this.three = null;

                function disposeChild(obj) {
                    if (obj.children.length === 0 && obj.geometry) {
                        obj.geometry._bufferGeometry.attributes.color = [];
                        obj.geometry._bufferGeometry = null;
                        obj.geometry.dispose();
                        obj.geometry = null;
                        obj.material = null;
                        return
                    }
                    obj.children.forEach(c => {
                        disposeChild(c)
                    })
                }
            },
            loadCaranimate() {
                let manager = new LoadingManager();
                let vm = this;
                manager.onLoad = (url, itemsLoaded, itemsTotal) => {
                    setTimeout(() => {
                        vm.load = false;
                    }, 3000);
                }
                return manager;
            },
            init() {
                let vm = this;
                vm.three.carDom = document.querySelector(".modelWrap");
                vm.three.scene = new Scene();

                vm.three.scene.background = new Color(0xffffff);
                vm.three.scene.fog = new Fog(0xcce0ff, 500, 10000);

                vm.three.renderer = new WebGLRenderer({antialias: true});
                vm.three.renderer.setPixelRatio(window.devicePixelRatio);
                vm.three.renderer.setSize(vm.three.carDom.clientWidth, 300);
                vm.three.renderer.setClearColor(0xFFFFFF);
                vm.three.carDom.appendChild(vm.three.renderer.domElement);

                // camera

                vm.three.camera = new PerspectiveCamera(
                    35,
                    vm.three.carDom.clientWidth / 300,
                    1, 5000);
                vm.three.camera.position.set(15, 20, 30);

                vm.three.scene.add(vm.three.camera);

                // controls

                let controls = new OrbitControls(vm.three.camera, vm.three.renderer.domElement);
                controls.minDistance = 3;
                controls.maxDistance = 50;
                controls.maxPolarAngle = Math.PI / 2;

                //scene.add( new THREE.AmbientLight( 0x222222 ) );

                // light

                var light = new PointLight(0xffffff, 1);
                vm.three.camera.add(light);

                var geometry = new Geometry();
                var material = new LineBasicMaterial({color: 0x0000ff});
                // 给空白几何体添加点信息，这里写3个点，geometry会把这些点自动组合成线，面。
                geometry.vertices.push(new Vector3(0, 8, 0));
                geometry.vertices.push(new Vector3(0, 5, 0));
                //线构造
                var line = new Line(geometry, material);
                // 加入到场景中
                vm.three.scene.add(line);
                let objectLoader = new ObjectLoader(vm.loadCaranimate());
                require("@/assets/models/ground_shadow.jpg");
                require("@/assets/models/headlights.png");
                require("@/assets/models/WHEEL_DIFUSE.png");
                objectLoader.load(require("@/assets/models/car-project.json")/*"http://localhost:8080/car-project.json"*/, function (obj) {
                    vm.three.scene.add(obj);
                    let wd = vm.three.scene.getObjectByName("Windows");
                    wd.material.opacity = 0.8;
                    let hg = vm.three.scene.getObjectByName("HeadlightsGlass");
                    hg.material.opacity = 0.8;
                    wd.material.color.r = 0;
                    wd.material.color.g = 0;
                    wd.material.color.b = 0;
                    let cf = vm.three.scene.getObjectByName("CarFrame");
                    cf.material.color.r = 136 / 255;
                    cf.material.color.g = 136 / 255;
                    cf.material.color.b = 136 / 255;
                    obj.position.set(0, 1, 0);
                });
                objectLoader.load(require("@/assets/models/untitled-scene.json")/*"http://localhost:8080/untitled-scene.json"*/, function (obj) {
                    vm.three.scene.add(obj);
                    var cobj = vm.three.scene.getObjectByName("Merged_Meshes");
                    cobj.scale.set(1, 1, 1); //箭头大小
                    cobj.rotation.z = 0; //箭头自身旋转
                    cobj.position.y = 2; //上下高度
                    cobj.rotation.x = 0; //箭头自身方向 竖向


                    let x = (vm.carInfo.absX / 1000).toFixed(2);
                    let y = (vm.carInfo.absY / 1000).toFixed(2);
                    let Angle
                    if (x > y) {
                        Angle = (Math.atan(x / y) * 180 / Math.PI).toFixed(2);
                    } else {
                        Angle = (Math.atan(y / x) * 180 / Math.PI).toFixed(2);
                    }

                    //   console.log('x轴:'+vm.carInfo.x_acceleration,'y轴:'+vm.carInfo.y_acceleration, Angle + '度')
                    if (vm.carInfo.absX > vm.carInfo.absY) {
                        if (vm.carInfo.x_acceleration < 0) {
                            //车尾
                            cobj.position.x = -12.5
                            if (vm.carInfo.y_acceleration > 0) {
                                cobj.rotation.y = Angle == 90 ? 1.5 : (Angle / 90) * 2.2
                                cobj.position.z = ((90 - Angle) / 90) * -10
                            } else {
                                cobj.rotation.y = 2.8 - ((Angle) / 90) * 1.4
                                cobj.position.z = ((90 - Angle) / 90) * 5.5 + ((90 - Angle) / 90 * 3)
                            }
                        } else {
                            //车头
                            cobj.position.x = 11
                            if (vm.carInfo.y_acceleration > 0) {
                                cobj.rotation.y = Angle == 90 ? -1.5 : -(Angle / 90) * 1.8
                                cobj.position.z = ((90 - Angle) / 90) * -10
                            } else {
                                cobj.rotation.y = Angle == 90 ? -1.5 : -2.8 + ((Angle) / 90) * 1.4
                                cobj.position.z = ((90 - Angle) / 90) * 10
                            }
                        }
                    } else {
                        if (vm.carInfo.y_acceleration < 0) {
                            //右侧
                            cobj.position.z = 5.5
                            if (vm.carInfo.x_acceleration > 0) {
                                cobj.rotation.y = 3.2 - ((90 - Angle) / 90) * 1.6; //1.6
                                cobj.position.x = ((90 - Angle) / 90) * -10;
                            } else {
                                cobj.rotation.y = -(Angle / 90) * 1.6 - 1.6; //-1.6
                                cobj.position.x = (90 - Angle) / 90 * 10;
                            }


                        } else {
                            //左侧
                            cobj.position.z = -5.5
                            if (vm.carInfo.x_acceleration > 0) {

                                cobj.rotation.y = ((90 - Angle) / 90) * 1.4
                                cobj.position.x = ((90 - Angle) / 90) * -10
                            } else {
                                cobj.rotation.y = ((90 - Angle) / 90) * -1.4
                                cobj.position.x = ((90 - Angle) / 90) * 10
                            }
                        }

                    }

                });
                window.addEventListener("resize", this.onWindowResize, false);
            },
            onWindowResize() {
                let vm = this;
                vm.three.camera.aspect = vm.three.carDom.clientWidth / 300;
                vm.three.camera.updateProjectionMatrix();

                vm.three.renderer.setSize(vm.three.carDom.clientWidth, 300);
            },
            animate() {
                this.threeId = requestAnimationFrame(this.animate);
                this.render()
            },
            render() {
                this.three.renderer.render(this.three.scene, this.three.camera);
            }
        }
    };
</script>

<style scoped lang="scss">
    .modelWrap {
        height: 100%;
        width: 100%;
        position: relative;
        text-align: center
    }

    .car-model-btn {
        font-size: 12px;
        width: 80px;
        height: 28px;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        margin: auto;
        right: 0;
    }

    #load {
        position: absolute;
        width: 100%;
        height: 100%;
        background: #fff;
        .svg {
            position: absolute;
            margin: auto;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }
    }
</style>
