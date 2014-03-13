/**
 * chrisw@soe.ucsc.edu
 * March 12, 2014
 *
 */

/**
 * Object for use with cohortData.selectIds(selectionCriteria.getCriteria()) .
 */
function selectionCriteria() {
    this.criteria = new Array();

    this.getCriteria = function() {
        return this.criteria;
    };

    this.addCriteria = function(feature, value) {
        var criteria = {
            "feature" : feature,
            "value" : value
        };
        for (var i in this.criteria) {
            if (JSON.stringify(this.criteria[i]) == JSON.stringify(criteria)) {
                return;
            }
        }
        this.criteria.push(criteria);
    };

    this.removeCriteria = function(feature, value) {
        for (var i = 0; i < this.criteria.length; i++) {
            if ((this.criteria[i]["feature"] == feature) && (this.criteria[i]["value"] == value)) {
                this.criteria.splice(i, 1);
                break;
            }
        }
    };

    this.clearCriteria = function() {
        this.criteria.splice(0, this.criteria.length);
    };
}

/**
 * Data about a single patient.
 * @param {Object} data
 */
function patientData(data) {
    this.data = data;

    this.getValue = function(feature) {
        if ( feature in this.data) {
            return this.data[feature];
        } else {
            return "not assessed";
        }
    };

    this.getFeatures = function() {
        var features = [];
        for (var key in this.data) {
            if (this.data.hasOwnProperty(key)) {
                features.push(key);
            }
        }
        return features;
    };
}

/**
 * A group of patient data.
 * @param {Object} deserializedCohortJson
 */
function cohortData(deserializedCohortJson) {

    this.loadData = function(patientArray) {
        var patientMapping = {};
        for (var i = 0; i < patientArray.length; i++) {
            var patient = patientArray[i];
            var id = patient["_id"];
            patientMapping[id] = patient;
        }
        return patientMapping;
    };

    // set the cohort data
    this.cohort = this.loadData(deserializedCohortJson);

    this.getAllFeatures = function(ids) {
        var idList = null;
        if (ids == null) {
            idList = this.getAllPatientIds();
        } else {
            idList = ids;
        }
        var features = [];
        for (var i = 0; i < idList.length; i++) {
            var patient = this.getPatient(idList[i]);
            var patientFeatures = patient.getFeatures();
            for (var j = 0; j < patientFeatures.length; j++) {
                var patientFeature = patientFeatures[j];
                if (features.indexOf(patientFeature) < 0) {
                    features.push(patientFeature);
                }
            }
        }
        return features.sort();
    };

    /**
     * Get series data for pie chart from category counts.
     */
    countsToPieData = function(counts) {
        var data = new Array();
        for (var type in counts) {
            var typeData = new Object();
            data.push(typeData);
            typeData["name"] = type;
            typeData["y"] = counts[type];
        }
        return data;
    };

    /**
     * Get the patient's value for the specified feature.
     */
    this.getPatientVal = function(id, feature) {
        var patientVal = '__NOT_SET__';
        patientVal = this.getPatient(id).getValue(feature);
        return patientVal;
    };

    /**
     * Get the counts for the specified patient IDs and feature
     * feature is one of ['studySite', 'biopsySite', 'subsequentdrugs', 'treatmentdetails'].
     */
    this.getPatientCounts = function(ids, feature) {
        var counts = new Object();
        for (var i in ids) {
            var id = ids[i];
            var val = this.getPatientVal(id, feature);
            if ((val != '__NOT_SET__') && !( val in counts)) {
                counts[val] = 0;
            }
            counts[val]++;
        }
        var data = countsToPieData(counts);
        return data;
    };

    /**
     *Get the patientData.
     */
    this.getPatient = function(patientId) {
        if ( patientId in this.cohort) {
            return new patientData(this.cohort[patientId]);
        } else {
            return null;
        }
    };

    /*
     *Select the IDs based on multiple criteria.
     * selectionCriteria is an Array of objects{feature,value}.
     */
    this.selectIds = function(selectionCriteria) {
        var ids = this.getAllPatientIds();
        if (selectionCriteria.length == 0) {
            return ids;
        }
        for (var i in selectionCriteria) {
            var feature = selectionCriteria[i]["feature"];
            var value = selectionCriteria[i]["value"];

            ids = this.selectPatients(ids, feature, value);
        }
        return ids;
    };

    /**
     * From the specified ID list, select only the patients by the specified parameters.
     * feature is one of ['studySite', 'biopsySite', 'subsequentdrugs', 'treatmentdetails'].
     */
    this.selectPatients = function(startingIds, feature, value) {
        var keptIds = new Array();
        for (var i in startingIds) {
            var id = startingIds[i];
            var patientVal = this.getPatientVal(id, feature);
            if ((patientVal != '__NOT_SET__') && (patientVal == value)) {
                keptIds.push(id);
            }
        }
        return keptIds;
    };

    /**
     * Get array of all patient IDs.
     */
    this.getAllPatientIds = function() {
        var ids = new Array();
        for (var id in this.cohort) {
            if (id == "Biopsy") {
                continue;
            }
            ids.push(id);
        }
        return ids;
    };
}