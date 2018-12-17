<template>
    <div class="page">
        <Breadcrumb>
        </Breadcrumb>
        <div class="elewrap">
            <slot name="before-form-filter"></slot>
            <el-row :gutter="20" :style="formFilterStyle" class="btnwrap">
                <el-col>
                    <el-form inline class="form-filter" size="small" v-if="!noFilter" @submit.native.prevent="handleTableFilter">
                        <slot name="form-filter-prepend"></slot>
                        <el-form-item v-if="!noFilterButton">
                            <el-button type="primary" size="mini" native-type='submit' plain icon="el-icon-search">{{$t('search')}}
                            </el-button>
                        </el-form-item>
                        <slot name="form-filter-append"></slot>
                    </el-form>
                </el-col>
            </el-row>
            <slot name="after-form-filter"></slot>
            <el-row :gutter="20" class="tablewrap">
                <slot name="additional-modules"></slot>
                <slot name="before-table-container"></slot>
                <el-col :span="tableContainerSpan" class="table-container">
                    <el-table v-if="loadMore" v-tableLoadMore="{
                            fn:tableLoadMore,
                            class:'el-table__body-wrapper'
                        }" class="table" :data="tableInfo.data" stripe :style="tableStyle" :default-sort="tableInfo.sort" height="53" show-overflow-tooltip @selection-change="handleTableSelectionChange" @cell-mouse-enter="handleTableMouseEnter" @cell-mouse-leave="handleTableMouseLeave" @sort-change="handleSortChange" @row-click="handleRowClick">
                        <slot name="table-columns"></slot>

                    </el-table>
                    <el-table v-else class="table" v-bind:class="{ padding52: !noPagination }" :data="tableInfo.data" stripe :default-sort="tableInfo.sort" height="53" :style="tableStyle" show-overflow-tooltip @selection-change="handleTableSelectionChange" @cell-mouse-enter="handleTableMouseEnter" @cell-mouse-leave="handleTableMouseLeave" @sort-change="handleSortChange" @row-click="handleRowClick">
                        <slot name="table-columns"></slot>
                    </el-table>
                    <div class="pagination-container">
                        <el-pagination v-if="!noPagination" layout="total, prev, pager, next" :total="tableInfo.total" :page-size="tableInfo.pageSize" :current-page.sync="tableInfo.page" @current-change="handlePageChange" @sort-change="handleSortChange">
                        </el-pagination>
                    </div>
                </el-col>
                <slot name="after-table-container"></slot>
            </el-row>
        </div>
        <slot name="dialog-container"></slot>
    </div>
</template>

<script>
import * as types from "@/store/types";
import Breadcrumb from "@/components/Breadcrumb";
import { TABLE_INFO } from "@/consts";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";

export default {
    name: "table-page",
    components: {
        Breadcrumb
    },
    props: {
        noFilter: {
            type: Boolean,
            required: false,
            default: false
        },
        noFilterButton: {
            type: Boolean,
            required: false,
            default: false
        },
        noPagination: {
            type: Boolean,
            required: false,
            default: false
        },
        noInitLoad: {
            type: Boolean,
            required: false,
            default: false
        },
        loadMore: {
            type: Boolean,
            required: false,
            default: false
        },
        tableInfo: {
            type: Object,
            required: false
        },
        tableContainerSpan: {
            type: Number,
            required: false,
            default: 24
        },
        tableStyle: {
            type: Object,
            required: false
        },
        formFilterStyle: {
            type: Object,
            required: false
        }
    },
    mounted() {
        if (!this.noInitLoad) this.getTableData(true);
    },
    methods: {
        handleSortChange({ column, prop, order }) {
            let vm = this;
            if (
                prop == vm.tableInfo.sort.prop &&
                order == vm.tableInfo.sort.order
            ) {
                return;
            }
            vm.$emit("table-sort-change", { column, prop, order });
            vm.tableInfo["sort"] = {
                prop: prop,
                order: order
            };
            vm.$nextTick(() => {
                vm.getTableData(true);
            });
        },
        ...mapMutations({
            setAsideActiveIndex: types.global.mutations.SET_ASIDE_ACTIVE_INDEX
        }),
        tableLoadMore() {
            this.$emit("table-load-more");
        },
        getTableData(initPage) {
            let vm = this;
            vm.$emit("table-resource", initPage);
        },
        handleTableFilter() {
            this.$emit("table-filter");
            this.getTableData(true);
        },
        handlePageChange() {
            this.getTableData();
        },
        handleTableSelectionChange(selection) {
            this.$emit("table-selection-change", selection);
        },
        handleTableMouseEnter(row, column, cell, event) {
            this.$emit("table-cell-mouse-enter", row, column, cell, event);
        },
        handleTableMouseLeave(row, column, cell, event) {
            this.$emit("table-cell-mouse-leave", row, column, cell, event);
        },
        handleRowClick(row, event, column) {
            this.$emit("table-row-click", row, event, column);
        }
    }
};
</script>

<style lang="scss" scoped>
.btnwrap {
    background-color: transparent !important;
}

.padding52 {
    padding: 0px 0px 52px 0px !important;
}

.cell {
    word-wrap: break-word;
}
</style>
<style scoped>
.page >>> .el-table__body-wrapper {
    overflow-y: scroll;
}
</style>

