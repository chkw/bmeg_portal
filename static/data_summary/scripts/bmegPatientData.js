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
        return this;
    };

    this.removeCriteria = function(feature, value) {
        for (var i = 0; i < this.criteria.length; i++) {
            if ((this.criteria[i]["feature"] == feature) && (this.criteria[i]["value"] == value)) {
                this.criteria.splice(i, 1);
                break;
            }
        }
        return this;
    };

    this.clearCriteria = function() {
        this.criteria.splice(0, this.criteria.length);
        return this;
    };
}

/**
 * Data about a single patient.
 * @param {Object} data
 */
function patientData(data) {
    this.data = data;

    // TODO setMutation
    this.setMutation = function(gene, callType) {
        var feature = "mutation:" + gene;
        var calls = this.getValue(feature);
        if (calls === "no annotation") {
            this.setValue(feature, callType);
        } else {
            var callList = calls.split(" ");
            callList.push(callType);
            this.setValue(feature, callList.join(" "));
        }
        return this;
    };

    this.setValue = function(feature, value) {
        this.data[feature] = value;
        return this;
    };

    this.getValue = function(feature) {
        if ( feature in this.data) {
            return this.data[feature];
        } else {
            return "no annotation";
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

    this.addGenderData = function(genderData) {
        for (var gender in genderData) {
            var idList = genderData[gender];
            gender = gender.replace(/^tcga_attr:/i, "");
            for (var i = 0; i < idList.length; i++) {
                var id = idList[i];
                var patientData = this.getPatient(id);
                if (patientData == null) {
                    console.error('no patient with id ' + id);
                } else {
                    patientData.setValue("gender", gender);
                }
            }
        }
        return this;
    };

    this.addDiseaseCodeData = function(diseaseCodeData) {
        for (var disease in diseaseCodeData) {
            var idList = diseaseCodeData[disease];
            disease = disease.replace(/^tcga_attr:/i, "");
            for (var i = 0; i < idList.length; i++) {
                var id = idList[i];
                var patientData = this.getPatient(id);
                if (patientData == null) {
                    console.error('no patient with id ' + id);
                } else {
                    patientData.setValue("diseaseCode", disease);
                }
            }
        }
        return this;
    };

    // TODO addMutationData
    this.addMutationData = function(mutationData) {
        var geneList = Object.keys(mutationData);
        for (var i = 0; i < geneList.length; i++) {
            var gene = geneList[i];
            var callData = mutationData[gene];
            gene = gene.replace(/^hugo:/i, "");
            var callTypes = Object.keys(callData).sort();
            for (var j = 0; j < callTypes.length; j++) {
                var callType = callTypes[j];
                var idList = callData[callType];
                // dedup idList
                idList = eliminateDuplicates(idList);
                var callType = callType.replace(/^bmeg:/i, "");
                for (var k = 0; k < idList.length; k++) {
                    var id = idList[k];
                    var patientData = this.getPatient(id);
                    if (patientData == null) {
                        console.error('no patient with id ' + id);
                    } else {
                        patientData.setMutation(gene, callType);
                    }
                }
            }
        }
        return this;
    };

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
        var patient = this.getPatient(id);
        if (patient == null) {
            console.error("no patient with id", id);
        } else {
            patientVal = patient.getValue(feature);
        }
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
     *Select the IDs based on multiple criteria chained with "AND".
     */
    this.selectIds = function(selectionCriteria) {
        // TODO needs an "or" mode
        var ids = this.getAllPatientIds();
        if (selectionCriteria.getCriteria().length == 0) {
            return ids;
        }
        var criteria = selectionCriteria.getCriteria();
        for (var i = 0; i < criteria.length; i++) {
            var feature = criteria[i]["feature"];
            var value = criteria[i]["value"];

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
            if ((patientVal !== '__NOT_SET__') && (patientVal === value)) {
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