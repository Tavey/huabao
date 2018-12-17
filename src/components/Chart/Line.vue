<template>
    <div :style="{width:privateOptions.width,height:privateOptions.height}"></div>
</template>

<script>
    import _ from 'lodash';
    import * as d3 from "d3";
    import Basic from "./mixins/basic";
    import HasAxis from "./mixins/has-axis";


    export default {
        name: "hb-chart-line",
        props: {
            mousePositionX: {
                default: null
            },
            focusIndex: {}
        },
        data: function () {
            return {
                focus: null,
                tooltip: null,
                overlay: null,
                colorScales: {},
                moveHandler: null,
                // isMoving: false
            };
        },
        mixins: [Basic, HasAxis],
        mounted() {
            this.createXAxis();
            this.createYAxis();
            this.createContent();
            this.createFocus();
        },
        watch: {
            mousePositionX(mousePosX) {
                this.handleMousePositionXChange(mousePosX);
            },
            focusIndex(index) {
                let x = this.xScale(this.privateSource[index][this.privateOptions.xAxis.key]);
                this.handleMousePositionXChange(x);

            }
        },
        methods: {
            handleMousePositionXChange(mousePosX) {
                let vm = this;
                if (mousePosX) {
                    vm.focus.style("display", null);
                    if (vm.privateOptions.tooltip.show) vm.tooltip.style("display", 'block');

                    clearTimeout(vm.moveHandler);
                    vm.moveHandler = setTimeout(() => {
                        vm.handleChangeFocus(mousePosX, false);
                    });
                } else {
                    vm.focus.style("display", 'none');
                    vm.tooltip.style("display", 'none');
                }
            },
            createContent() {
                let vm = this;
                let series = vm.privateOptions.series;
                for (let i = 0; i < series.length; i++) {
                    if (
                        series[i].isColorGradient &&
                        series[i].color instanceof Object) {

                        if (!vm.colorScales[i]) {
                            vm.$set(vm.colorScales, i, d3.scaleLinear()
                                .domain(_.map(series[i].color, 'offset'))
                                .range(_.map(series[i].color, 'color'))
                                .interpolate(d3.interpolateHcl));
                        }

                        let colorScaleDomain = vm.colorScales[i].domain();
                        vm.svg.append("defs")
                            .append("linearGradient")
                            .attr("id", `${vm._uid}-gradient-${i}`)
                            .attr("gradientUnits", "userSpaceOnUse")
                            .attr("x1", 0).attr("y1", vm.yScale(colorScaleDomain[0]))
                            .attr("x2", 0).attr("y2", vm.yScale(colorScaleDomain[colorScaleDomain.length - 1]))
                            .selectAll("stop")
                            .data(vm.colorScales[i].range())
                            .enter().append("stop")
                            .attr("offset", function (d, ix) {
                                return ix / (vm.colorScales[i].range().length - 1);
                            })
                            .attr("stop-color", function (d) {
                                return d;
                            });
                    }
                    if (series[i].isArea) {
                        let area = function (init = false) {
                            return d3.area()
                                .x(function (d) {
                                    return vm.xScale(d[vm.privateOptions.xAxis.key]);
                                })
                                .y0(vm.innerHeight)
                                .y1(init ? 0 : function (d) {
                                    return vm.yScale(d[series[i].key]);
                                });
                        };
                        vm.svg.append("path")
                            .data([vm.privateSource])
                            .attr('fill', series[i].isColorGradient ? `url(#${vm._uid}-gradient-${i})` : series[i].color)
                            .attr('fill-opacity', 0.5)
                            .attr("d", area(true))
                            .transition()
                            .duration(1000)
                            .ease(d3.easeLinear)
                            .attr("d", area())
                    } else {
                        const line = d3.line()
                            .x(d => vm.xScale(d[vm.privateOptions.xAxis.key]))
                            .y(d => vm.yScale(d[series[i].key]))
                            .curve(d3.curveMonotoneX);

                        let path = vm.svg.append("path")
                            .data([vm.privateSource])
                            .attr("d", line)
                            .attr("fill", "none")
                            .attr("stroke-width", 2)
                            .attr("stroke", series[i].isColorGradient ? `url(#${vm._uid}-gradient-${i})` : series[i].color);

                        let totalLength = path.node().getTotalLength();
                        path.attr("stroke-dasharray", totalLength + " " + totalLength)
                            .attr("stroke-dashoffset", totalLength)
                            .transition()
                            .duration(1000)
                            .ease(d3.easeLinear)
                            .attr("stroke-dashoffset", 0)
                    }

                    // path

                    series[i].isShowMaxLabel && vm.createMaxLabel(i);
                    series[i].isShowAvgLine && vm.createAvgLine(i);
                }
            },
            createMaxLabel(seriesIndex) {
                let vm = this;
                let series = vm.privateOptions.series[seriesIndex];
                let maxItem = _.maxBy(vm.privateSource, series.key);
                let tipMax = vm.svg.append("g")
                    .attr("class", "label-max")
                    .attr("transform", `translate(${vm.xScale(maxItem[vm.privateOptions.xAxis.key])},${vm.yScale(maxItem[series.key])})`)
                    .attr("fill", series.isColorGradient ? vm.colorScales[seriesIndex](maxItem[series.key]) : series.color);

                tipMax.append("rect")
                    .attr("transform", `translate(-15,-${vm.innerHeight / 4 + 5})`)
                    .attr("width", 30)
                    .attr("height", vm.innerHeight / 4)
                    .attr("rx", vm.innerHeight / 4 / 2)
                    .attr("ry", vm.innerHeight / 4 / 2);

                tipMax.append("path")
                    .attr("d", d3.symbol()
                        .type(d3.symbolTriangle)
                        .size(15))
                    .attr('transform', 'rotate(180), translate(0,4)');

                tipMax.append("text")
                    .attr("transform", `translate(0,-${vm.innerHeight / 4 - 2})`)
                    .attr("fill", "#fff")
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "central")
                    .attr('font-size', '.7em')
                    .text(maxItem[series.key]);
            },
            createAvgLine(seriesIndex) {
                let vm = this;
                let series = vm.privateOptions.series[seriesIndex];
                const avg = d3.mean(vm.privateSource, d => d[series.key]);
                let gAvgLine = vm.svg.append('g');
                let line = gAvgLine.append('line')
                    .attr("x1", 0)
                    .attr("y1", vm.yScale(avg))
                    .attr("x2", vm.innerWidth)
                    .attr("y2", vm.yScale(avg))
                    .style("stroke", series.isColorGradient ? `url(#${vm._uid}-gradient-${seriesIndex})` : series.color)
                    .style("stroke-width", 1);

                /**
                 * 平均线动画
                 * https://www.visualcinnamon.com/2016/01/animating-dashed-line-d3.html
                 */
                let totalLength = line.node().getTotalLength();
                let dashing = "5,2";
                let dashLength =
                    dashing
                        .split(/[\s,]/)
                        .map(function (a) {
                            return parseFloat(a) || 0
                        })
                        .reduce(function (a, b) {
                            return a + b
                        });
                let dashCount = Math.ceil(totalLength / dashLength);
                let newDashes = new Array(dashCount).join(dashing + " ");
                let dashArray = newDashes + " 0, " + totalLength;

                line.attr("stroke-dasharray", dashArray)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(1000)
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0);

                gAvgLine.append("text")
                    .attr("transform", `translate(${vm.innerWidth + 3},${vm.yScale(avg)})`)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .attr("fill", "#aaa")
                    .attr('font-size', '.8em')
                    .text(avg.toFixed(2));
            },
            createFocus() {
                let vm = this;
                vm.focus = vm.svg.append("g")
                    .attr("class", "focus")
                    .style("display", "none");

                vm.focus.append("line")
                    .attr("class", "hover-line")
                    .attr("stroke", "#ccc")
                    .attr("stroke-width", 2)
                    .attr("pointer-events", 'none')
                    .attr("y1", 0)
                    .attr("y2", vm.innerHeight);
                vm.createTooltip();
                vm.createEventOverlay();
            },
            createTooltip() {
                let vm = this;
                vm.tooltip = vm.container.style("position", "relative")
                    .append('div');

                vm.tooltip.style("position", "absolute")
                    .style('font-size', '.9em')
                    .style('color', '#fff')
                    .style("pointer-events", "none")
                    .style("padding", "5px")
                    .style("background-color", "rgba(50,50,50,.7)")
                    .style("border-radius", '10px')
                    .style("display", 'none');

                vm.$nextTick(() => {
                    vm.tooltip.style('top', function () {
                        let tooltipInitHeight = (vm.privateOptions.series.length + 1) * 25;
                        let topInit = (vm.innerHeight - tooltipInitHeight) / 2;
                        let toolTipY = topInit >= vm.innerHeight - tooltipInitHeight ? vm.innerHeight - tooltipInitHeight : topInit;
                        return `${toolTipY + vm.privateOptions.margin.top}px`
                    })
                });

            },
            createEventOverlay() {
                let vm = this;
                vm.overlay = vm.svg.append("rect")
                    .attr("class", "overlay")
                    .attr("width", vm.innerWidth)
                    .attr("height", vm.innerHeight)
                    .attr("fill", 'none')
                    .attr("pointer-events", 'all')
                    .on("mousemove", function () {
                        let mousePos = d3.mouse(this);
                        vm.handleChangeFocus(mousePos[0]);
                    });
            },
            handleChangeFocus(posX, isPrevent = true) {
                let vm = this;

                let x0 = vm.xScale.invert(posX);
                let i = vm.bisectX(vm.privateSource, x0, 1),
                    d0 = vm.privateSource[i - 1],
                    d1 = vm.privateSource[i];
                if (!d0 || !d1 ||!d0[vm.privateOptions.xAxis.key] || !d1[vm.privateOptions.xAxis.key]) return;
                let d = x0 - d0[vm.privateOptions.xAxis.key] > d1[vm.privateOptions.xAxis.key] - x0 ? d1 : d0;

                vm.focus
                    .attr("transform", `translate(${posX}, 0)`)
                if (vm.privateOptions.tooltip.show) {

                    let tooltipBox = vm.tooltip.node().getBoundingClientRect();

                    vm.tooltip.html('').append('time')
                        .text(vm.$moment(d[vm.privateOptions.xAxis.key]).format("HH:MM:SS"));

                    let series = vm.privateOptions.series;
                    for (let i = 0; i < series.length; i++) {
                        let seriesDiv = vm.tooltip.append('div');
                        seriesDiv.append('div')
                            .style('display', 'inline-block')
                            .style('width', '.9em')
                            .style('height', '.9em')
                            .style('border-radius', '.5em')
                            .style('background-color', series[i].isColorGradient ? vm.colorScales[i](d[series[i].key]) : series[i].color);
                        seriesDiv.append('span')
                            .style("margin-left", "5px")
                            .text(`${vm.privateOptions.yAxis.title}：${d[series[i].key]}`);
                    }

                    vm.tooltip
                        .transition().duration(0)
                        .style('left', function () {
                            let toolTipX = posX >= vm.innerWidth - tooltipBox.width ? posX - tooltipBox.width - 15 : posX + 15;
                            return `${toolTipX + vm.privateOptions.margin.left}px`;
                        });

                }
                if (isPrevent) {
                    vm.$emit("focus-change", d[vm.privateOptions.xAxis.key], i, posX)
                }
            }
        }

    }
</script>

<style scoped>

</style>
