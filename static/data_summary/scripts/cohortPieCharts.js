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

    redrawNewData(studySiteChart, cohort.getPatientCounts(selectedIds, 'tcga_attr:her2_fish_status'));
    redrawNewData(biopsySiteChart, cohort.getPatientCounts(selectedIds, 'tcga_attr:tumor_status'));
    redrawNewData(subsequentDrugsChart, cohort.getPatientCounts(selectedIds, 'tcga_attr:race'));
    redrawNewData(treatmentDetailsChart, cohort.getPatientCounts(selectedIds, 'gender'));
    redrawNewData(ctcChart, cohort.getPatientCounts(selectedIds, 'mutation:TP53'));
    // redrawNewData(acghChart, cohort.getPatientCounts(selectedIds, 'acgh'));
    // redrawNewData(rnaseqChart, cohort.getPatientCounts(selectedIds, 'rnaseq'));
    // redrawNewData(fishChart, cohort.getPatientCounts(selectedIds, 'ar_fish'));
    // redrawNewData(ptenIhcChart, cohort.getPatientCounts(selectedIds, 'pten_ihc'));
    // redrawNewData(mutationPanelChart, cohort.getPatientCounts(selectedIds, 'mutation_panel'));
    // redrawNewData(rnaMutationChart, cohort.getPatientCounts(selectedIds, 'rna-mutation call'));

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
 * initial drawing of charts
 */
function initializeCharts() {
    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    studySiteChart = initializeChart("chart1", "tcga_attr:her2_fish_status", 'tcga_attr:her2_fish_status', selectedIds);
    biopsySiteChart = initializeChart("chart2", "tcga_attr:tumor_status", 'tcga_attr:tumor_status', selectedIds);
    subsequentDrugsChart = initializeChart("chart3", "tcga_attr:race", 'tcga_attr:race', selectedIds);
    //
    treatmentDetailsChart = initializeChart("chart4", "gender", 'gender', selectedIds);
    ctcChart = initializeChart("chart5", "mutation:TP53", 'mutation:TP53', selectedIds);
    // acghChart = initializeChart("chart6", "aCGH Data", 'acgh', selectedIds);
    //
    // rnaseqChart = initializeChart("chart7", "RNAseq Data", 'rnaseq', selectedIds);
    // fishChart = initializeChart("chart8", "FISH Data", 'ar_fish', selectedIds);
    // ptenIhcChart = initializeChart("chart9", "PTEN_IHC Data", 'pten_ihc', selectedIds);
    //
    // mutationPanelChart = initializeChart("chart10", "Mutation Panel Data", 'mutation_panel', selectedIds);
    // rnaMutationChart = initializeChart("chart11", "RNA-mutation call Data", 'rna-mutation call', selectedIds);

    updateChartCrumbs(selectionCriteria);
}

var studySiteChart = null;
var biopsySiteChart = null;
var subsequentDrugsChart = null;
var treatmentDetailsChart = null;
var ctcChart = null;
var acghChart = null;
var rnaseqChart = null;
var fishChart = null;
var ptenIhcChart = null;
var mutationPanelChart = null;
// var rnaMutationChart = null;

var sliceColorMapping = {};

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

// TODO onload
window.onload = function() {

    var p = getAllPatients();
    // console.log(prettyJson(p));

    cohort = new cohortData(p);

    // var features = cohort.getAllFeatures();
    // console.log(prettyJson(features));

    // var a = queryGender(function(genderData) {
    // cohort.addGenderData(genderData);
    // var c = cohort.getPatientCounts(cohort.getAllPatientIds(), 'gender');
    // console.log(c);
    // });

    cohort.addGenderData(queryGender());

    cohort.addMutationData(queryMutationStatus("TP53"));

    var c = cohort.getPatientCounts(cohort.getAllPatientIds(), 'mutation:TP53');
    console.log(c);

    selectionCriteria.clearCriteria();

    initializeCharts();
};
