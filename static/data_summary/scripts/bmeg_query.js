/**
 * chrisw@soe.ucsc.edu
 * March 7, 2014
 * bmeg_query.js contains methods to make queries to BMEG and parse the response.
 */

// change this match the configuration
var bmeg_service_host = "";

/**
 * Synchronous bmeg query.
 */
function queryBmeg_sync(queryObject) {
    var serializedQueryObject = JSON.stringify(queryObject);
    var url = bmeg_service_host + "/query?queryObject=" + serializedQueryObject;
    // var url = "/static/data_summary/data/patients.json";

    var response = null;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onload = function(e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                response = xhr.responseText;
            } else {
                console.error("error: " + xhr.statusText);
                console.error("url was: " + url);
            }
        } else {
            console.error("not ready: " + xhr.readyState);
            console.error("url was: " + url);
        }
    };
    xhr.onerror = function(e) {
        console.error("error: " + xhr.statusText);
        console.error("url was: " + url);
    };
    xhr.send(null);

    return response;
}

/**
 * A callback function to be used as a default.
 * @param {Object} serializedJsonResponse
 */
function logJsonCallback(serializedJsonResponse) {
    var parsedResponse = parseJson(serializedJsonResponse);
    console.log(prettyJson(parsedResponse));
}

/**
 * Get the BMEG results array, if they exist.
 * @param {Object} serializedJsonResponse
 */
function getBmegResultsArray(serializedJsonResponse) {
    var parsedResponse = parseJson(serializedJsonResponse);
    if ((parsedResponse["success"] == true) && ("results" in parsedResponse)) {
        return parsedResponse["results"];
    } else {
        return [];
    }
}

function getAllPatients() {
    var queryObject = {
        "method" : "getAllPatients"
    };
    var response = queryBmeg_sync(queryObject);
    return getBmegResultsArray(response);
}

function queryGender() {
    var queryObject = {
        "method" : "queryGender"
    };

    var results = getBmegResultsArray(queryBmeg_sync(queryObject));

    var genderPatients = {};

    if (results.length == 0) {
        return genderPatients;
    }

    for (var i = 0; i < results[0].length; i++) {
        var row = results[0][i];
        var id = row['b'];
        var gender = row['a'];
        if ( gender in genderPatients) {
        } else {
            genderPatients[gender] = [];
        }
        genderPatients[gender].push(id);
    }
    return genderPatients;
}

function queryDiseaseCode() {
    var queryObject = {
        "method" : "queryDiseaseCode"
    };

    var results = getBmegResultsArray(queryBmeg_sync(queryObject));

    var diseasePatients = {};

    if (results.length == 0) {
        return diseasePatients;
    }

    for (var i = 0; i < results[0].length; i++) {
        var row = results[0][i];
        var diseaseCode = row['j'];
        var patientId = row['i'];
        if ( diseaseCode in diseasePatients) {

        } else {
            diseasePatients[diseaseCode] = [];
        }
        diseasePatients[diseaseCode].push(patientId);
    }
    return diseasePatients;
}

function queryMutationStatus(hugoIdList) {
    var queryObject = {
        "method" : "queryMutationStatus",
        "params" : {
            "hugoIdList" : hugoIdList
        }
    };

    var results = getBmegResultsArray(queryBmeg_sync(queryObject));

    var genes = {};

    if (results.length == 0) {
        return genes;
    }

    for (var i = 0; i < results[0].length; i++) {
        var row = results[0][i];
        var patientVId = row['id'];
        var effect = row['effect'];
        var gene = row['hugo'];

        if ( gene in genes) {
            if ( effect in genes[gene]) {
            } else {
                genes[gene][effect] = [];
            }
        } else {
            genes[gene] = {};
            genes[gene][effect] = [];
        }
        genes[gene][effect].push(patientVId);
    }
    return genes;
}
