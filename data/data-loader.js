class DataLoader {

    constructor() {
        this.selectedYear = '2018';
        this.loadedData = [];

        this.scatterChart = new ScatterChart();
        this.wordCloudPlot = new WordCloudPlot();
        this.boxPlot = new BoxPlot();
        this.groupedBarChart = new GroupedBarChart();
        this.pieChart = new PieChart();
    }


    getSelectedYear() {
        this.selectedYear = Utils.getSelectedYear();
        switch (this.selectedYear) {
            case '2017':
                updateColumnNames(COLUMN_NAMES_2017);
                break;
            case '2018':
                updateColumnNames(COLUMN_NAMES_2018);
                break;
            case '2019':
                updateColumnNames(COLUMN_NAMES_2019);
                break;
        }
        document.getElementById('yearSelect').value = this.selectedYear;
    }

    loadData() {
        if (this.selectedYear === '2019') {
            return d3.tsv("https://docs.google.com/spreadsheets/d/e/2PACX-1vSGHnalp2dv9zlEz4BqirA0-VYXSK5HY0tddIjw0Rm2lhx9Dw0Kt0xVkJUJFvcmi9Xev6yL1D4N4nhv/pub?output=tsv")
                .then((data) => {
                    this.loadedData = this.processChartsData(data);
                    this.updateChartsData(this.loadedData);
                    return this.loadedData;
                });
        } else {
            return d3.csv(`data/salaries-responses-${this.selectedYear}.csv`)
                .then((data) => {
                    this.loadedData = this.processChartsData(data);
                    this.updateChartsData(this.loadedData);
                    return this.loadedData;
                });
        }
    }

    filterData(selectedFilters) {
        const filteredData = this.filterChartData(this.loadedData, selectedFilters);
        this.updateChartsData(filteredData);
    }

    updateChartsData(data) {
        this.groupedBarChart.updateData(data.slice());
        this.pieChart.updateData(data.slice());
        this.scatterChart.updateData(data.slice());
        this.boxPlot.updateData(data.slice());
        this.wordCloudPlot.updateData(data.slice());
    }

    filterChartData(data, selectedFilters) {
        selectedFilters.forEach(filter => {
            switch (filter.type) {
                case FILTER_TYPES.CHECKBOX:
                    data = data.filter(d => filter.values.indexOf(d[DataProperties[filter.dataKey]]) !== -1);
                    break;
                case FILTER_TYPES.NUMBER_RANGE:
                    data = data.filter(d => parseFloat(d[DataProperties[filter.dataKey]]) >= filter.values.from && parseFloat(d[DataProperties[filter.dataKey]]) <= filter.values.to);
                    break;
                default:
                    break;
            }
        });
        return data;
    }

    processChartsData(data) {
        data.forEach(d => {
            d[DataProperties.SEX] = d[DataProperties.SEX] === 'M' ? 'Male' : 'Female';
            d[DataProperties.COMPANY_SIZE] = d[DataProperties.COMPANY_SIZE] === 'До 10 человек' ? '10 or less' : d[DataProperties.COMPANY_SIZE];
            d[DataProperties.SALARY_RAISE] = d[DataProperties.CURRENT_SALARY] >= 0 && d[DataProperties.PREVIOUS_SALARY] >= 0
                ? d[DataProperties.CURRENT_SALARY] - d[DataProperties.PREVIOUS_SALARY]
                : 0;
        });
        return data;
    }
}



