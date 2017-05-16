"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require, exports, module) {

  var React = require("react");
  var ReactDOM = require("react-dom");
  var TSCORE = require("tscore");

  var MainMenu = function (_React$Component) {
    _inherits(MainMenu, _React$Component);

    function MainMenu() {
      _classCallCheck(this, MainMenu);

      return _possibleConstructorReturn(this, (MainMenu.__proto__ || Object.getPrototypeOf(MainMenu)).apply(this, arguments));
    }

    _createClass(MainMenu, [{
      key: "showDeleteFilesDialog",
      value: function showDeleteFilesDialog(e) {
        if ($(e.nativeEvent.target).parent().hasClass("disabled")) {
          return false;
        } else {
          TSCORE.UI.showDeleteFilesDialog();
        }
      }
    }, {
      key: "showMoveCopyFilesDialog",
      value: function showMoveCopyFilesDialog(e) {
        if ($(e.nativeEvent.target).parent().hasClass("disabled")) {
          return false;
        }
        TSCORE.showMoveCopyFilesDialog();
      }
    }, {
      key: "showAddTagsDialog",
      value: function showAddTagsDialog(e) {
        if ($(e.nativeEvent.target).parent().hasClass("disabled")) {
          return false;
        }
        TSCORE.showAddTagsDialog();
      }
    }, {
      key: "render",
      value: function render() {
        return React.createElement(
          "div",
          { className: "btn-group dropup extMainMenu" },
          React.createElement(
            "button",
            { type: "button", className: "btn dropdown-toggle roundButton perspectiveMainMenuButton", "data-toggle": "dropdown", id: this.props.extensionID + "MainDropUp" },
            React.createElement("i", { className: "fa fa-ellipsis-v fa-2x" })
          ),
          React.createElement(
            "ul",
            { id: "mainMenu", className: "dropdown-menu pull-right mainDropUpMenu", onClick: TSCORE.hideAllDropDownMenus },
            React.createElement(
              "li",
              { className: "dropdown-header" },
              React.createElement(
                "button",
                { className: "close" },
                "\xD7"
              ),
              "\xA0"
            ),
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                { id: this.props.extensionID + "ToogleSelectAll" },
                React.createElement("i", { className: "fa fa-square-o fa-lg fa-fw" }),
                "\xA0",
                React.createElement("span", { "data-i18n": "ns.perspectives:toggleSelectAll" })
              )
            ),
            React.createElement(
              "li",
              { className: "disabled" },
              React.createElement(
                "a",
                { id: this.props.extensionID + "TagButton" },
                React.createElement("i", { className: "fa fa-tag fa-lg fa-fw" }),
                "\xA0",
                React.createElement("span", { "data-i18n": "ns.perspectives:addRemoveTags", onClick: this.showAddTagsDialog })
              )
            ),
            React.createElement(
              "li",
              { className: "disabled" },
              React.createElement(
                "a",
                { id: this.props.extensionID + "CopyMoveButton" },
                React.createElement("i", { className: "fa fa-copy fa-lg fa-fw" }),
                "\xA0",
                React.createElement("span", { "data-i18n": "ns.perspectives:copyMoveFiles", onClick: this.showMoveCopyFilesDialog })
              )
            ),
            React.createElement(
              "li",
              { className: "disabled" },
              React.createElement(
                "a",
                { id: this.props.extensionID + "DeleteSelectedFilesButton", onClick: this.showDeleteFilesDialog },
                React.createElement("i", { className: "fa fa-trash fa-lg fa-fw" }),
                "\xA0",
                React.createElement("span", { "data-i18n": "ns.perspectives:deleteSelectedFiles" })
              )
            ),
            React.createElement("li", { className: "divider" }),
            React.createElement(
              "li",
              null,
              React.createElement(
                "div",
                { id: "resizableThumbnails" },
                React.createElement("i", { className: "glyphicon glyphicon-resize-full" }),
                "\xA0",
                React.createElement(
                  "div",
                  { className: "btn-group", "data-toggle": "buttons" },
                  React.createElement(
                    "a",
                    { id: "decreasingThumbnails" },
                    React.createElement(
                      "label",
                      { className: "btn btn-secondary", "data-i18n": "[title]ns.perspectives:decreaseThumbnailsTooltip" },
                      "-"
                    )
                  ),
                  React.createElement(
                    "a",
                    { id: "increasingThumbnails" },
                    React.createElement(
                      "label",
                      { className: "btn btn-secondary", "data-i18n": "[title]ns.perspectives:increaseThumbnailsTooltip" },
                      "+"
                    )
                  )
                )
              )
            ),
            React.createElement("li", { className: "divider" }),
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                { id: this.props.extensionID + "sortingCriteria", "data-toggle": "modal", "data-target": "#" + this.props.extensionID + "SortExtensionModal" },
                React.createElement("i", { className: "fa fa-sort-amount-asc fa-lg fa-fw" }),
                "\xA0",
                React.createElement("span", { "data-i18n": "ns.perspectives:sortingCriteria" })
              )
            ),
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                { id: "moreButton", "data-toggle": "modal", "data-target": "#" + this.props.extensionID + "ExtensionModal" },
                React.createElement("i", { className: "fa fa-th-large fa-lg fa-fw" }),
                "\xA0",
                React.createElement("span", { "data-i18n": "ns.perspectives:fileGrouping" })
              )
            ),
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                { id: this.props.extensionID + "showFoldersInListCheckbox" },
                React.createElement("i", { className: "fa fa-folder fa-lg fa-fw" }),
                "\xA0",
                React.createElement("span", { "data-i18n": "ns.perspectives:showFolders" })
              )
            ),
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                { id: this.props.extensionID + "hideFoldersInListCheckbox" },
                React.createElement("i", { className: "fa fa-folder fa-lg fa-fw" }),
                "\xA0",
                React.createElement("span", { "data-i18n": "ns.perspectives:hideFolders" })
              )
            ),
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                { id: this.props.extensionID + "IncludeSubDirsButton" },
                React.createElement("i", { className: "fa fa-refresh fa-lg fa-fw" }),
                "\xA0",
                React.createElement("span", { "data-i18n": "ns.perspectives:showSubfolderContent" })
              )
            ),
            React.createElement("li", { className: "divider" }),
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                { id: "aboutButton", "data-toggle": "modal", "data-target": "#aboutExtensionModalGrid" },
                React.createElement("i", { className: "fa fa-comment fa-lg fa-fw" }),
                "\xA0",
                React.createElement("span", { "data-i18n": "ns.perspectives:about" })
              )
            )
          )
        );
      }
    }]);

    return MainMenu;
  }(React.Component);

  exports.MainMenu = MainMenu;
});