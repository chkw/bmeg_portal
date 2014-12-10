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
        $scope.toggleLeft = function() {
            $mdSidenav('left').toggle();
        };
        $scope.toggleRight = function() {
            $mdSidenav('right').toggle();
        };
    }).controller('LeftCtrl', function($scope, $timeout, $mdSidenav) {
        $scope.close = function() {
            $mdSidenav('left').close();
        };
    }).controller('RightCtrl', function($scope, $timeout, $mdSidenav) {
        $scope.close = function() {
            $mdSidenav('right').close();
        };
    });
})();