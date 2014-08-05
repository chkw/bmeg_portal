/**
 * chrisw@soe.ucsc.edu
 * December 19, 2013
 * Draw pie charts using highcharts (http://www.highcharts.com/).
 */

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
                // clickable 'move to top' text
                this.renderer.text("move to top", 3, 11).attr({
                    "class" : "moveToTopText",
                    "cursor" : "pointer"
                }).on("click", function() {
                    var chartDivElement = this.parentNode.parentNode.parentNode;
                    moveChartUp(chartDivElement);
                }).add();

                // clickable testing text
                this.renderer.text("test", 3, 22).attr({
                    "class" : "testText",
                    "cursor" : "pointer"
                }).on("click", function() {
                    var containerDivId = this.parentNode.parentNode.parentNode.parentNode.id;
                    var number = containerDivId.replace(/_container$/, "").match(/\d+$/);
                    number = parseInt(number, 10);

                    var title = chartDeck.getDeck()[number].getChart().options.title.text;

                    var unfilteredIds = cohort.selectIds(selCrit);

                    var ids = chartDeck.getVisiblePointsIds(title, unfilteredIds);
                    console.log("The", ids.length, "IDs from the visible pie slices from", title, "are", ids);

                    var names = [];
                    for (var i = 0; i < ids.length; i++) {
                        var id = ids[i];
                        var name = cohort.getPatientVal(id, 'name');
                        names.push(name);
                    }
                    names = eliminateDuplicates(names);
                    console.log("The", names.length, "names from the visible pie slices from", title, "are", names);
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
        selCrit.removeCriteria(feature, value);
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
    for (var i = 0; i < criteria.length; i++) {
        var feature = criteria[i]["feature"];
        var value = criteria[i]["value"];
        createCrumbButton(feature, value).appendTo(e);
    }
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
    var selectedIds = cohort.selectIds(selCrit);

    chartDeck.updateCharts(selectedIds, cohort);

    updateChartCrumbs(selCrit);
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
function initializeCharts(chartFeatures) {

    // build up deck of chart info
    // var chartFeatures = ["tcga_attr:her2_fish_status", "tcga_attr:tumor_status", "tcga_attr:race", "tcga_attr:micromet_detection_by_ihc", "gender", "mutation:TP53"];

    for (var i = 0; i < chartFeatures.length; i++) {
        var divId = "chart" + i;
        var feature = chartFeatures[i];
        createChartDiv(divId);
        chartDeck.setInfo(divId, feature, feature);
    }

    // draw charts
    var selectedIds = cohort.selectIds(selCrit);
    chartDeck.createCharts(selectedIds, cohort);

    // update crumbs
    updateChartCrumbs(selCrit);
}

var chartDeck = new chartDeck();

var selCrit = new selectionCriteria();
var cohort = null;

function getDatatypeData(url) {
    var response = getResponse(datatypeUrl);
    if (response == null) {
        return new Object();
    }
    var parsedResponse = parseJson(response);
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

function getSelectedFeatures() {
    var selectElement = document.forms.chartForm.selectFeatures;
    var selectedFeatures = [];
    for (var i = 0; i < selectElement.length; i++) {
        var optionElement = selectElement[i];
        if (optionElement.selected) {
            selectedFeatures.push(optionElement["value"]);
        }
    }
    return selectedFeatures;
}

function getSpecifiedGene() {
    var geneName = document.forms.chartForm.mutationGeneTextBox.value;
    return geneName;
}

function setupControls(features, selectedFeatures) {
    var featuresForOptions = features.slice(0);

    var selectTag = document.getElementsByClassName("selectFeatures")[0];

    // make sure selected features appear in the select box
    if (selectedFeatures != null) {
        for (var i = 0; i < selectedFeatures.length; i++) {
            var selectedFeature = selectedFeatures[i];
            if (featuresForOptions.indexOf(selectedFeature) == -1) {
                featuresForOptions.push(selectedFeature);
            }
        }
    }

    // add options
    for (var i = 0; i < featuresForOptions.length; i++) {
        var feature = featuresForOptions[i];
        var optionTag = document.createElement("option");
        optionTag["value"] = feature;
        optionTag.innerHTML = feature.replace(/_/g, " ");
        if ((selectedFeatures != null) && (selectedFeatures.indexOf(feature) >= 0)) {
            optionTag["defaultSelected"] = true;
        }
        selectTag.appendChild(optionTag);
    }

    // options for select.js
    $(".selectFeatures").chosen({
        "search_contains" : true
    });

    var buttonElement = document.getElementById("selectFeaturesButton");
    buttonElement.onclick = function() {
        var selectedFeatures = getSelectedFeatures();
        // do something with the selected features
        loadNewSettings({
            "selectedFeatures" : selectedFeatures
        });
    };

    buttonElement = document.getElementById("mutationGeneButton");
    buttonElement.onclick = function() {
        var selectedFeatures = getSelectedFeatures();
        var geneName = getSpecifiedGene();
        selectedFeatures.push("mutation:" + geneName);
        // do something with gene name
        console.log("gene->", geneName);
        loadNewSettings({
            "selectedFeatures" : selectedFeatures
        });
    };
}

function getOtherData(cohortData, selectedFeatures) {
    var mutationList = [];
    for (var i = 0; i < selectedFeatures.length; i++) {
        var feature = selectedFeatures[i];
        if (feature.indexOf("mutation:") == 0) {
            mutationList.push(feature.replace(/^mutation:/, ""));
        }
    }

    // get the mutation data for cohort
    if (mutationList.length > 0) {
        cohortData.addMutationData(queryMutationStatus(mutationList));
    }
}

// TODO onload
window.onload = function() {
    var queryObject = getQueryObj();
    if ("query" in queryObject) {
    } else {
        queryObject["query"] = "[]";
    }
    queryObject = parseJson(queryObject["query"]);
    var selectedFeatures = ("selectedFeatures" in queryObject) ? queryObject["selectedFeatures"] : [];

    if (selectedFeatures.length == 0) {
        selectedFeatures.push('diseaseCode');
    }

    //var p = getAllPatients();
    //cohort = new cohortData(p);

    cohort = new cohortData([]);

    //cohort.addGenderData(queryGender());
    cohort.addDiseaseCodeData(queryDiseaseCode());

    // cohort.addMutationData(queryMutationStatus(["TP53"]));

    if (selectedFeatures != null) {
        getOtherData(cohort, selectedFeatures);
    }

    var features = cohort.getAllFeatures();

    setupControls(features, selectedFeatures);

    selCrit.clearCriteria();

    initializeCharts(selectedFeatures);
};
