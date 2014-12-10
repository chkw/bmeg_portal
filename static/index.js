(function() {
    var app = angular.module('ngDemo1', ['ngMaterial']);
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
            'name' : 'Projects',
            'isSelected' : false
        }, {
            'name' : 'Data',
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
})();