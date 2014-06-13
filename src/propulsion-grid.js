/*global define, angular */
define('propulsion-grid', ['angular', 'angular-grid', 'angular-ui-bootstrap', 'angular-resource', 'angular-grid-flex-height'], function () {
  'use strict';

  var module = angular.module('propulsion.grid', [
    'ui.bootstrap',
    'ngResource',
    'ngGrid'
  ]);

  module.directive('propulsionGrid', ['$http', '$compile', '$templateCache', function ($http, $compile, $templateCache) {
    return {
      restrict: 'E',
      replace: 'true',
      scope: {
        config: "=config"
      },
      template: '<div class="propulsion-grid"></div>',
      link: function (scope, elem, attrs) {
        var flexHeight = new window.ngGridFlexibleHeightPlugin();

        scope.data = [{name: 'test'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}, {name: 'test2'}];
        scope.records_start = 1;
        scope.records_end = 2;
        scope.records_total = 2;
        scope.records_page = 1;
        scope.records_limit = 10;
        scope.pageSizes = [10, 25, 50, 100, 250, 500];

        scope.gridConfig = {
          data: 'data',
          enableRowSelection: false,
          rowTemplate: '<div ng-click="$state.go(\'^.record.view\', row.entity)" style="cursor: pointer" ng-style="{ \'pointer\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>',
          columnDefs: [
            {
              displayName: 'Name',
              field: 'name',
              cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()" style="cursor: pointer;" ng-click="$state.go(\'^.record.view\', row.entity)"><span ng-cell-text>{{row.entity.name}}</span></div>'
            }
          ]
        };

        $http.get('propulsion-grid.html').then(function (response) {
          var template = response.data;
          elem.append($compile(template)(scope));
        });
      }
    };
  }]);

  return module;
});
