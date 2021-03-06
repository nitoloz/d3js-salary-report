class RangeFilter extends BaseFilter {
    constructor(areaId, label, dataKey, step = 1, filtersMapKey) {
        super(areaId, label, dataKey, filtersMapKey);
        this.values = {from: null, to: null};
        this.selectedValues = {from: null, to: null};
        this.type = FILTER_TYPES.NUMBER_RANGE;
        this.step = step;
    }

    appendFilter() {
        this.addFilterPlaceholder();
        const filterArea = document.getElementById(this.areaId);

        const that = this;
        const expandCollapseButton = document.getElementById(this.areaId + '-filters-group-toggle');
        expandCollapseButton.onclick = function (event) {
            const icon = document.getElementById(that.areaId + '-filters-group-icon');
            if (icon.className.indexOf('fas fa-minus-square') !== -1) {
                icon.className = icon.className.replace(/\bfas fa-minus-square\b/g, "fas fa-plus-square");
            } else {
                icon.className = icon.className.replace(/\bfas fa-plus-square\b/g, "fas fa-minus-square");
            }
        };

        const resetButton = document.createElement("button");
        resetButton.innerHTML = "Reset filter";
        resetButton.id = that.areaId + '_reset';
        resetButton.className = 'btn btn-outline-secondary btn-sm';
        resetButton.onclick = function (event) {
            that.selectedValues = {from: that.values.from, to: that.values.to};
            document.getElementById(that.areaId + '-slider').noUiSlider.reset();
	        const fromValue = document.getElementById(`${that.areaId}-from`);
	        fromValue.innerText = that.values.from;
	        const toValue = document.getElementById(`${that.areaId}-to`);
	        toValue.innerText = that.values.to;
            document.dispatchEvent(that.event);
        };

        const buttonGroup = document.createElement("div");
        buttonGroup.role = 'group';
        buttonGroup.className = 'btn-group btn-group-justified';
        buttonGroup.appendChild(resetButton);

        const textValues = document.createElement("div");
        textValues.className = 'slider-values-text';
        const fromValue = document.createElement("span");
        fromValue.id = `${that.areaId}-from`;
        fromValue.innerText = that.values.from;
        const toValue = document.createElement("span");
        toValue.id = `${that.areaId}-to`;
        toValue.innerText = that.values.to;
        textValues.appendChild(fromValue);
        textValues.appendChild(toValue);

        const filterGroup = document.createElement("div");
        filterGroup.className = 'collapse show';
        filterGroup.id = this.areaId + '-filters-group';
        filterGroup.appendChild(buttonGroup);
        this.appendSlider(filterGroup, this.values);
        filterGroup.appendChild(textValues);
        filterArea.appendChild(filterGroup);
    }


    appendSlider(filterArea, values) {
        let sliderDiv = document.createElement("div");
        sliderDiv.id = this.areaId + '-slider';
        const that = this;
        noUiSlider.create(sliderDiv, {
            start: [this.values.from, this.values.to],
            connect: true,
            behaviour: 'drag',
            step: that.step,
            range: {
                'min': this.values.from,
                'max': this.values.to
            }
        });
        filterArea.appendChild(sliderDiv);
        let timeout;
        sliderDiv.noUiSlider.on('slide', function (values) {
            if (timeout) {
                clearTimeout(timeout);
            }
            const from = parseInt(values[0]);
            const to = parseInt(values[1]);
            document.getElementById(`${that.areaId}-from`).innerText = from;
            document.getElementById(`${that.areaId}-to`).innerText = to;
            timeout = setTimeout(() => {
                that.selectedValues.from = from;
                that.selectedValues.to = to;
                document.dispatchEvent(that.event);
            }, 500)
        });
    }

    isFilterSelected() {
        return this.values.from !== this.selectedValues.from || this.values.to !== this.selectedValues.to;
    }

    getAppliedValues() {
        return {
            type: FILTER_TYPES.NUMBER_RANGE,
            label: this.label,
            dataKey: this.dataKey,
            values: this.selectedValues,
            filtersMapKey: this.filtersMapKey,
            widgetText: this.getSelectedValuesWidgetText()
        }
    }

    getSelectedValuesWidgetText() {
        return `${this.label} <span class="value">(${this.selectedValues.from} - ${this.selectedValues.to})</span>`;
    }

    initializeFilterValues(values) {
        const convertedValues = values.map(value => parseInt(value));
        this.values = convertedValues && convertedValues.length > 1
            ? {from: d3.min(convertedValues), to: d3.max(convertedValues)}
            : {from: 0, to: 1};
        this.selectedValues = {from: this.values.from, to: this.values.to};
    }

}
