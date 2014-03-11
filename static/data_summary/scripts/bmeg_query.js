/**
 * chrisw@soe.ucsc.edu
 * March 7, 2014
 * bmeg_query.js contains methods to make queries to BMEG and parse the response.
 */

var bmeg_service_host = "http://localhost:9886";

/**
 * Read this: http://blog.getify.com/native-javascript-sync-async/
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
 * @param {Object} script
 * @param {Object} callback
 */
function queryBmeg(script, successCallback) {

    var query_uri_base = bmeg_service_host + "/query?script=";

    var url = query_uri_base + script;
    console.log(url);

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
            }
        }
    };
    xhr.onerror = function(e) {
        console.error(xhr.statusText);
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
