import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';

export default {
    computed: {
        ...mapState({
            loginInfo: state => state.loginInfo,
        })
    },
    created() {
        let meta = this.$route.meta;
        if (meta.rootOnly && this.loginInfo.company.id != 100100) {
            this.$router.replace('/404');
        }
    }
}
