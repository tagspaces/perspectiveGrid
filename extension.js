/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* global define, Handlebars, isCordova  */
define(function(require, exports, module) {
  "use strict";

  const TSCORE = require('tscore');
  const React = require('react');
  const ReactDOM = require('react-dom');
  const MainMenu = require('./components/main-menu').MainMenu;
  const AboutDialog = require('./components/about-dialog').AboutDialog;
  const SortingDialog = require('./components/sorting-dialog').SortingDialog;
  const GroupingDialog = require('./components/grouping-dialog').GroupingDialog;
  const ExtUI = require('./perspectiveUI').ExtUI;
  const readme = require('text!./README.md'); // TODO make loading conditional
  require('css!./extension.css');

  const extensionTitle = "Grid"; // should be equal to the name in the bower.json
  const extensionID = "perspectiveGrid"; // ID must be equal to the directory name where the extension is located
  const extensionIcon = "fa fa-th"; // icon class from font awesome

  console.log("Loading " + extensionID);

  let extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;
  let UI;
  let extensionLoadedPromise;

  function init() {
    console.log("Initializing perspective " + extensionID);

    extensionLoadedPromise = new Promise((resolve, reject) => {
      UI = new ExtUI(extensionID);
      UI.buildUI();

      if (TSCORE.isCordova) {
        TSCORE.reLayout();
      }

      let props = { "extensionID": extensionID };
      ReactDOM.render(
        React.createElement(
          "div",
          null,
          React.createElement(MainMenu, props, null),
          React.createElement(AboutDialog, props, null),
          React.createElement(SortingDialog, props, null),
          React.createElement(GroupingDialog, props, null)
        ), 
        document.getElementById(extensionID + 'Container')        
      );

      $('#' + extensionID + 'Container [data-i18n]').i18n();
      
      $('#aboutExtensionModalGrid').on('show.bs.modal', function() {
        var modalBody = $("#aboutExtensionModalGrid .modal-body");
        TSCORE.Utils.setMarkDownContent(modalBody, readme);
      });
      
      platformTuning();
      
      resolve(true);
    });
  }

  function platformTuning() {
    if (isCordova) {
      $("#" + extensionID + "IncludeSubDirsButton").hide();
      $('#' + extensionID + 'AddFileButton').hide(); // TODO tmp disabled due not working binary saving
    } else if (isChrome) {
      $('#' + extensionID + 'AddFileButton').hide();
      $('#' + extensionID + 'TagButton').hide();
      $('#' + extensionID + 'CopyMoveButton').hide();
      $('#' + extensionID + 'CreateDirectoryButton').hide();
      $('#' + extensionID + 'DeleteSelectedFilesButton').hide();
    } else if (isFirefox) {
      $('#' + extensionID + 'AddFileButton').hide(); // Current impl has 0.5mb limit
    }
  }

  function load() {
    console.log("Loading perspective " + extensionID);
    extensionLoadedPromise.then(function() {
      UI.reInit();
    }, function(err) {
      console.warn("Loading extension failed: " + err);
    });
  }

  function clearSelectedFiles() {
    if (UI) {
      UI.clearSelectedFiles();
      UI.handleElementActivation();
    }
  }

  function removeFileUI(filePath) {

    UI.removeFileUI(filePath);
  }

  function updateFileUI(oldFilePath, newFilePath) {

    UI.updateFileUI(oldFilePath, newFilePath);
  }

  function getNextFile(filePath) {

    return UI.getNextFile(filePath);
  }

  function getPrevFile(filePath) {

    return UI.getPrevFile(filePath);
  }

  function selectFile(filePath) {

    return UI.selectFile(filePath);
  }

  function setReadOnly() {
    $(document).off('drop dragend dragenter dragover dragleave', function(event) {
      event.preventDefault();
    });
  }

  // API Vars
  exports.Title = extensionTitle;
  exports.ID = extensionID;
  exports.Icon = extensionIcon;

  // API Methods
  exports.init = init;
  exports.load = load;
  exports.clearSelectedFiles = clearSelectedFiles;
  exports.getNextFile = getNextFile;
  exports.getPrevFile = getPrevFile;
  exports.selectFile = selectFile;
  exports.removeFileUI = removeFileUI;
  exports.updateFileUI = updateFileUI;
  exports.setReadOnly = setReadOnly;

});
