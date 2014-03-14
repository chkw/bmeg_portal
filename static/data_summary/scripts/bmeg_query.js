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
function queryGender(callbackFunction) {
    var script = "t=new Table();g.V('type','tcga_attr:Gender').as('genderV').in('tcga_attr:gender').has('type','tcga_attr:Patient').name.as('patientVName').table(t).cap()";
    queryBmeg_async(script, function(response) {
        var results = getBmegResultsArray(response);
        var genderPatients = {};
        for (var i = 0; i < results[0].length; i++) {
            var row = results[0][i];
            var name = row['patientVName'];
            var gender = row['genderV']['name'];
            if ( gender in genderPatients) {
            } else {
                genderPatients[gender] = [];
            }
            genderPatients[gender].push(name);
        }
        if (callbackFunction != null) {
            callbackFunction(genderPatients);
        } else {

            console.log(genderPatients);
        }
    });
}
