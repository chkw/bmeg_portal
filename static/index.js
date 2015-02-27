(function() {
    var app = angular.module('ngDemo1', ['ngMaterial', 'ngMessages']);
    app.controller('AppCtrl', function($scope) {
        $scope.data = {
            selectedIndex : 0,
            secondLocked : true,
            secondLabel : "Item Two"
        };
        $scope.next = function() {
            $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
        };
        $scope.previous = function() {
            $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
        };
    });

    app.controller('SideNavCtrl', function($scope, $timeout, $mdSidenav) {
        this.sections = [{
            'name' : 'About BMEG',
            'isSelected' : false
        }, {
            'name' : 'In The News',
            'isSelected' : false
        }, {
            'name' : 'DREAM Challenges',
            'isSelected' : false
        }, {
            'name' : 'TCGA Live',
            'isSelected' : false
        }, {
            'name' : 'ICGC/TCGA PCAWG',
            'isSelected' : false
        }, {
            'name' : 'Signature Query',
            'isSelected' : false
        }];

        $scope.toggleLeft = function() {
            $mdSidenav('left').toggle();
        };
        $scope.toggleRight = function() {
            $mdSidenav('right').toggle();
        };

        this.toggleSelectSection = function(section) {
            for (var i = 0; i < this.sections.length; i++) {
                if (this.sections[i] === section) {
                    section.isSelected = !section.isSelected;
                } else {
                    this.sections[i].isSelected = false;
                }
            }
        };

        this.isSectionSelected = function(section) {
            return section.isSelected;
        };

        this.defaultSectionSelection = function() {
            var selectedSectionIndex = null;
            for (var i = 0; i < this.sections.length; i++) {
                if (this.sections[i].isSelected) {
                    selectedSectionIndex = i;
                    continue;
                }
            }
            if (selectedSectionIndex == null) {
                this.sections[0].isSelected = true;
            }
        };

        this.isSectionNameSelected = function(name) {
            this.defaultSectionSelection();
            var selected = false;
            for (var i = 0; i < this.sections.length; i++) {
                if (this.sections[i].name === name) {
                    selected = this.sections[i].isSelected;
                }
            }
            return selected;
        };
    });

    app.controller('LeftCtrl', function($scope, $timeout, $mdSidenav) {
        $scope.close = function() {
            $mdSidenav('left').close();
        };
    });

    app.controller('RightCtrl', function($scope, $timeout, $mdSidenav) {
        $scope.close = function() {
            $mdSidenav('right').close();
        };
    });

    app.controller('querySetCtrl', function($scope) {
        $scope.querySet = {
            'unsplit' : ''
        };
    });
})();

setObsDeck = function(divElem, querySet) {
    // TODO get data for querySet

    console.log('querySet', querySet);
    var resp = utils.getResponse('/sigQuery?queryObject={"querySet":' + JSON.stringify(querySet) + '}');
    var bmegSigServiceData = utils.parseJson(resp);

    config = buildObservationDeck(divElem, {
        'bmegSigServiceData' : bmegSigServiceData
    });
    return config;
};