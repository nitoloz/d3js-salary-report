class WordCloudPlot {

    constructor() {
        this.wordCloudChart = wordCloudChartD3()
            .width(Utils.getFullWidthChartContainerDimensions().width)
            .height(Utils.getChartContainerDimensions().height);

        d3.select("#word-cloud-area")
            .call(this.wordCloudChart);
    }

    updateData(data) {
        this.wordCloudChart
            .data(processWordCloudPlotData(data, DataProperties.POSITION));
    }

}