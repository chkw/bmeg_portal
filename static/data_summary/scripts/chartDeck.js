/**
 * chrisw@soe.ucsc.edu
 * March 18, 2014
 */

/**
 * GLOBALS
 */

var chartOptions = {
    renderTo : null,
    plotBackgroundColor : null,
    plotBorderWidth : null,
    plotShadow : false
};

var plotOptions = {
    pie : {
        allowPointSelect : true,
        cursor : 'pointer',
        dataLabels : {
            enabled : true,
            color : 'black',
            // connectorColor : 'gray',
            distance : 5,
            // format : '<b>{point.name}</b>: {point.y}',
            format : '{point.y}'
        },
        point : {
            events : {
                // click pie slice to add sample selection criteria & redraw charts
                click : function() {
                    var feature = this.series.name;
                    var value = this.name;
                    selectionCriteria.addCriteria(feature, value);
                    redrawCharts();
                }
            }
        }
    }
};

var tooltipOptions = {
    pointFormat : '{point.y} samples is <b>{point.percentage:.1f} %</b>'
};

var legendOptions = {
    "enabled" : true,
    "floating" : false,
    "itemWidth" : null,
    "layout" : "horizontal",
    "align" : "center"
};

var pieChartOptionsTemplate = {
    chart : chartOptions,
    legend : legendOptions,
    title : {
        text : ''
    },
    credits : {
        enabled : false
    },
    tooltip : tooltipOptions,
    plotOptions : plotOptions,
    series : [{
        type : 'pie',
        name : null,
        data : null,
        showInLegend : true
    }],
};

/**
 * Set the renderTo attribute of the chart.
 * @param {Object} elementId
 * @param {Object} chartOptions
 */
function setChartRenderTo(elementId, chartOptions) {
    chartOptions["chart"]["renderTo"] = elementId;
}

/**
 * Set the chart series.
 * @param {Object} seriesName
 * @param {Object} seriesData
 * @param {Object} chart
 */
function setChartSeries(seriesName, seriesData, chartOptions) {
    chartOptions["series"][0]["name"] = seriesName;
    chartOptions["series"][0]["data"] = seriesData;
}

/**
 * Set the chart title.
 * @param {Object} title
 * @param {Object} chartOptions
 */
function setChartTitle(title, chartOptions) {
    chartOptions["title"]["text"] = title;
}

/**
 * Setup chartOptions... returns the chartOptions.
 * @param {Object} renderTo
 * @param {Object} seriesName
 * @param {Object} seriesData
 * @param {Object} title
 * @param {Object} chartOptions
 */
function setupChartOptions(renderTo, seriesName, seriesData, title, chartOptions) {
    setChartRenderTo(renderTo, chartOptions);
    setChartSeries(seriesName, seriesData, chartOptions);
    setChartTitle(title, chartOptions);
    return chartOptions;
}

/**
 * Set new series data directly on the chart instead of via chartOptions.
 * @param {Object} chartObject
 * @param {Object} chartData
 */
function setNewChartData(chartObject, chartData) {
    chartObject.series[0].data.length = 0;
    chartObject.series[0].setData(chartData);
}

/**
 * Set the new chart data and redraw.
 */
function redrawNewData(chart, data) {

    // recover slice color mapping for chart
    var title = chart["options"]["title"]["text"];
    if ( title in sliceColorMapping) {
    } else {
        sliceColorMapping[title] = extractColorMapping(chart);
    }

    var colorMapping = sliceColorMapping[title];

    // set slice colors in data object
    for (var i = 0; i < data.length; i++) {
        var color = colorMapping[data[i]["name"]];
        data[i]["color"] = color;
    }

    // set new data for chart
    setNewChartData(chart, data);
    chart.redraw();
}

/**
 * Get the color mapping from a chart.
 */
function extractColorMapping(chart) {
    var mapping = {};
    var data = chart.series[0]["options"]["data"];
    var colors = chart["options"]["colors"];

    for (var i = 0; i < data.length; i++) {
        var name = data[i].name;
        var color = colors[(i % colors.length)];
        mapping[name] = color;
    }
    return mapping;
}

// TODO chartInfo

/**
 *
 * @param {Object} data
 */
function chartInfo(data) {
    this.info = data;

    this.getInfo = function() {
        return this.info;
    };

    this.getTitle = function() {
        return this.info["title"];
    };

    this.getDivId = function() {
        return this.info["divId"];
    };

    this.setDivId = function(id) {
        this.info["divId"] = id;
    };

    this.getChart = function() {
        return this.info["chart"];
    };

    this.setColorMap = function(map) {
        this.info["colorMap"] = map;
    };

    this.getColorMap = function() {
        return this.info["colorMap"];
    };
}

// TODO chartDeck

/**
 *
 */
function chartDeck() {
    this.deck = new Array();

    this.getDeck = function() {
        return this.deck;
    };

    this.getChartInfo = function(title) {
        for (var i = 0; i < this.deck.length; i++) {
            var info = this.deck[i];
            if (info.getTitle() === title) {
                return info;
            }
        }
        return null;
    };

    this.setInfo = function(divId, title, feature, chart) {
        var newInfo = new chartInfo({
            "divId" : divId,
            "title" : title,
            "feature" : feature,
            "chart" : chart
        });
        var savedInfo = this.getChartInfo(title);

        if (existingInfo == null) {
            this.deck.push(newInfo);
        } else {
            savedInfo = newInfo;
        }
        return this;
    };

    this.getSize = function() {
        return this.deck.length;
    };
}