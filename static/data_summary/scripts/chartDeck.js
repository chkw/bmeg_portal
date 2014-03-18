/**
 * chrisw@soe.ucsc.edu
 * March 18, 2014
 */

function chartInfo(data) {
    this.info = data;

    this.getInfo = function() {
        return this.info;
    };

    this.getTitle = function() {
        return this.info["title"];
    };

    this.getDivId = function() {
        return this.info["divId"];
    };

    this.setDivId = function(id) {
        this.info["divId"] = id;
    };

    this.getChart = function() {
        return this.info["chart"];
    };

    this.setColorMap = function(map) {
        this.info["colorMap"] = map;
    };

    this.getColorMap = function() {
        return this.info["colorMap"];
    };
}

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

    this.setInfo = function(divId, title, feature, chart) {
        var newInfo = new chartInfo({
            "divId" : divId,
            "title" : title,
            "feature" : feature,
            "chart" : chart
        });
        var savedInfo = this.getChartInfo(title);

        if (existingInfo == null) {
            this.deck.push(newInfo);
        } else {
            savedInfo = newInfo;
        }
        return this;
    };
}
