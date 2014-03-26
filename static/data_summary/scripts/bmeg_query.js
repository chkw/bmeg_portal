/**
 * chrisw@soe.ucsc.edu
 * March 7, 2014
 * bmeg_query.js contains methods to make queries to BMEG and parse the response.
 */

var bmeg_service_host = "http://localhost:9886";

/**
 * Synchronous bmeg query.
 */
function queryBmeg_sync(script) {
    var query_uri_base = bmeg_service_host + "/query?script=";
    // var url = query_uri_base + script;
    var url = "/static/data_summary/data/patients.json";

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
 * Read this: http://blog.getify.com/native-javascript-sync-async/
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
 * @param {Object} script
 * @param {Object} successCallback
 */
function queryBmeg_async(script, successCallback) {
    var query_uri_base = bmeg_service_host + "/query?script=";
    var url = query_uri_base + script;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function(e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (successCallback == null) {
                    logJsonCallback(xhr.responseText);
                } else {
                    successCallback(xhr.responseText);
                }
            } else {
                console.error("error: " + xhr.statusText);
                console.error("url was: " + url);
            }
        }
    };
    xhr.onerror = function(e) {
        console.error("error: " + xhr.statusText);
        console.error("url was: " + url);
    };
    xhr.send(null);
}

/**
 * A callback function to be used as a default.
 * @param {Object} serializedJsonResponse
 */
function logJsonCallback(serializedJsonResponse) {
    var parsedResponse = JSON && JSON.parse(serializedJsonResponse) || $.parseJSON(serializedJsonResponse);
    console.log(prettyJson(parsedResponse));
}

/**
 * Get the BMEG results array, if they exist.
 * @param {Object} serializedJsonResponse
 */
function getBmegResultsArray(serializedJsonResponse) {
    var parsedResponse = JSON && JSON.parse(serializedJsonResponse) || $.parseJSON(serializedJsonResponse);
    if ((parsedResponse["success"] == true) && ("results" in parsedResponse)) {
        return parsedResponse["results"];
    } else {
        return [];
    }
}

/**
 * Synchronously get all patients.
 */
function getAllPatients() {
    var script = "g.V('type','tcga_attr:Patient')";
    var results = getBmegResultsArray(queryBmeg_sync(script));
    return results;
}

/**
 * Get a table of gender counts
 *
 * @param {Object} callbackFunction
 */
function queryGender_async(callbackFunction) {
    var script = "t=new Table();g.V('type','tcga_attr:Gender').as('genderV').in('tcga_attr:gender').has('type','tcga_attr:Patient').id.as('patientVId').table(t).cap()";
    queryBmeg_async(script, function(response) {
        var results = getBmegResultsArray(response);
        var genderPatients = {};
        for (var i = 0; i < results[0].length; i++) {
            var row = results[0][i];
            var id = row['patientVId'];
            var gender = row['genderV']['name'];
            if ( gender in genderPatients) {
            } else {
                genderPatients[gender] = [];
            }
            genderPatients[gender].push(id);
        }
        (callbackFunction != null) ? callbackFunction(genderPatients) : console.log(genderPatients);
    });
}

/**
 * Get a table of gender counts
 */
function queryGender() {
    var script = "t=new Table();g.V('type','tcga_attr:Gender').as('genderV').in('tcga_attr:gender').has('type','tcga_attr:Patient').id.as('patientVId').table(t).cap()";

    var results = getBmegResultsArray(queryBmeg_sync(script));

    var genderPatients = {};
    for (var i = 0; i < results[0].length; i++) {
        var row = results[0][i];
        var id = row['patientVId'];
        var gender = row['genderV']['name'];
        if ( gender in genderPatients) {
        } else {
            genderPatients[gender] = [];
        }
        genderPatients[gender].push(id);
    }
    return genderPatients;
}

/**
 * query: get all patients with mutation in specified hugo
 * @param {Object} hugoId
 */
function queryMutationStatus(hugoIdList) {
    var script = "t=new Table();";
    // script += "g.V('name','hugo:" + hugoId + "')";
    // script += "g.V.has('name',T.in," + JSON.stringify(hugoIdList) + ")";
    // TODO for performance reasons, may be better to use "store" with "g.V('name',name)"
    script += "x=[];";
    for (var i = 0; i < hugoIdList.length; i++) {
        var hugoId = hugoIdList[i];
        script += "g.V('name','hugo:" + hugoId + "').store(x).next();";
    }
    script += "x._()";

    script += ".as('hugo')";
    script += ".in('bmeg:gene')";
    script += ".as('mutation_event')";
    script += ".out('bmeg:effect')";
    script += ".as('effect')";
    script += ".back('mutation_event')";
    script += ".out('bmeg:analysis')";
    script += ".out('bmeg:variant')";
    script += ".in('tcga_attr:analysis')";
    script += ".in('tcga_attr:sample')";
    script += ".has('type','tcga_attr:Patient').id.as('patientVId')";
    script += ".table(t).cap()";

    console.log(script);

    var results = getBmegResultsArray(queryBmeg_sync(script));

    var groups = {};
    for (var i = 0; i < results[0].length; i++) {
        var row = results[0][i];
        var patientVId = row['patientVId'];
        var effect = row['effect']['name'];
        if ( effect in groups) {
        } else {
            groups[effect] = [];
        }
        groups[effect].push(patientVId);
    }

    return {
        "genes" : hugoIdList,
        "calls" : groups
    };
}
