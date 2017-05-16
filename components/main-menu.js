/* Copyright (c) 2017-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define((require, exports, module) => {

  const React = require("react");
  const ReactDOM = require("react-dom");
  const TSCORE = require("tscore");

  class MainMenu extends React.Component {
    constructor(props) {
      super(props);
    }

    showDeleteFilesDialog(e) {
      if ($(e.nativeEvent.target).parent().hasClass("disabled")) {
        return false;
      } else {
        TSCORE.UI.showDeleteFilesDialog();
      }
    }

    showMoveCopyFilesDialog(e) {
      if ($(e.nativeEvent.target).parent().hasClass("disabled")) {
        return false;
      }
      TSCORE.showMoveCopyFilesDialog();
    }

    showAddTagsDialog(e) {
      if ($(e.nativeEvent.target).parent().hasClass("disabled")) {
        return false;
      }
      TSCORE.showAddTagsDialog();
    }

    createDirectoryIndex() {
      TSCORE.IOUtils.createDirectoryIndex(TSCORE.currentPath);
    }

    render() {
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
              { id: this.props.extensionID + "ToogleSelectAll", onClick: this.props.toggleSelectAll },
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
              { id: this.props.extensionID + "showFoldersInListCheckbox", onClick: this.props.showFoldersInListCheckbox },
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
              { id: this.props.extensionID + "hideFoldersInListCheckbox", onClick: this.props.hideFoldersInListCheckbox },
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
              { id: this.props.extensionID + "IncludeSubDirsButton", onClick: this.createDirectoryIndex },
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
  }

  exports.MainMenu = MainMenu;
});