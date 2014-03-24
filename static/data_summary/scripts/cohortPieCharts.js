/**
 * chrisw@soe.ucsc.edu
 * December 19, 2013
 * Draw pie charts using highcharts (http://www.highcharts.com/).
 */

/**
 * Get a pretty JSON.
 */
function prettyJson(object) {
    return JSON.stringify(object, null, '\t');
}

Highcharts.setOptions({
    chart : {
        // backgroundColor : {
        // linearGradient : [0, 0, 500, 500],
        // stops : [[0, 'rgb(255, 255, 255)'], [1, 'rgb(240, 240, 255)']]
        // },
        borderWidth : 2,
        // plotBackgroundColor : 'rgba(255, 255, 255, .9)',
        // plotShadow : true,
        // plotBorderWidth : 1
        events : {

            // use renderer to draw some element to act as a button to promote a chart to the top.
            // http://api.highcharts.com/highcharts#Renderer
            // https://stackoverflow.com/questions/11214481/how-can-i-add-element-with-attributes-to-svg-using-jquery
            load : function() {
                this.renderer.text("move to top", 3, 11).attr({
                    "cursor" : "pointer"
                }).on("click", function() {
                    var chartDivElement = this.parentNode.parentNode.parentNode;
                    moveChartUp(chartDivElement);
                }).add();
            }
        }
    }
});

/**
 * Create a button element to remove a filter from selectionCriteria.
 */
function createCrumbButton(feature, value) {
    var innerHtml = feature + "<br>" + value;
    var buttonElement = $("<button class='crumbButton'>" + innerHtml + "</button>").hover(function() {
        this.innerHTML = "<s>" + innerHtml + "</s>";
    }, function() {
        this.innerHTML = innerHtml;
    }).click(function() {
        selectionCriteria.removeCriteria(feature, value);
        redrawCharts();
    });
    return buttonElement;
}

/**
 * Update the chart crumbs.
 */
function updateChartCrumbs(selectionCriteria) {
    var id = "chartCrumbs";
    var e = document.getElementById(id);
    e.innerHTML = "applied filters: ";
    var criteria = selectionCriteria.getCriteria();
    for (var i in criteria) {
        var feature = criteria[i]["feature"];
        var value = criteria[i]["value"];
        createCrumbButton(feature, value).appendTo(e);
    }
}

/**
 * Assumes the parents are divs.
 */
function swapContainingDivs(nodeA, nodeB) {
    var parentA = nodeA.parentNode;
    var parentB = nodeB.parentNode;
    $("#" + nodeA.id).appendTo(parentB);
    $("#" + nodeB.id).appendTo(parentA);
}

/**
 * Move a chart to the top.  Assumes the chart is in a container div.
 */
function moveChartUp(promotedChartDiv) {
    var nodeList = document.getElementsByClassName("pieChart");
    var bubble = null;
    for (var i = nodeList.length - 1; i >= 0; --i) {
        var node = nodeList[i];
        if (node.parentNode.id == promotedChartDiv.parentNode.id) {
            bubble = node;
            continue;
        }
        if (bubble != null) {
            swapContainingDivs(bubble, node);
        }
    }
}

/**
 * Redraw pie charts using the current selectionCriteria object.
 */
function redrawCharts() {
    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    chartDeck.updateCharts(selectedIds, cohort);

    updateChartCrumbs(selectionCriteria);
}

/**
 * Create a pie chart with the specified parameters.
 */
function initializeChart(containingDivId, title, dataFeature, selectedIds) {
    var data = cohort.getPatientCounts(selectedIds, dataFeature);
    var chartOptions = pieChartOptionsTemplate;

    setupChartOptions(containingDivId, dataFeature, data, title, chartOptions);
    return new Highcharts.Chart(chartOptions);
}

/**
 * Create an unattached div element
 */
function createDivElement(divId, divClass) {
    var divTag = document.createElement("div");
    if (divId != null) {
        divTag.id = divId;
    }
    if (divClass != null) {
        divTag.className = divClass;
    }
    return divTag;
}

/**
 * create inside of <article class="middle">,
 * a div structure that looks like:
 * <div id="chart1_container" class="pieChartContainer">
 * <div id="chart1" class="pieChart"></div>
 * </div>
 */
function createChartDiv(chartId) {
    var parentElement = document.getElementsByClassName("content")[0].getElementsByClassName("middle")[0];
    var containerElement = createDivElement(chartId + "_container", "pieChartContainer");
    containerElement.appendChild(createDivElement(chartId, "pieChart"));
    parentElement.appendChild(containerElement);
}

/**
 * initial drawing of charts
 */
function initializeCharts() {

    // build up deck of chart info
    var chartFeatures = ["tcga_attr:her2_fish_status", "tcga_attr:tumor_status", "tcga_attr:race", "tcga_attr:micromet_detection_by_ihc", "gender", "mutation:TP53"];

    for (var i = 0; i < chartFeatures.length; i++) {
        var divId = "chart" + i;
        var feature = chartFeatures[i];
        createChartDiv(divId);
        chartDeck.setInfo(divId, feature, feature);
    }

    // draw charts
    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());
    chartDeck.createCharts(selectedIds, cohort);

    // update crumbs
    updateChartCrumbs(selectionCriteria);
}

var chartDeck = new chartDeck();

var selectionCriteria = new selectionCriteria();
var cohort = null;

function getDatatypeData(url) {
    var response = getResponse(datatypeUrl);
    if (response == null) {
        return new Object();
    }
    var parsedResponse = JSON && JSON.parse(response) || $.parseJSON(response);
    var contents = parsedResponse["contents"];
    var datatypeData = d3.tsv.parse(contents);
    var datatypesObj = new Object();
    for (var i in datatypeData) {
        var row = datatypeData[i];
        var id = row["Sample"];
        var datatypes = new Array();
        for (var feature in row) {
            var value = row[feature];
            if (feature.trim() != "" && feature.trim() != "id" && feature.trim() != "Sample" && value != null && value.trim() != "") {
                datatypes.push(feature.trim());
            }
        }
        if (datatypes.length >= 1) {
            datatypesObj[id] = new Object();
            datatypesObj[id]["datatypes"] = datatypes;
        }
    }
    return datatypesObj;
}

function setupControls(features, selectedFeatures) {
    var selectTag = document.getElementsByClassName("selectFeatures")[0];

    // add options
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        var optionTag = document.createElement("option");
        optionTag["value"] = feature;
        optionTag.innerHTML = feature.replace(/_/g, " ");
        if ((selectedFeatures != null) && (selectedFeatures.indexOf(feature) >= 0)) {
            optionTag["defaultSelected"] = true;
        }
        selectTag.appendChild(optionTag);
    }

    // options for select.js
    $(".chosen-select").chosen({
        "search_contains" : true
    });

    var buttonElement = document.getElementById("selectFeaturesButton");
    buttonElement.onclick = function() {
        var selectElement = document.forms.chartForm.selectFeatures;
        var selectedFeatures = [];
        for (var i = 0; i < selectElement.length; i++) {
            var optionElement = selectElement[i];
            if (optionElement.selected) {
                selectedFeatures.push(optionElement["value"]);
            }
        }
        // TODO do something with the selected features
        console.log(JSON.stringify(selectedFeatures));
    };
}

/**
 * Get an object with UrlQueryString data.
 */
function getQueryObj() {
    var result = {};
    var keyValuePairs = location.search.slice(1).split('&');

    keyValuePairs.forEach(function(keyValuePair) {
        keyValuePair = keyValuePair.split('=');
        result[keyValuePair[0]] = decodeURIComponent(keyValuePair[1]) || '';
    });

    return result;
}

/**
 * querySettings is an object to be stringified into the query string.
 * @param {Object} querySettings
 */
function loadNewSettings(querySettings) {
    var url = window.location.pathname + "?query=" + JSON.stringify(querySettings);
    window.open(url, "_self");
}

// TODO onload
window.onload = function() {

    var p = getAllPatients();
    // console.log(prettyJson(p));

    cohort = new cohortData(p);

    // var a = queryGender(function(genderData) {
    // cohort.addGenderData(genderData);
    // var c = cohort.getPatientCounts(cohort.getAllPatientIds(), 'gender');
    // console.log(c);
    // });

    cohort.addGenderData(queryGender());

    cohort.addMutationData(queryMutationStatus("TP53"));

    var features = cohort.getAllFeatures();

    var selectedFeatures = ["tcga_attr:race", "tcga_attr:tumor_status"];

    setupControls(features, selectedFeatures);

    // var c = cohort.getPatientCounts(cohort.getAllPatientIds(), 'mutation:TP53');
    // console.log(c);

    selectionCriteria.clearCriteria();

    initializeCharts();
};
