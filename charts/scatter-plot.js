function scatterPlotD3() {

    let initialConfiguration = {
        width: 1000,
        height: 600,
        data: [],
        xAxisProperty: DataProperties.TOTAL_EXPERIENCE,
        yAxisProperty: DataProperties.CURRENT_SALARY,
        trellisingProperty: DataProperties.SEX,
        xAxisLabel: 'Total experience (Years)',
        yAxisLabel: 'Salary (EUR)',
        colorScale: d3.scaleOrdinal(d3.schemeSet3),
        id: '',
        tooltipFormatter: Utils.getScatterPlotTooltipFormatter()
    };

    let width = initialConfiguration.width,
        height = initialConfiguration.height,
        data = initialConfiguration.data,
        xAxisLabel = initialConfiguration.xAxisLabel,
        yAxisLabel = initialConfiguration.yAxisLabel,
        xAxisProperty = initialConfiguration.xAxisProperty,
        yAxisProperty = initialConfiguration.yAxisProperty,
        trellisingProperty = initialConfiguration.trellisingProperty,
        colorScale = initialConfiguration.colorScale,
        tooltipFormatter = initialConfiguration.tooltipFormatter,
        id = initialConfiguration.id;
    let updateData = null;

    function chart(selection) {
        selection.each(function () {
            data = data.filter(d => parseInt(d[yAxisProperty]) > 0 && parseInt(d[xAxisProperty]) > 0);
            let yAxisValues = data.map(d => parseInt(d[yAxisProperty]));
            let xAxisValues = data.map(d => parseInt(d[xAxisProperty]));

            const xScale = d3.scaleLinear()
                .domain([
                    d3.min([0, d3.min(xAxisValues)]),
                    d3.max([0, d3.max(xAxisValues)])
                ]).range([margin.left, width - margin.right]);

            const yScaleDomain = yAxisValues.length === 1 ? [yAxisValues[0] * 0.95, yAxisValues[0] * 1.05] : [d3.min(yAxisValues), d3.max(yAxisValues)];
            const yScale = d3.scaleLinear()
                .domain(yScaleDomain)
                .range([height - margin.bottom, margin.top]);

            const svg = selection.append('svg')
                .attr('height', height)
                .attr('width', width)
                .attr("id", `${id}_svg`)
                .append("g");

            //Clippath in order to prevent points from being visible outside of chart area
            //https://developer.mozilla.org/ru/docs/Web/CSS/clip-path
            svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.top - margin.bottom)
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const xAxis = d3.axisBottom(xScale)
                .tickSize(-height + margin.top + margin.bottom)
                .tickSizeOuter(0);

            const gXAxis = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0,${(height - margin.top)})`)
                .call(xAxis);

            Utils.applyAxisStyle(gXAxis);

            const yAxis = d3.axisLeft(yScale)
                .tickFormat((d) => `EUR ${d / 1000}K`)
                .tickSize(-width + margin.left + margin.right)
                .tickSizeOuter(0);

            const gYAxis = svg.append("g")
                .attr("class", "y axis")
                .attr("transform", `translate(${margin.left},0)`)
                .call(yAxis);

            Utils.applyAxisStyle(gYAxis);

            Utils.appendXAxisTitle(gXAxis, width - margin.right, -12, xAxisLabel);
            Utils.appendYAxisTitle(gYAxis, -50, 5, yAxisLabel);
            Utils.appendTitle(svg, width / 2, margin.top / 2, `${yAxisLabel} vs ${xAxisLabel}`);
            Utils.appendSaveButtons(d3.select(`#${id}`), selection, 'scatter_plot');

            //Zoom setup
            const zoom = d3.zoom()
                .scaleExtent([1 / 2, 7])
                .extent([[0, 0], [width, height]])
                .filter(function () {
                    return d3.event.type === 'touchstart'
                        ? false : d3.event.type === 'wheel'
                            ? d3.event.ctrlKey : true;
                })
                .on("zoom", zoomed);

            function zoomed() {
                let newXScale = d3.event.transform.rescaleX(xScale);
                let newYScale = d3.event.transform.rescaleY(yScale);
                gXAxis.call(xAxis.scale(newXScale));
                gYAxis.call(yAxis.scale(newYScale));

                Utils.applyAxisStyle(gXAxis);
                Utils.applyAxisStyle(gYAxis);

                circlesG.selectAll('circle').data(data)
                    .attr('cx', d => newXScale(parseInt(d[xAxisProperty])))
                    .attr('cy', d => newYScale(parseInt(d[yAxisProperty])));
            }

            svg.append("rect")
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.top - margin.bottom)
                .style("fill", "none")
                .style("pointer-events", "all")
                .attr('transform', `translate(${margin.left},${margin.top})`)
                .call(zoom);

            const tooltip = d3.tip()
                .attr("class", "d3-tip")
                .offset([-8, 0])
                .html(tooltipFormatter);

            svg.call(tooltip);

            const circlesG = svg.append("g")
                .attr("clip-path", "url(#clip)");

            circlesG.selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', d => xScale(parseInt(d[xAxisProperty])))
                .attr('cy', d => yScale(parseInt(d[yAxisProperty])))
                .attr('r', '5')
                .attr('stroke', 'grey')
                .attr('stroke-width', 1)
                .attr('fill', d => colorScale(d[trellisingProperty]))
                .on('mouseover', (d) => {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('r', 10)
                        .attr('stroke-width', 3);
                    tooltip.show(d);
                })
                .on('mouseout', () => {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('r', 5)
                        .attr('stroke-width', 1);
                    tooltip.hide();
                });

            const scatterPlotLegend = stackedLegendD3()
                .colorScale(colorScale)
                .data(colorScale.domain());

            svg.append("g")
                .attr("transform", `translate(${width - 120}, 0)`)
                .call(scatterPlotLegend);

            updateData = function () {
                data = data.filter(d => parseInt(d[yAxisProperty]) > 0 && parseInt(d[xAxisProperty]) > 0);
                yAxisValues = data.map(d => parseInt(d[yAxisProperty]));
                xAxisValues = data.map(d => parseInt(d[xAxisProperty]));

                xScale.domain([
                    d3.min([0, d3.min(xAxisValues)]),
                    d3.max([0, d3.max(xAxisValues)])]);

                xAxis.scale(xScale);

                const yScaleDomain = yAxisValues.length === 1 ? [yAxisValues[0] * 0.95, yAxisValues[0] * 1.05] : [d3.min(yAxisValues), d3.max(yAxisValues)];
                yScale.domain(yScaleDomain);

                yAxis.scale(yScale);

                const t = d3.transition()
                    .duration(750);

                gXAxis.transition(t)
                    .call(xAxis);

                gYAxis.transition(t)
                    .call(yAxis);

                Utils.applyAxisStyle(gXAxis);
                Utils.applyAxisStyle(gYAxis);

                const updatedPoints = circlesG.selectAll('circle').data(data);

                updatedPoints
                    .enter()
                    .append('circle')
                    .attr('cx', d => xScale(parseInt(d[xAxisProperty])))
                    .attr('cy', d => yScale(parseInt(d[yAxisProperty])))
                    .attr('r', '5')
                    .attr('stroke', 'grey')
                    .attr('stroke-width', 1)
                    .attr('fill', d => colorScale(d[trellisingProperty]))
                    .on('mouseover', function (d) {
                        d3.select(this)
                            .transition()
                            .duration(100)
                            .attr('r', 10)
                            .attr('stroke-width', 3);
                        tooltip.show(d);
                    })
                    .on('mouseout', function () {
                        d3.select(this)
                            .transition()
                            .duration(100)
                            .attr('r', 5)
                            .attr('stroke-width', 1);
                        tooltip.hide();
                    });

                updatedPoints
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(750)
                    .attr('cx', d => xScale(parseInt(d[xAxisProperty])))
                    .attr('cy', d => yScale(parseInt(d[yAxisProperty])))
                    .attr('fill', d => colorScale(d[trellisingProperty]));

                updatedPoints.exit()
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(100)
                    .remove();

                // svg.select('.title').text(`${yAxisLabel} vs ${xAxisLabel}`);
                svg.select('.x.axis.label').text(xAxisLabel);
                svg.select('.y.axis.label').text(yAxisLabel);
                // Utils.saveSvg(selection, 'scatter');
            };
        })
    }

    chart.id = function (value) {
        if (!arguments.length) return id;
        id = value;
        return chart;
    };

    chart.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.xAxisLabel = function (value) {
        if (!arguments.length) return xAxisLabel;
        xAxisLabel = value;
        return chart;
    };

    chart.yAxisLabel = function (value) {
        if (!arguments.length) return yAxisLabel;
        yAxisLabel = value;
        return chart;
    };

    chart.xAxisProperty = function (value) {
        if (!arguments.length) return xAxisProperty;
        xAxisProperty = value;
        return chart;
    };

    chart.yAxisProperty = function (value) {
        if (!arguments.length) return yAxisProperty;
        yAxisProperty = value;
        return chart;
    };

    chart.trellisingProperty = function (value) {
        if (!arguments.length) return trellisingProperty;
        trellisingProperty = value;
        return chart;
    };

    chart.colorScale = function (value) {
        if (!arguments.length) return colorScale;
        colorScale = value;
        return chart;
    };

    chart.tooltipFormatter = function (value) {
        if (!arguments.length) {
            return tooltipFormatter
        } else {
            if (value == null) {
                tooltipFormatter = initialConfiguration.tooltipFormatter;
            } else {
                tooltipFormatter = value;
            }
            return chart;
        }
    };

    chart.data = function (value) {
        if (!arguments.length) return data;
        data = value;
        if (typeof updateData === 'function') updateData();
        return chart;
    };

    return chart;
}
