/*global require, document, angular */

require.config({
  baseUrl: 'src',
  paths: {
    'angular': '../bower_components/angular/angular',
    'angular-resource': '../bower_components/angular-resource/angular-resource',
    'angular-grid': '../bower_components/angular-grid/build/ng-grid',
    'angular-grid-flex-height': '../bower_components/angular-grid/plugins/ng-grid-flexible-height',
    'angular-ui-bootstrap': '../bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls',
    'jquery': '../bower_components/jquery/dist/jquery',
    'jquery-ui': '../bower_components/jquery-ui/ui/jquery-ui'
  },
  shim: {
    'angular': {
      deps: ['jquery']
    },
    'angular-ui-router': {
      deps: ['angular']
    },
    'angular-resource': {
      deps: ['angular']
    },
    'angular-grid': {
      deps: ['angular', 'jquery']
    },
    'angular-grid-flex-height': {
      deps: ['angular-grid']
    },
    'angular-ui-bootstrap': {
      deps: ['angular']
    },
    'jquery-ui': {
      deps: ['jquery']
    }
  }
});

require(
  [
    'propulsion-grid',
    'angular'
  ],
  function () {
    'use strict';

    angular.bootstrap(document, ['propulsion.grid']);
  }
);
