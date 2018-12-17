<template>
    <el-container>
        <aside-menu :data="[{
        icon: 'fal fa-tablet fa-2x fa-fw',
        title: inputLocal('Device'),
        children:[{
                permission:RoleActions.DeviceList,
                title:inputLocal('Device List'),
                icon: 'fal fa-list-alt fa-lg fa-fw',
                uri: '/console/devices'
            },{
                permission:RoleActions.LogList,
                title:inputLocal('Data Log'),
                icon: 'fal fa-chart-bar fa-lg fa-fw',
                uri: '/console/logs',
                rootOnly:true
            },{
                permission:RoleActions.FenceList,
                title:inputLocal('Geo Fence'),
                icon: 'fal fa-braille fa-lg fa-fw',
                uri: '/console/fences'
            }]
        },{
            icon: 'fal fa-car fa-2x fa-fw',
            title: inputLocal('Vehicle'),
            children:[{
                permission:RoleActions.VehicleList,
                title:inputLocal('Vehicle List'),
                icon: 'fal fa-list-alt fa-lg fa-fw',
                uri: '/console/vehicles'
            },{
                title: inputLocal('Approval List'),
                icon: 'fal fa-list-alt fa-lg fa-fw',
                uri: '/console/approval'
            }]
        },{
            icon: 'fal fa-user fa-2x fa-fw',
            title: inputLocal('User') ,
            children:[{
                permission:RoleActions.AccountList,
                title:inputLocal('Account'),
                icon: 'fal fa-user-alt fa-lg fa-fw',
                uri: '/console/users'
            },{
                permission:null,
                title:inputLocal('Organization'),
                icon: 'fal fa-building fa-lg fa-fw',
                uri: '/console/companies'
            },{
                permission:RoleActions.RoleList,
                title:inputLocal('Role'),
                icon: 'fal fa-users fa-lg fa-fw',
                uri: '/console/roles'
            }]
        }]">
        </aside-menu>
        <el-container>
            <el-main>
                <router-view/>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    import * as types from "@/store/types";
    import {mapState, mapGetters, mapActions, mapMutations} from "vuex";
    import AsideMenu from "@/components/AsideMenu";

    export default {
        components: {AsideMenu},
        beforeRouteUpdate(to, from, next) {
            this.init();
            next();
        },
        created() {
            this.importFontpack('Sidebar');
            this.init();
        },
        methods: {
            ...mapMutations({
                setHeaderActiveIndex: types.global.mutations.SET_HEADER_ACTIVE_INDEX,
            }),
            init() {
                this.setHeaderActiveIndex('/console');
            },
        }
    };
</script>
