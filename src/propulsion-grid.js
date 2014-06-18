/*global angular */
var module = angular.module('propulsion.grid', [
  'ui.bootstrap',
  'ui.router',
  'ngResource',
  'ngGrid'
]);

module.directive('propulsionGrid', ['$http', '$compile', '$templateCache', '$location', '$resource', function ($http, $compile, $templateCache, $location, $resource) {
  'use strict';

  return {
    restrict: 'E',
    replace: 'true',
    scope: {
      gridconfig: "=",
      queryPrefix: "@",
      pageSize: "@",
      endpoint: "@",
      template: "@",
      sortQuery: "@",
      limitQuery: "@",
      pageQuery: "@",
      searchQuery: "@",
      gridData: "=",
      selected: "=",
      clickAction: "="
    },
    template: '<div class="propulsion-grid"></div>',
    link: function (scope, elem, attrs) {
      var i,
        dir,
        f_char,
        field,
        template,
        endpoint_template,
        rest_endpoint;

      //Set our configuration
      scope.config = scope.gridconfig || {};
      scope.config.queryprefix = scope.queryPrefix || scope.config.queryprefix || '';
      scope.config.limit = scope.config.limit || scope.limitQuery || 'limit';
      scope.config.page = scope.config.page || scope.pageQuery || 'page';
      scope.config.search = scope.config.search || scope.searchQuery || 'search';
      scope.config.sort = scope.config.sort || scope.sortQuery || 'sort';
      scope.config.pager_max_size = scope.config.pager_max_size || 5;
      scope.config.default_page_size = scope.pageSize || scope.config.pageSize || 10;
      scope.config.multiSelect = attrs.hasOwnProperty('multiSelect');
      scope.pageSizes = scope.config.pageSizes || [5, 10, 25, 50, 100, 250, 500];
      scope.endpoint = scope.endpoint || scope.config.endpoint || undefined;
      scope.template = scope.template || scope.config.template || 'propulsion-grid.html';
      scope.data = scope.gridData || scope.config.gridData || [];
      scope.has_endpoint = (scope.endpoint) ? true : false;

      //Set some additional available within our scope
      scope.show_search = scope.showSearch || scope.config.show_search || true;
      scope.records_start = 1;
      scope.pager_max_size = scope.config.pager_max_size;
      scope.selectedItems = [];
      scope.search = $location.search()[scope.queryPrefix + scope.config.search] || '';
      scope.sort = $location.search()[scope.queryPrefix + scope.config.sort] || '';
      scope.records_page = $location.search()[scope.queryPrefix + scope.config.page] || 1;
      scope.records_limit = $location.search()[scope.queryPrefix + scope.config.limit] || scope.config.default_page_size;
      scope.records_page = parseInt(scope.records_page, 10);
      scope.records_limit = parseInt(scope.records_limit, 10);

      //Build the endpoint url template
      if (scope.endpoint) {
        endpoint_template = scope.endpoint + '?' + scope.config.limit + '=:limit&' + scope.config.page + '=:page&' + scope.config.sort + '=:sort&' + scope.config.search + '=:search';
      }

      //Set defaults for the ng-grid config
      scope.gridConfig = {
        data: 'data',
        enableRowSelection: false,
        showColumnMenu: true,
        rowTemplate: '<div style="cursor: pointer" ng-style="{ \'pointer\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>',
        columnDefs: [
          {
            displayName: 'Name',
            field: 'name',
            cellTemplate: '<div ng-click="clickItem(row.entity, col)" class="ngCellText" ng-class="col.colIndex()" style="cursor: pointer;"><span ng-cell-text>{{row.entity.name}}</span></div>'
          }
        ],
        filterOptions: {
          filterText: '',
          useExternalFilter: false
        }
      };

      //If selected attr is set, enable row selection
      if (scope.selected !== undefined) {
        scope.gridConfig.selectedItems = scope.selected;
        scope.gridConfig.enableRowSelection = true;
        //Watch for any page changes
        scope.$watch('gridConfig.selectedItems', function (newVal, oldVal) {
          scope.selected = newVal;
        }, true);
      }

      //If we have an endpoint, enable external sorting
      scope.gridConfig.useExternalSorting = (scope.endpoint) ? true : false;

      //Overwrite any additional ng-grid options passed to us
      if (scope.config.grid) {
        for (i in scope.config.grid) {
          if (scope.config.grid.hasOwnProperty(i)) {
            scope.gridConfig[i] = scope.config.grid[i];
          }
        }
      }

      //If no sort configured, use the first column
      if (scope.sort === '') {
        scope.sort = scope.gridConfig.columnDefs[0].field;
      }

      //Get the first char to check for direction
      f_char = scope.sort[0];

      //If a direction char, set the string value and field otherwise assume asc
      if (f_char === '-' || f_char === '+') {
        dir = (f_char === '-') ? 'desc' : 'asc';
        field = scope.sort.slice(1);
      } else {
        field = scope.sort;
        dir = 'asc';
      }
      //Build the initial sort has and assign to the grid
      scope.sortInfo = {fields: [field], directions: [dir]};
      scope.gridConfig.sortInfo = scope.sortInfo;

      //Watch for any page changes
      scope.$watch('records_page', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          scope.load();
        }
      });

      //Watch for any limit changes, reset page to 1 if changing
      scope.$watch('records_limit', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          scope.records_page = 1;
          scope.load();
        }
      });

      //Watch for any sort changes
      scope.$watch('sortInfo', function (newVal, oldVal) {
        if (newVal.fields[0] !== oldVal.fields[0] || newVal.directions[0] !== oldVal.directions[0]) {
          scope.sort = scope.sortInfo.fields[0];
          if (scope.sortInfo.directions[0] === 'desc') {
            scope.sort = '-' + scope.sort;
          }
          scope.load();
        }
      }, true);


      //Our wrapper for the click action
      scope.clickItem = function (item, col) {
        if (scope.clickAction !== undefined) {
          //If checkboxes are enabled, don't fire on the checkbox
          if (scope.gridConfig.showSelectionCheckbox && col.index === 0) {
            return true;
          }
          scope.clickAction(item, col.index);
        }
      };

      //Simple scope function to reset page and do a search
      scope.do_search = function () {
        scope.records_page = 1;

        if (scope.endpoint === undefined) {
          scope.gridConfig.filterOptions.filterText = scope.search;
        }
        scope.load();
      };

      //Primary load function
      scope.load = function () {
        var endpoint_options = {},
          config = $location.search();

        //Build a query string hash
        config[scope.config.queryprefix + scope.config.limit] = scope.records_limit;
        config[scope.config.queryprefix + scope.config.page] = scope.records_page;
        config[scope.config.queryprefix + scope.config.search] = scope.search;
        config[scope.config.queryprefix + scope.config.sort] = scope.sort;

        //Set the new query string
        $location.search(config);

        //If no endpoint configured, try the data var and finish
        if (scope.endpoint === undefined) {
          scope.process_data(scope.data, scope.data.length);
          return true;
        }

        //Build our endpoint options
        endpoint_options.limit = scope.records_limit;
        endpoint_options.page = scope.records_page;
        endpoint_options.search = scope.search;
        endpoint_options.sort = scope.sort;

        //Build the new endpoint with options
        rest_endpoint = $resource(endpoint_template, endpoint_options);

        //Query the endpoint and process the results
        rest_endpoint.query(function (response, headers) {
          scope.process_data(response, headers('total-count'));
        });
      };

      //General function for processing data returned from endpoint and from a passed var
      scope.process_data = function (data, total) {
        scope.data = data;
        if (total === 0) {
          scope.records_total = 0;
          scope.records_start = 0;
          scope.records_end = 0;
        } else {
          scope.records_total = total;
          scope.records_start = (scope.records_page - 1) * scope.records_limit + 1;
          scope.records_end = (scope.records_page * scope.records_limit > scope.records_total) ? scope.records_total : scope.records_page * scope.records_limit;
        }
      };

      //Compile the template and add to the DOM
      scope.compile_template = function (template) {
        elem.append($compile(template)(scope));
      };

      //Attempt to get the template from the $templateCache
      template = $templateCache.get(scope.template);

      //If no template returned, go ahead and get it
      if (template !== undefined) {
        scope.compile_template(template);
      } else {
        $http.get(scope.template).then(function (response) {
          //Store the template in the #templateCache
          $templateCache.put(scope.template, response.data);

          scope.compile_template(response.data);
        });
      }

      //Do an initial load
      scope.load();
    }
  };
}]);
