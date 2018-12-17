<template>
    <div id="app">
        <theme-apply></theme-apply>
        <router-view></router-view>
    </div>
</template>

<script>
    import * as types from "@/store/types";
    import {mapState, mapGetters, mapActions, mapMutations} from "vuex";
    import ThemeApply from '@/components/ThemeApply';

    export default {
        components: {
            ThemeApply,
        },

        created() {
            let vm = this;
            let subDomain = window.location.hostname.split(".")[0];
            let theme = 'default';
            switch (subDomain) {
                case '127':
                // case 'zgc':
                    theme = 'zgc';
                    break;
                default:
                    break;
            }

            vm.setTheme(theme);

        },
        methods: {
            ...mapMutations({
                setTheme: types.global.mutations.SET_THEME,
            })
        }
    }
</script>

<style lang="sass">
    /*@import "assets/styles/icon"*/
    @import "assets/styles/event_el"
</style>
