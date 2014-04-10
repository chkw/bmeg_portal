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
                    selCrit.addCriteria(feature, value);
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
 * Setup chartOptions... returns the chartOptions.
 * @param {Object} renderTo
 * @param {Object} seriesName
 * @param {Object} seriesData
 * @param {Object} title
 * @param {Object} chartOptions
 */
function setupChartOptions(renderTo, seriesName, seriesData, title, chartOptions) {

    // renderTo
    chartOptions["chart"]["renderTo"] = renderTo;

    // chart series
    chartOptions["series"][0]["name"] = seriesName;
    chartOptions["series"][0]["data"] = seriesData;

    // title
    chartOptions["title"]["text"] = title;

    return chartOptions;
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

    this.getDivId = function() {
        return this.info["divId"];
    };

    this.setTitle = function(newTitle) {
        this.info["title"] = newTitle;
        return this;
    };

    this.getTitle = function() {
        return this.info["title"];
    };

    this.getFeature = function() {
        return this.info["feature"];
    };

    this.setDivId = function(id) {
        this.info["divId"] = id;
        return this;
    };

    this.setChart = function(chart) {
        this.info["chart"] = chart;
        return this;
    };

    this.updateChart = function(selectedIds, cohortData) {
        var data = cohortData.getPatientCounts(selectedIds, this.getFeature());
        var colorMapping = this.getColorMap();

        // set slice colors in data object
        for (var i = 0; i < data.length; i++) {
            var color = colorMapping[data[i]["name"]];
            data[i]["color"] = color;
        }

        // set new data for chart
        this.info["chart"].series[0].data.length = 0;
        this.info["chart"].series[0].setData(data);

        this.info["chart"].redraw();
        return this;
    };

    this.getChart = function(selectedIds, cohortData) {
        if ((selectedIds == null) || (cohortData == null)) {
            // return this.info["chart"];
        } else {
            // create chart
            var data = cohortData.getPatientCounts(selectedIds, this.getFeature());
            var chartOptions = pieChartOptionsTemplate;

            setupChartOptions(this.getDivId(), this.getFeature(), data, this.getTitle(), chartOptions);
            this.info["chart"] = new Highcharts.Chart(chartOptions);

            // extract the initial color mapping
            this.getColorMap();
        }
        return this.info["chart"];
    };

    this.setColorMap = function(map) {
        this.info["colorMap"] = map;
        return this;
    };

    this.getColorMap = function() {
        if ((this.info["colorMap"] == null) && (this.info["chart"] != null)) {
            // extract and set colorMap
            var mapping = {};
            var chart = this.info["chart"];
            var data = chart.series[0]["options"]["data"];
            var colors = chart["options"]["colors"];

            for (var i = 0; i < data.length; i++) {
                var name = data[i].name;
                var color = colors[(i % colors.length)];
                mapping[name] = color;
            }
            this.info["colorMap"] = mapping;
        }
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

    this.setInfo = function(divId, feature, title) {
        var newInfo = new chartInfo({
            "divId" : divId,
            "feature" : feature
        });
        if (title != null) {
            newInfo.setTitle(title);
        }

        var existingInfo = this.getChartInfo(title);

        if (existingInfo == null) {
            this.deck.push(newInfo);
        } else {
            existingInfo = newInfo;
        }
        return this;
    };

    this.createCharts = function(selectedIds, cohortData) {
        for (var i = 0; i < this.getSize(); i++) {
            var chartInfo = this.deck[i];
            chartInfo.getChart(selectedIds, cohortData);
        }
    };

    this.updateCharts = function(selectedIds, cohortData) {
        for (var i = 0; i < this.getSize(); i++) {
            var chartInfo = this.deck[i];
            chartInfo.updateChart(selectedIds, cohortData);
        }
    };

    this.getSize = function() {
        return this.deck.length;
    };

    this.getVisiblePointsIds = function(chartTitle) {
        // find chart with matching title
        var chartObj = null;
        for (var i = 0; i < this.getSize(); i++) {
            var chartInfo = this.deck[i];
            chartObj = chartInfo.getChart();
            if (chartObj.options.title.text === chartTitle) {
                break;
            }
        }
        if (chartObj == null) {
            return [];
        }

        // find chart's visible points
        var visiblePoints = [];
        var seriesData = chartObj.series[0].data;
        for (var i = 0; i < seriesData.length; i++) {
            var point = seriesData[i];
            if (point.visible) {
                visiblePoints.push(point.name);
            }
        }

        // find the IDs in the visible points
        var ids = [];
        for (var i = 0; i < visiblePoints.length; i++) {
            var featureVal = visiblePoints[i];
            var sc = new selectionCriteria().addCriteria(chartTitle, featureVal);
            var selectedIds = cohort.selectIds(sc);
            ids = ids.concat(selectedIds);
        }

        return eliminateDuplicates(ids);
    };
}