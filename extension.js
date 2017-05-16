/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* global define, Handlebars, isCordova  */
define((require, exports, module) => {
"use strict";

const React = require('react');
const ReactDOM = require('react-dom');
const TSCORE = require('tscore');
const MainMenu = require('./components/main-menu').MainMenu;
const AboutDialog = require('./components/about-dialog').AboutDialog;
const SortingDialog = require('./components/sorting-dialog').SortingDialog;
const GroupingDialog = require('./components/grouping-dialog').GroupingDialog;
const ExtensionInfo = require('text!./bower.json');

require('css!./extension.css');

const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const fileTileTmpl = Handlebars.compile(`
  <div title="{{filepath}}" data-path="{{filepath}}" data-isfile="true" class="fileTile {{class}}">
    <div class="thumbnailArea" data-path="{{filepath}}" style="background-image: url(\{{thumbPath}}\)">
      <div class="tagsInFileTile">
      {{#each tags}}
        <button class="btn btn-sm tagButton fileTagsTile" data-tag="{{tag}}" data-path="{{filepath}}" style="{{style}}">{{tag}}</button>
      {{/each}}
      </div>
    </div>
    <div class="fileInfoArea" filepath="{{filepath}}">
      <button class="btn btn-link fileTileSelector {{coloredExtClass}}" data-ext="{{fileext}}" >
        <i class="fa {{selected}} fa-fw fa-lg"></i><span class="fileExtTile">{{fileext}}</span>
      </button>
      <div class="titleInFileTile">{{title}}</div>
    </div>
  </div>
`);

const folderTileTmpl = Handlebars.compile(`
  <div title="{{folderpath}}" data-path="{{folderpath}}" data-isfile="false" class="fileTile {{class}}">
    <div class="thumbnailArea" style="background-image: url(\{{thumbPath}}\)">
    </div>
    <div class="fileInfoArea">
      <button class="btn btn-link fileTileSelector {{coloredExtClass}}" data-ext="folder" data-path="{{folderpath}}">
        <i class="fa fa-folder-o fa-lg"></i>
      </button>
      <div class="titleInFileTile">{{title}}</div>
    </div>
  </div>
`);

const mainLayoutTemplate = Handlebars.compile(`
  <div class="extMainContent accordion">
  {{#each groups}}
    <div class="accordion-group disableTextSelection" style="width: 100%; border: 0px #aaa solid;">
    {{#if ../moreThanOneGroup}}
      <div class="accordion-heading btn-group" style="width:100%; margin: 0px; border-bottom: solid 1px #eee; background-color: #f0f0f0;">
        <button class="btn btn-link groupTitle" data-toggle="collapse" data-target="#{{../../id}}SortingButtons{{@index}}">
          <i class="fa fa-minus-square">&nbsp;</i>
        </button>
        <span class="btn btn-link groupTitle" id="{{../../id}}HeaderTitle{{@index}}" style="margin-left: 0px; padding-left: 0px;"></span>
      </div>
    {{/if}}
    <div class="accordion-body collapse in" id="{{../id}}SortingButtons{{@index}}" style="margin: 0px 0px 0px 3px; border: 0px;">
      <div class="accordion-inner tileContainer" id="{{../id}}GroupContent{{@index}}"></div>
    </div>
  </div>
  {{else}}
    <p style="margin: 5px; font-size: 13px; text-align: center;">Directory does not contain any files or is currently being analysed.</p>
  {{/each}}
    <div id="gridShowAllFilesContainer">
      <button class="btn btn-primary" id="gridShowAllFilesButton">Show all files</button>
    </div>
  </div>
`);

class GridPerspective {
  constructor() {
    console.log("Instantiating GridPerspective");
    let extMeta = JSON.parse(ExtensionInfo);
    this.extensionID = extMeta.id;
    this.Title = extMeta.name;
    this.ID = extMeta.id;
    this.Icon = "fa fa-th"; // icon class from font awesome

    this.selectedIsFolderArr = [];
    this.showFoldersInList = false;
    this.hasFolderInList = false;
    this.showSortDataInList = 'byDirectory';
    this.orderBy;
    this.zoomFactor;
    this._loadExtSettings();

    this.zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
    this.currentZoomState = 3;
    this.currentGrouping = ""; // tagchain, day, month, year
    this.currentTmbSize = 0;
    this.searchResults = [];
    this.supportedGroupings = [
      { "title": "Day", "key": "day" },
      { "title": "Month", "key": "month" },
      { "title": "Year", "key": "year" }
    ];
    this.supportedSortings = [
      {
        "title": $.i18n.t("ns.perspectives:orderByName"),
        "key": "byName"
      },
      {
        "title": $.i18n.t("ns.perspectives:orderByTagCount"),
        "key": "byTagCount"
      },
      {
        "title": $.i18n.t("ns.perspectives:orderBySize"),
        "key": "byFileSize"
      },
      {
        "title": $.i18n.t("ns.perspectives:orderByDate"),
        "key": "byDateModified"
      },
      {
        "title": $.i18n.t("ns.perspectives:orderByExtension"),
        "key": "byExtension"
      }
    ];

    for (let i = 0; i < TSCORE.Config.Settings.tagGroups.length; i++) {
      // Exclude smart tags and calculated tags 
      if (TSCORE.Config.Settings.tagGroups[i].key !== "SMR" &&
        TSCORE.Config.Settings.tagGroups[i].key !== "CTG") {
        this.supportedGroupings.push({
          "title": TSCORE.Config.Settings.tagGroups[i].title,
          "key": TSCORE.Config.Settings.tagGroups[i].key
        });
      }
    }
  }

  init() {

    this.extensionLoadedPromise = new Promise((resolve, reject) => {


      this.buildUI();

      let extId = 'perspectiveGrid'; //this.extensionID

      let props = { 
        "extensionID": this.extensionID, 
        "toggleSelectAll": this.toggleSelectAll.bind(this),
        "showFoldersInListCheckbox": this.showFoldersInListCheckbox.bind(this),
        "hideFoldersInListCheckbox": this.hideFoldersInListCheckbox.bind(this),
      };
      ReactDOM.render(
        React.createElement(
          "div",
          null,
          React.createElement(MainMenu, props, null),
          React.createElement(AboutDialog, props, null),
          React.createElement(SortingDialog, props, null),
          React.createElement(GroupingDialog, props, null)
        ), 
        document.getElementById(extId + 'Container')        
      );

      this.initFileGroupingMenu();
      this.initFileSortingMenu();      

      $('#' + this.extensionID + 'Container [data-i18n]').i18n();
      
      this._platformTuning();
      
      resolve(true);
    });
  }

  load() {
    //console.log("Loading perspective " + this.extensionID);
    this.extensionLoadedPromise.then(() => {
      this.reInit();
    }/*, (err) => {
      console.warn("Loading extension failed: " + err);
    }*/);
  }

  buildUI() {
    this.viewContainer = $("#" + this.extensionID + "Container");
    this.viewContainer.empty();

    let $showFoldersInList = $("#" + this.extensionID + "showFoldersInListCheckbox");
    let $hideFoldersInList = $("#" + this.extensionID + "hideFoldersInListCheckbox");

    if (this.showFoldersInList) {
      $hideFoldersInList.show();
      $showFoldersInList.hide();
    } else {
      $hideFoldersInList.hide();
      $showFoldersInList.show();
    }

    $('#orderBy input').on('change', () => {
      if (this.value === 'ascending') {
        this.orderBy = true;
      } else if (this.value === 'descending') {
        this.orderBy = false;
      }
    });

    $("#modal_button_ok").on("click", (evt) => {
      TSCORE.navigateToDirectory(TSCORE.currentPath);
    });

    $("#increasingThumbnails").on('click', (e) => {
      e.stopPropagation();
      $('#perspectiveGridSortingButtons0').find('.fileTile').each(() => {
        if ($(".fileTile").hasClass(this.zoomSteps[this.currentZoomState])) {
          $("div.fileTile.ui-droppable").removeClass(this.zoomSteps[this.currentZoomState]);
        }
      });
      this.currentZoomState++;
      if (this.currentZoomState >= this.zoomSteps.length) {
        this.currentZoomState = 6;
      }
      this.zoomFactor = this.currentZoomState;
      $('.fileTile').addClass(this.zoomSteps[this.currentZoomState]);
      this._saveExtSettings();
    });

    $("#decreasingThumbnails").on('click', (e) => {
      e.stopPropagation();
      $('#perspectiveGridSortingButtons0').find('.fileTile').each(() => {
        if ($(".fileTile").hasClass(this.zoomSteps[this.currentZoomState])) {
          $("div.fileTile.ui-droppable").removeClass(this.zoomSteps[this.currentZoomState]);
        }
      });
      this.currentZoomState--;
      if (this.currentZoomState < 0) {
        this.currentZoomState = 0;
      }
      this.zoomFactor = this.currentZoomState;
      $('.fileTile').addClass(this.zoomSteps[this.currentZoomState]);
      this._saveExtSettings();
    });

    $('#viewContainers').on('scroll', _.debounce(() => { // Triggering thumbnails generation
      $('#viewContainers').find(".thumbnailArea").each((index, elem) => {
        this.setThumbnail(elem);
      });
    }, 500));
  }

  reInit(showAllResult) {
    console.log("ReInit perspective " + this.extensionID);

    let shouldShowAllFilesContainer;

    this.viewContainer.find('.extMainContent').remove();

    let $extMainContent = this.viewContainer.find(".extMainContent");
    if ($extMainContent) {
      $extMainContent.remove();
    }

    if (showAllResult && this.partialResult && this.partialResult.length > 0) {
      this.searchResults = this.allResults;
      this.partialResult = [];
      shouldShowAllFilesContainer = false;
    } else {
      this.allResults = TSCORE.Search.searchData(TSCORE.fileList, TSCORE.Search.nextQuery);
      if (this.allResults.length >= TSCORE.Config.getMaxSearchResultCount()) {
        this.partialResult = this.allResults.slice(0, TSCORE.Config.getMaxSearchResultCount());
        this.searchResults = this.partialResult;
        shouldShowAllFilesContainer = true;
      } else {
        this.searchResults = this.allResults;
        shouldShowAllFilesContainer = false;
      }
    }
    if (this.orderBy === undefined) {
      this.sortByCriteria('byName', true);
    } else {
      this.sortByCriteria(this.showSortDataInList, this.orderBy);
    }

    let fileGroups = this.calculateGrouping(this.searchResults);

    let moreThanOneGroup = (fileGroups.length > 1) ? true : false;

    this.viewContainer.append(mainLayoutTemplate({
      id: this.extensionID,
      groups: fileGroups,
      moreThanOneGroup: moreThanOneGroup
    }));

    shouldShowAllFilesContainer ? $("#gridShowAllFilesContainer").show() : $("#gridShowAllFilesContainer").hide();

    $('#gridShowAllFilesButton').on("click", () => {
      this.reInit(true);
    });

    this.viewContainer.on("contextmenu", ".fileTile", (event) => {
      let selEl = $(event.target).parent().find(".fileTitle button");
      e.preventDefault();
      TSCORE.hideAllDropDownMenus();
      TSCORE.PerspectiveManager.clearSelectedFiles();
      this.selectFile($(event.target).data("path"));
      TSCORE.showContextMenu("#fileMenu", $(event.target));
      return false;
    });

    $extMainContent = this.viewContainer.find(".extMainContent");

    let $groupeContent;
    let $groupeTitle;

    fileGroups.forEach((value, index) => {
      $groupeContent = $("#" + this.extensionID + "GroupContent" + index);
      $groupeTitle = $("#" + this.extensionID + "HeaderTitle" + index);

      let groupingTitle = this.calculateGroupTitle(value[0]);
      $groupeTitle.text(groupingTitle);

      // Iterating over the files in group
      for (let j = 0; j < value.length; j++) {
        //console.warn("value: " +value[j].isDirectory + " -- " + value[j].name);        
        if (value[j].isDirectory) {
          if (this.showFoldersInList) {
            this.hasFolderInList = true;
            $groupeContent.append(this.createFolderTile(
              value[j].name,
              value[j].path,
              false
            ));
          }
        } else {
          $groupeContent.append(this.createFileTile(
            value[j].title,
            value[j].path,
            value[j].extension,
            value[j].tags,
            false,
            value[j].meta
          ));
        }
      }
    });

    // Adding event listeners
    $extMainContent.find(".fileTile").each((index, elem) => {
      this.assingFileTileHandlers($(elem));
    });

    $extMainContent.find(".groupTitle").click((event) => {
      $(event.target).find('i').toggleClass("fa-minus-square").toggleClass("fa-plus-square");
    });

    // Enable all buttons
    $(this.extensionID + "IncludeSubDirsButton").prop('disabled', false);

    this.viewContainer.find(".extMainMenu .btn").prop('disabled', false);
    // Disable certain buttons again
    $("#" + this.extensionID + "IncreaseThumbsButton").prop('disabled', true);
    $("#" + this.extensionID + "TagButton").prop('disabled', true);

    if (this.searchResults.length) {
      let fileCount = 0;
      this.searchResults.forEach((entry) => {
        if (!entry.isDirectory) {
          fileCount++;
        }
      });
      if (TSCORE.Search.nextQuery.length > 0) {
        $("#statusBar").text(fileCount + " " +  $.i18n.t("ns.perspectives:filesFoundFor") + " '" + TSCORE.Search.nextQuery + "'");
      } else {
        $("#statusBar").text(fileCount + " " +  $.i18n.t("ns.perspectives:filesFound"));
      }
    }

    Mousetrap.unbind(TSCORE.Config.getSelectAllKeyBinding());
    Mousetrap.bind(TSCORE.Config.getSelectAllKeyBinding(), () => {
      this.toggleSelectAll();
    });

    TSCORE.hideLoadingAnimation();
    $('#viewContainers').trigger('scroll');
  }

  _saveExtSettings() {
    let settings = {
      "showFoldersInList": this.showFoldersInList,
      "showSortDataInList": this.showSortDataInList,
      "zoomFactor": this.zoomFactor,
      "orderBy": this.orderBy
    };
    localStorage.setItem('perpectiveGridSettings', JSON.stringify(settings));
  }

  _loadExtSettings() {
    let extSettings = JSON.parse(localStorage.getItem("perpectiveGridSettings"));
    if (extSettings) {
      if (extSettings.showFoldersInList) {
        this.showFoldersInList = this.extSettings.showFoldersInList;
      }        
      if (extSettings.orderBy) {
        this.orderBy = extSettings.orderBy;
      }
      if (extSettings.showSortDataInList) {
        this.showSortDataInList = extSettings.showSortDataInList;
      }
      if (extSettings.zoomFactor) {
        this.currentZoomState = extSettings.zoomFactor;
      } 
    } 
  }

  _platformTuning() {
    if (TSCORE.isCordova) {
      TSCORE.reLayout();
      $("#" + this.extensionID + "IncludeSubDirsButton").hide();
      $('#' + this.extensionID + 'AddFileButton').hide(); // TODO tmp disabled due not working binary saving
    } else if (TSCORE.isChromeExt) {
      $('#' + this.extensionID + 'AddFileButton').hide();
      $('#' + this.extensionID + 'TagButton').hide();
      $('#' + this.extensionID + 'CopyMoveButton').hide();
      $('#' + this.extensionID + 'CreateDirectoryButton').hide();
      $('#' + this.extensionID + 'DeleteSelectedFilesButton').hide();
    } else if (TSCORE.isFirefoxExt) {
      $('#' + this.extensionID + 'AddFileButton').hide(); // Current impl has 0.5mb limit
    }
  }

  createFileTile(title, filePath, fileExt, fileTags, isSelected, metaObj) {
    let fileParentDir = TSCORE.TagUtils.extractParentDirectoryPath(filePath);
    let fileName = TSCORE.TagUtils.extractFileName(filePath);

    let tmbPath = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    var metaObj = metaObj || {thumbnailPath: ""};

    if (metaObj.thumbnailPath && metaObj.thumbnailPath.length > 2) {
      tmbPath = encodeURI(metaObj.thumbnailPath);
      if (isWin) {
        tmbPath = tmbPath.split('%5C').join('/').split('%3A').join(':');
      }
    }

    let context = {
      filepath: filePath,
      fileext: fileExt,
      title: title,
      coloredExtClass: TSCORE.Config.getColoredFileExtensionsEnabled() ? "fileExtColor" : "",
      tags: [],
      selected: isSelected ? "fa-check-square" : "fa-square-o",
      thumbPath: tmbPath,
      class: this.zoomSteps[this.currentZoomState]
     };

    if (fileTags && fileTags.length > 0) {
      fileTags.forEach((tag) => {
        if((typeof tag) === 'string') {
          context.tags.push({
            tag: tag,
            path: filePath,
            style: TSCORE.generateTagStyle(TSCORE.Config.findTag(tag))
          });
        } else {
          context.tags.push(tag);
        }
      });
    }



    if (metaObj.metaData && metaObj.metaData.tags) {
      metaObj.metaData.tags.forEach((elem) => {
        context.tags.push({
          tag: elem.title,
          filepath: filePath,
          style: elem.style
        });
      });
    }

    return fileTileTmpl(context);
  }

  createFolderTile(name, filePath, isSelected) {
    let context = {
      folderpath: filePath,
      title: name,
      tags: [],
      selected: isSelected ? "fa-check-square" : "fa-square-o",
      class: this.zoomSteps[this.currentZoomState]
    };
    return folderTileTmpl(context);
  }

  initFileGroupingMenu() {
    let suggMenu = $("#" + this.extensionID + "GroupingMenu");
    suggMenu.append($('<li>').append($('<a>', {
        title: $.i18n.t("ns.perspectives:ungroupTitle"),
        "data-dismiss": "modal",
        class: "btn btn-link transformation-none",
        text: $.i18n.t("ns.perspectives:ungroup")
      }).prepend("<i class='fa fa-times-circle'></i>").click(() => {
        this.switchGrouping("");
      })
    ));

    // Adding context menu entries according to the taggroups
    for (let i = 0; i < this.supportedGroupings.length; i++) {
      suggMenu.append($('<li>').append($('<button>', {
          text: $.i18n.t("ns.perspectives:groupBy") + " " + this.supportedGroupings[i].title,
          "data-dismiss": "modal",
          class: "btn btn-link transformation-none",
          key: this.supportedGroupings[i].key,
          group: this.supportedGroupings[i].title
        }).prepend("<i class='fa fa-group fa-fw'></i>&nbsp;&nbsp;&nbsp;").click((event) => {
          this.switchGrouping($(event.target).attr("key"));
        }) // jshint ignore:line
      ));
    }
  }

  switchGrouping(grouping) {
    this.currentGrouping = grouping;
    //TSCORE.startTime = new Date().getTime(); 
    this.reInit();
  }

  calculateGroupTitle(rawSource) {
    let groupingTitle = "No Grouping";
    let tmpDate;
    switch (this.currentGrouping) {
      case "day":
        tmpDate = new Date(rawSource.lmdt);
        tmpDate.setHours(0, 0, 0, 0);
        groupingTitle = TSCORE.TagUtils.formatDateTime(tmpDate, false);
        break;
      case "month":
        tmpDate = new Date(rawSource.lmdt);
        tmpDate.setHours(0, 0, 0, 0);
        tmpDate.setDate(1);
        groupingTitle = MONTH[tmpDate.getMonth()] + ", " + tmpDate.getFullYear();
        break;
      case "year":
        tmpDate = new Date(rawSource.lmdt);
        tmpDate.setHours(0, 0, 0, 0);
        tmpDate.setDate(1);
        tmpDate.setMonth(1);
        groupingTitle = tmpDate.getFullYear();
        break;
      default:
        for (let i = 0; i < TSCORE.Config.Settings.tagGroups.length; i++) {
          if (TSCORE.Config.Settings.tagGroups[i].key === this.currentGrouping) {
            let tagsInGroup = _.pluck(TSCORE.Config.Settings.tagGroups[i].children, "title");
            let matchedTags = _.intersection(
              rawSource.tags,
              tagsInGroup
            );
            groupingTitle = "not grouped";
            if (matchedTags.length > 0) {
              groupingTitle = TSCORE.Config.Settings.tagGroups[i].title + " - " + matchedTags[0];
            }
            break;
          }
        }
    }
    return groupingTitle;
  }

  // Helper function for organizing the files in data buckets
  calculateGrouping(data) {
    switch (this.currentGrouping) {
      case "day":
        data = _.groupBy(data, (value) => {
          let tmpDate = new Date(value.lmdt);
          tmpDate.setHours(0, 0, 0, 0);
          return tmpDate.getTime();
        });
        break;
      case "month":
        data = _.groupBy(data, (value) => {
          let tmpDate = new Date(value.lmdt);
          tmpDate.setHours(0, 0, 0, 0);
          tmpDate.setDate(1);
          return tmpDate.getTime();
        });
        break;
      case "year":
        data = _.groupBy(data, (value) => {
          let tmpDate = new Date(value.lmdt);
          tmpDate.setHours(0, 0, 0, 0);
          tmpDate.setDate(1);
          tmpDate.setMonth(1);
          return tmpDate.getTime();
        });
        break;
      default:
        let grouped = false;
        this.supportedGroupings.forEach((grouping) => {
          if (grouping.key === this.currentGrouping) {
            data = _.groupBy(data, (value) => {
              let tagGroup = TSCORE.Config.getTagGroupData(grouping.key);
              for (let i = 0; i < tagGroup.children.length; i++) {
                for (let j = 0; j < value.tags.length; j++) {
                  if (tagGroup.children[i].title === value.tags[j]) {
                    return tagGroup.children[i].title;
                  }
                }
              }
            });
            grouped = true;
          }
        });
        if (!grouped) {
          data = _.groupBy(data, () => {
            return true;
          });
        }
        break;
    }

    // Sort groups by name(alphabetical order)
    data = _(data).chain().sortBy((data) => {
      return data[0].tags[0];
    }).value();

    return data;
  }

  setThumbnail(uiElement) {
    if (TSCORE.Utils.isVisibleOnScreen(uiElement) && (uiElement.style.backgroundImage.indexOf("image/gif") > 0)) {
      let filePath = $(uiElement).data('path');
      TSCORE.Meta.loadThumbnailPromise(filePath).then((url) => {
        uiElement.style.backgroundImage = "url('" + url + "')";
      });
    }
  }

  assingFileTileHandlers($fileTile) {
    let path = $fileTile.data("path");
    let isFile = $fileTile.data("isfile");

    $fileTile.hammer().on("doubletap", () => { 
    //$fileTile.dblclick(() => {
      return false;
    }).on('click', () => {
      if (isFile) {
        TSCORE.FileOpener.openFile(path);
        this.selectFile(path);
      } else {
        TSCORE.navigateToDirectory(path);
      }
    }).droppable({
      accept: ".tagButton",
      hoverClass: "activeRow",
      drop: (event, ui) => {
        let tagName = TSCORE.selectedTag;
        let targetFilePath = path;

        // preventing self drag of tags
        let targetTags = TSCORE.TagUtils.extractTags(targetFilePath);
        for (let i = 0; i < targetTags.length; i++) {
          if (targetTags[i] === tagName) {
            return true;
          }
        }

        console.log("Tagging file: " + tagName + " to " + targetFilePath);
        $(event.target).toggleClass("ui-selected");
        TSCORE.PerspectiveManager.clearSelectedFiles();
        TSCORE.selectedFiles.push(targetFilePath);
        TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [tagName]);
        this.handleElementActivation();

        $(ui.helper).remove();
      }
    });

    $fileTile.find(".fileInfoArea").on('click', (evet) => {
      evet.preventDefault();
      if (isFile) {
        let $stateTag = $(evet.target).find("i");
        if ($stateTag.hasClass("fa-square-o")) {
          $stateTag.removeClass("fa-square-o").addClass("fa fa-check-square");
          $(evet.target).parent().addClass("ui-selected");
          TSCORE.selectedFiles.push(path);
        } else {
          $stateTag.removeClass("fa-check-square").addClass("fa-square-o");
          $(evet.target).parent().removeClass("ui-selected");
          TSCORE.selectedFiles.splice(TSCORE.selectedFiles.indexOf(path), 1);
        }
        this.selectedIsFolderArr[path] = false;
        this.handleElementActivation();
      } else {
        TSCORE.navigateToDirectory(path);
      }
      return false;
    }).draggable({
      "cancel": false,
      "zIndex": 10000,
      "appendTo": "body",
      "helper": "clone",
      "opacity": "0.5",
      "revert": true,
      "start": () => {
        if (isFile) {
          this.selectFile(path);
        } else {
          return false;
        }
      }
    });

    $fileTile.find(".fileTagsTile").draggable({
       "cancel": false,
       "appendTo": "body",
       "helper": "clone",
       "revert": true,
       "start": (event) => {
         TSCORE.selectedTag = $(event.target).data("tag");
         this.selectFile(path);
       }
    });
  }

  clearSelectedFiles() {
    TSCORE.selectedFiles = [];
    $("#" + this.extensionID + "Container").find(".ui-selected").removeClass("ui-selected");
    $("#" + this.extensionID + "Container").find(".fileTileSelector i").removeClass("fa-check-square").addClass("fa-square-o");
    //this.handleElementActivation()  // TODO enable
  }

  selectFile(filePath) {
    this.selectedIsFolderArr = [];
    TSCORE.PerspectiveManager.clearSelectedFiles();
    this.viewContainer.find('.fileTile').each((index, elem) => {
      let path = $(elem).data("path");
      let isFile = $(elem).data("isfile");
      if (path === filePath) {
        $(elem).toggleClass("ui-selected");
        $(elem).find(".fileTileSelector i").toggleClass("fa-check-square").toggleClass("fa-square-o");
        this.selectedIsFolderArr[path] = !isFile;

        if (!TSCORE.Utils.isVisibleOnScreen(elem)) {
          $("#viewContainers").animate({
            scrollTop: $(elem).offset().top - $("#perspectiveGridContainer").offset().top // $(elem).height()
          }, 100);
        }
      }
    });
    TSCORE.selectedFiles.push(filePath);
    this.handleElementActivation();
  }

  toggleSelectAll() {
    let checkIcon = $("#" + this.extensionID + "ToogleSelectAll").find("i");
    if (checkIcon.hasClass("fa-square-o")) {
      TSCORE.selectedFiles = [];
      $(this.viewContainer).find('.fileTileSelector').each((index, elem) => {
        let fileTile = $(elem).parent().parent();
        if (fileTile.data("isfile")) {
          fileTile.addClass("ui-selected");
          $(elem).find("i").addClass("fa-check-square").removeClass("fa-square-o");
          TSCORE.selectedFiles.push(fileTile.data("path"));
        } else {
          fileTile.removeClass("ui-selected");
          $(elem).find("i").removeClass("fa-check-square").addClass("fa-square-o");
        }
      });
    } else {
      TSCORE.PerspectiveManager.clearSelectedFiles();
    }
    this.handleElementActivation();
    checkIcon.toggleClass("fa-check-square");
    checkIcon.toggleClass("fa-square-o");
  }

  handleElementActivation() {
    console.log("Entering element activation handler...");

    let tagButton = $("#" + this.extensionID + "TagButton");
    let copyMoveButton = $("#" + this.extensionID + "CopyMoveButton");
    let deleteSelectedFilesButton = $("#" + this.extensionID + "DeleteSelectedFilesButton");

    let isFolderInSelection = false;

    if (this.hasFolderInList) {
      for (let inx = 0; inx < TSCORE.selectedFiles.length; inx++) {
        if (this.selectedIsFolderArr[TSCORE.selectedFiles[inx]]) {
          isFolderInSelection = true;
          break;
        }
      }
    }

    if (TSCORE.selectedFiles.length >= 1 && !isFolderInSelection) {
      tagButton.parent().removeClass("disabled");
      copyMoveButton.parent().removeClass("disabled");
      deleteSelectedFilesButton.parent().removeClass("disabled");
    } else {
      tagButton.parent().addClass("disabled");
      copyMoveButton.parent().addClass("disabled");
      deleteSelectedFilesButton.parent().addClass("disabled");
    }
  }

  removeFileUI(filePath) {
    console.log("Removing " + filePath + " from UI");

    // Updating the file selection
    TSCORE.selectedFiles.splice(TSCORE.selectedFiles.indexOf(filePath), 1);

    if (isWin && !isWeb) {
      filePath = filePath.replace("/\//g", "");
      this.viewContainer.find(".fileTile").each((index, elem) => {
        if ($(elem).data("path").replace("/\//g", "") === filePath) {
          $(elem).remove();
        }
      });
    } else {
      this.viewContainer.find(".fileTile[data-path='" + filePath + "']").remove();
    }
  }

  updateFileUI(oldFilePath, newFilePath) {
    console.log("Updating file in UI");

    // Updating the file selection
    if (oldFilePath !== newFilePath) {
      TSCORE.selectedFiles.splice(TSCORE.selectedFiles.indexOf(oldFilePath), 1);
      TSCORE.selectedFiles.push(newFilePath);
    }

    let title = TSCORE.TagUtils.extractTitle(newFilePath);
    let fileExt = TSCORE.TagUtils.extractFileExtension(newFilePath);
    let fileTags = TSCORE.TagUtils.extractTags(newFilePath);
    let parentFolderNewFile = TSCORE.TagUtils.extractParentDirectoryPath(newFilePath);
    let newFileName = TSCORE.TagUtils.extractFileName(newFilePath);

    let $fileTile;
    let attrFilePath;

    if (isWin && !isWeb) {
      oldFilePath = oldFilePath.replace("/\//g", "");
      this.viewContainer.find(".fileTile").each((index, elem) => {
        attrFilePath = $(elem).data("path");
        if (attrFilePath.replace("/\//g", "") === oldFilePath) {
          $fileTile = $(elem);
        }
      });
    } else {
      $fileTile = this.viewContainer.find(".fileTile[data-path='" + oldFilePath + "']");
    }

    let metaObj = TSCORE.Meta.findMetaObjectFromFileList(oldFilePath);
    if (!metaObj) {
      metaObj = {};
      metaObj.thumbnailPath = parentFolderNewFile + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + newFileName + TSCORE.thumbFileExt;
    }
    $fileTile.replaceWith(this.createFileTile(title, newFilePath, fileExt, fileTags, true, metaObj));

    if (isWin && !isWeb) {
      newFilePath = newFilePath.replace("/\//g", "");
      this.viewContainer.find(".fileTile").each((index, elem) => {
        attrFilePath = $(elem).data("path");
        if (attrFilePath.replace("/\//g", "") === newFilePath) {
          $fileTile = $(elem);
        }
      });
    } else {
      $fileTile = this.viewContainer.find(".fileTile[data-path='" + newFilePath + "']");
    }

    TSCORE.Meta.loadThumbnailPromise(newFilePath).then((url) => {
      $fileTile.children('.thumbnailArea').attr("style", "background-image: url('" + url + "')");
    });

    this.assingFileTileHandlers($fileTile);
  }

  getNextFile(filePath) {
    let nextFilePath;
    let indexNonDirectory = [];

    this.searchResults.forEach((entry) => {
      if (!entry.isDirectory) {
        indexNonDirectory.push(entry);
      }
    });

    indexNonDirectory.forEach((entry, index) => {
      if (entry.path === filePath) {
        let nextIndex = index + 1;
        if (nextIndex < indexNonDirectory.length) {
          nextFilePath = indexNonDirectory[nextIndex].path;
        } else {
          nextFilePath = indexNonDirectory[0].path;
        }
      }
    });

    TSCORE.PerspectiveManager.clearSelectedFiles();
    console.log("Next file: " + nextFilePath);
    return nextFilePath;
  }

  getPrevFile(filePath) {
    let prevFilePath;
    let indexNonDirectory = [];

    this.searchResults.forEach((entry) => {
      if (!entry.isDirectory) {
        indexNonDirectory.push(entry);
      }
    });

    indexNonDirectory.forEach((entry, index) => {
      if (entry.path === filePath) {
        let prevIndex = index - 1;
        if (prevIndex >= 0) {
          prevFilePath = indexNonDirectory[prevIndex].path;
        } else {
          prevFilePath = indexNonDirectory[indexNonDirectory.length - 1].path;
        }
      }
    });

    TSCORE.PerspectiveManager.clearSelectedFiles();
    console.log("Prev file: " + prevFilePath);
    return prevFilePath;
  }

  showFoldersInListCheckbox() {
    this.showFoldersInList = true;
    TSCORE.navigateToDirectory(TSCORE.currentPath);
    this._saveExtSettings();
    $("#" + this.extensionID + "hideFoldersInListCheckbox").show();
    $("#" + this.extensionID + "showFoldersInListCheckbox").hide();
  }

  hideFoldersInListCheckbox() {
    this.showFoldersInList = false;
    TSCORE.navigateToDirectory(TSCORE.currentPath);
    this._saveExtSettings();
    $("#" + this.extensionID + "hideFoldersInListCheckbox").hide();
    $("#" + this.extensionID + "showFoldersInListCheckbox").show();
  }

  sortByCriteria(criteria, orderBy) {
    function sortByName(a, b) {
      if (!a.name) {
        a.name = "";
      }
      if (!b.name) {
        b.name = "";
      }
      if (orderBy) {
        return (b.isDirectory - a.isDirectory) || (a.name.toString().localeCompare(b.name));
      } else {
        return (b.isDirectory - a.isDirectory) || (b.name.toString().localeCompare(a.name));
      }
    }

    function sortByIsDirectory(a, b) {
      if (b.isDirectory && a.isDirectory) {
        return 0;
      }
      //if (orderBy) {
      return a.isDirectory && !b.isDirectory ? -1 : 1;
      //} else {
      //  return a.isDirectory && !b.isDirectory ? 1 : -1;
      //}
    }

    function sortBySize(a, b) {
      if (orderBy) {
        return (b.isDirectory - a.isDirectory) || (a.size - b.size);
      } else {
        return (b.isDirectory - a.isDirectory) || (b.size - a.size);
      }
    }

    function sortByDateModified(a, b) {
      if (orderBy) {
        return (b.isDirectory - a.isDirectory) || (a.lmdt - b.lmdt);
      } else {
        return (b.isDirectory - a.isDirectory) || (b.lmdt - a.lmdt);
      }
    }

    function sortByExtension(a, b) {
      if (orderBy) {
        return (b.isDirectory - a.isDirectory) || (a.extension.toString().localeCompare(b.extension));
      } else {
        return (b.isDirectory - a.isDirectory) || (b.extension.toString().localeCompare(a.extension));
      }
    }

    function sortByTagCount(a, b) {
      if (orderBy) {
        return (b.isDirectory - a.isDirectory) || (a.tags.length - b.tags.length);
      } else {
        return (b.isDirectory - a.isDirectory) || (b.tags.length - a.tags.length);
      }
    }

    switch (criteria) {
      case "byDirectory":
        this.searchResults = this.searchResults.sort(sortByIsDirectory);
        if (this.showFoldersInList && this.searchResults.length > 0 && this.searchResults[0].isDirectory) { //sort by isDirectory and next by names only if in list have folders
          let arrFolders = [], arrFiles = [];
          for (let inx = 0; inx < this.searchResults.length; inx++) {
            if (this.searchResults[inx].isDirectory) {
              arrFolders.push(this.searchResults[inx]);
            } else {
              arrFiles.push(this.searchResults[inx]);
            }
          }
          arrFolders = arrFolders.sort(sortByName);
          arrFiles = arrFiles.sort(sortByName);
          this.searchResults = arrFolders.concat(arrFiles);
        }
        break;
      case "byName":
        this.searchResults = this.searchResults.sort(sortByName);
        break;
      case "byFileSize":
        this.searchResults = this.searchResults.sort(sortBySize);
        break;
      case "byDateModified":
        this.searchResults = this.searchResults.sort(sortByDateModified);
        break;
      case "byExtension":
        this.searchResults = this.searchResults.sort(sortByExtension);
        break;
      case "byTagCount":
        this.searchResults = this.searchResults.sort(sortByTagCount);
        break;
      default:
        this.searchResults = this.searchResults.sort(sortByIsDirectory);
    }
  }

  initFileSortingMenu() {
    let suggMenuAscending = $("#" + this.extensionID + "SortingMenuAscending");
    let suggMenuDescending = $("#" + this.extensionID + "SortingMenuDescending");
    //Adding context menu
    for (let i = 0; i < this.supportedSortings.length; i++) {
      suggMenuAscending.append($('<li>').append($('<button>', {
          text: this.supportedSortings[i].title + " " + $.i18n.t("ns.perspectives:ascending"),
          "data-dismiss": "modal",
          class: "btn btn-link transformation-none",
          key: this.supportedSortings[i].key,
          group: this.supportedSortings[i].title
        }).prepend("<i class='fa fa-sort-amount-asc fa-fw'></i>&nbsp;&nbsp;").click((event) => {
          $("#" + this.extensionID + "SortingButton").attr("title", " Sort by " + $(event.target).attr("sort") + " ").text(" " + $(event.target).attr("sort") + " ").prepend("<i class='fa fa-group fa-fw' />").append("<span class='caret'></span>");
          this.orderBy = true;
          this.showSortDataInList = $(event.target).attr("key");
          this._saveExtSettings();
          this.sortByCriteria($(event.target).attr("key"), this.orderBy);
          this.reInit();
        }) // jshint ignore:line
      ));
      suggMenuDescending.append($('<li>').append($('<button>', {
          text: this.supportedSortings[i].title + " " + $.i18n.t("ns.perspectives:descending"),
          "data-dismiss": "modal",
          class: "btn btn-link transformation-none",
          key: this.supportedSortings[i].key,
          group: this.supportedSortings[i].title
        }).prepend("<i class='fa fa-sort-amount-desc fa-fw'></i>&nbsp;&nbsp;").click((event) => {
          $("#" + this.extensionID + "SortingButton").attr("title", " Sort by " + $(event.target).attr("sort") + " ").text(" " + $(event.target).attr("sort") + " ").prepend("<i class='fa fa-group fa-fw' />").append("<span class='caret'></span>");
          this.orderBy = false;
          this.showSortDataInList = $(event.target).attr("key");
          this._saveExtSettings();
          this.sortByCriteria($(event.target).attr("key"), this.orderBy);
          this.reInit();
        }) // jshint ignore:line
      ));
    }
  }

  setReadOnly() {
    $(document).off('drop dragend dragenter dragover dragleave', (event) => {
      event.preventDefault();
    });
  }
}

exports.GridPerspective = GridPerspective;
// Public: init, load, clearSelectedFiles, getNextFile, getPrevFile, selectFile, removeFileUI, updateFileUI, setReadOnly
});
