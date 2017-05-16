define(function(require, exports, module) {

  const React = require("react");
  const ReactDOM = require("react-dom");
  const TSCORE = require("tscore");

  class MainMenu extends React.Component {

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

    render() {
      return (
        <div className="btn-group dropup extMainMenu">
          <button type="button" className="btn dropdown-toggle roundButton perspectiveMainMenuButton" data-toggle="dropdown" id={this.props.extensionID + "MainDropUp"}>
            <i className="fa fa-ellipsis-v fa-2x"></i>
          </button>
          <ul id="mainMenu" className="dropdown-menu pull-right mainDropUpMenu" onClick={TSCORE.hideAllDropDownMenus}>
            <li className="dropdown-header">
              <button className="close">&times;</button>&nbsp;
            </li>
            <li><a id={this.props.extensionID + "ToogleSelectAll"}>
              <i className="fa fa-square-o fa-lg fa-fw"></i>&nbsp;<span data-i18n="ns.perspectives:toggleSelectAll"></span>
            </a></li>
            <li className="disabled"><a id={this.props.extensionID + "TagButton"}>
              <i className="fa fa-tag fa-lg fa-fw"></i>&nbsp;<span data-i18n="ns.perspectives:addRemoveTags" onClick={this.showAddTagsDialog}></span>
            </a></li>
            <li className="disabled"><a id={this.props.extensionID + "CopyMoveButton"}>
              <i className="fa fa-copy fa-lg fa-fw"></i>&nbsp;<span data-i18n="ns.perspectives:copyMoveFiles" onClick={this.showMoveCopyFilesDialog}></span>
            </a></li>
            <li className="disabled"><a id={this.props.extensionID + "DeleteSelectedFilesButton"} onClick={this.showDeleteFilesDialog}>
              <i className="fa fa-trash fa-lg fa-fw"></i>&nbsp;<span data-i18n="ns.perspectives:deleteSelectedFiles"></span>
            </a></li>
            <li className="divider"></li>
            <li>
              <div id="resizableThumbnails">
                <i className="glyphicon glyphicon-resize-full"></i>&nbsp;
                <div className="btn-group" data-toggle="buttons">
                  <a id="decreasingThumbnails"><label className="btn btn-secondary" data-i18n="[title]ns.perspectives:decreaseThumbnailsTooltip">-</label></a>
                  <a id="increasingThumbnails"><label className="btn btn-secondary" data-i18n="[title]ns.perspectives:increaseThumbnailsTooltip">+</label></a>
                </div>
              </div>
            </li>
            <li className="divider"></li>
            <li><a id={this.props.extensionID + "sortingCriteria"} data-toggle="modal" data-target={"#" + this.props.extensionID + "SortExtensionModal"}>
              <i className="fa fa-sort-amount-asc fa-lg fa-fw"></i>&nbsp;<span data-i18n="ns.perspectives:sortingCriteria"></span>
            </a></li>
            <li><a id="moreButton" data-toggle="modal" data-target={"#" + this.props.extensionID + "ExtensionModal"}>
              <i className="fa fa-th-large fa-lg fa-fw"></i>&nbsp;<span data-i18n="ns.perspectives:fileGrouping"></span>
            </a></li>
            <li><a id={this.props.extensionID + "showFoldersInListCheckbox"}>
                <i className="fa fa-folder fa-lg fa-fw"></i>&nbsp;<span data-i18n="ns.perspectives:showFolders"></span>
              </a></li>
            <li><a id={this.props.extensionID + "hideFoldersInListCheckbox"}>
                <i className="fa fa-folder fa-lg fa-fw"></i>&nbsp;<span data-i18n="ns.perspectives:hideFolders"></span>
              </a></li>
            <li><a id={this.props.extensionID + "IncludeSubDirsButton"}>
              <i className="fa fa-refresh fa-lg fa-fw"></i>&nbsp;<span data-i18n="ns.perspectives:showSubfolderContent"></span>
            </a></li>
            <li className="divider"></li>
            <li><a id="aboutButton" data-toggle="modal" data-target="#aboutExtensionModalGrid">
              <i className="fa fa-comment fa-lg fa-fw"></i>&nbsp;<span data-i18n="ns.perspectives:about"></span>
            </a></li>
          </ul>
        </div>
      );
    }
  }

  exports.MainMenu = MainMenu;
})