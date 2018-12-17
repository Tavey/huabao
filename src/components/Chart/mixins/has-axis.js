import _ from 'lodash';
import * as d3 from "d3";

export default {
    data() {
        return {
            xScale: null,
            yScale: null,

        }
    },
    computed: {
        gAxis() {
            let axis = this.svg.select('g.axis');
            if (axis.empty()) {
                axis = this.svg.append("g").attr("class", "axis")
            }
            return axis;
        }
    },
    methods: {
        createXAxis() {
            let vm = this;

            let xScale;
            if (vm.privateOptions.xAxis.isDatetime) {
                xScale = d3.scaleTime();
            } else {
                xScale = d3.scaleLinear();
            }

            vm.xScale = xScale
                .domain(d3.extent(vm.privateSource, d => d[vm.privateOptions.xAxis.key]))
                .range([0, vm.innerWidth]);


            //   const xAxis = d3.axisBottom(vm.xScale).tickFormat((d) => {
            //       return vm.$moment(d).format("HH:MM:SS")
            //   });
            const xAxis = d3.axisBottom(vm.xScale).tickFormat(vm.datetimeFormatter);

            // if (vm.privateOptions.xAxis.isDatetime) {
            //     let domain = vm.xScale.domain();
            //     let timeSpan = _.reduceRight(domain, function (span, n) {
            //         if (!span) return n.getTime();
            //         return span - n.getTime();
            //     }, null) / 1000;
            //     let interval = parseInt(timeSpan / Math.floor(this.innerWidth / 80)) / 60;
            //     xAxis.ticks(d3.timeMinute.every(interval));
            // } else {
            //     xAxis.ticks(this.innerWidth / 80);
            // }

            // timezone format
            xAxis.tickFormat(d => {
                return vm.$moment(d).format("HH:mm:ss");
            })


            let gX = vm.gAxis.append("g")
                .attr("class", "x")
                .attr("transform", "translate(0," + vm.innerHeight + ")")
                .call(xAxis);
            gX.selectAll('path,line').attr('stroke', vm.privateOptions.xAxis.color).attr('fill', null);
            gX.selectAll('text').attr('fill', vm.privateOptions.xAxis.color).attr('stroke', null);

        },
        createYAxis() {
            let vm = this;

            let yMin = _.min(vm.minYItems);
            if (vm.privateOptions.yAxis.min != null) {
                yMin = vm.privateOptions.yAxis.min;
            }

            vm.yScale = d3.scaleLinear()
                .domain([yMin, _.max(vm.maxYItems) * 1.1])
                .range([vm.innerHeight, 0]);

            const yAxis = d3.axisLeft(vm.yScale).ticks(vm.innerHeight / 20);

            let gY = vm.gAxis.append("g")
                .attr("class", "y")
                .call(yAxis);

            gY.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -vm.innerHeight / 2)
                .attr('y', -vm.privateOptions.margin.left / 2)
                .attr('dy', '-.5em')
                .attr('font-size', vm.privateOptions.yAxis.titleFontSize)
                .attr("text-anchor", "middle")
                // .attr("alignment-baseline", "middle")
                .text(vm.privateOptions.yAxis.title);

            gY.selectAll('path,line').attr('stroke', vm.privateOptions.yAxis.color).attr('fill', null);
            gY.selectAll('text').attr('fill', vm.privateOptions.yAxis.color).attr('stroke', null);
        }
    }
}
