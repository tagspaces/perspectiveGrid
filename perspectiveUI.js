/* Copyright (c) 2013-2016 The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* global define, Handlebars, isWin, Mousetrap, _  */
define(function(require, exports, module) {
  "use strict";

  console.log("Loading UI for perspectiveDefault");

  var TSCORE = require("tscore");

  var MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var selectedIsFolderArr = [];
  var showFoldersInList = false;
  var hasFolderInList = false;
  var showSortDataInList = 'byDirectory';
  var orderBy, numberOfFiles;
  var zoomFactor;
  var extSettings;
  loadExtSettings();

  if (extSettings && extSettings.showFoldersInList) {
    showFoldersInList = extSettings.showFoldersInList;
  }

  if (extSettings && extSettings.orderBy) {
    orderBy = extSettings.orderBy;
  }

  if (extSettings && extSettings.showSortDataInList) {
    showSortDataInList = extSettings.showSortDataInList;
  }

  var zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
  var currentZoomState = 3;
  if (extSettings && extSettings.zoomFactor) {
    currentZoomState = extSettings.zoomFactor;
  }

  //save settings for perpectiveGrid
  function saveExtSettings() {
    var settings = {
      "showFoldersInList": showFoldersInList,
      "showSortDataInList": showSortDataInList,
      "numberOfFiles": numberOfFiles,
      "zoomFactor": zoomFactor,
      "orderBy": orderBy
    };
    localStorage.setItem('perpectiveGridSettings', JSON.stringify(settings));
  }

  //load settings for perpectiveGrid
  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem("perpectiveGridSettings"));
  }

  function ExtUI(extID) {
    this.extensionID = extID;
    this.viewContainer = $("#" + this.extensionID + "Container");
    this.viewContainer.empty();

    this.currentGrouping = ""; // tagchain, day, month, year
    this.thumbEnabled = false;
    this.currentTmbSize = 0;
    this.searchResults = [];
    this.supportedGroupings = [];
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

    this.supportedGroupings.push({
      "title": "Day",
      "key": "day"
    });
    this.supportedGroupings.push({
      "title": "Month",
      "key": "month"
    });
    this.supportedGroupings.push({
      "title": "Year",
      "key": "year"
    });

    for (var i = 0; i < TSCORE.Config.Settings.tagGroups.length; i++) {
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

  var fileTileTmpl = Handlebars.compile(
    '<div title="{{filepath}}" data-path="{{filepath}}" data-isfile="true" class="fileTile {{class}}">' +
      '<div class="thumbnailArea" data-path="{{filepath}}" style="background-image: url(\'{{thumbPath}}\')">' +
        '<div class="tagsInFileTile">' +
        '{{#each tags}}' +
          '<button class="btn btn-sm tagButton fileTagsTile" data-tag="{{tag}}" data-path="{{filepath}}" style="{{style}}">{{tag}}</button>' +
        '{{/each}}' +
        '</div>' +
      '</div>' +
      '<div class="fileInfoArea" filepath="{{filepath}}">' +
        '<button class="btn btn-link fileTileSelector {{coloredExtClass}}" data-ext="{{fileext}}" >' +
          '<i class="fa {{selected}} fa-fw fa-lg"></i><span class="fileExtTile">{{fileext}}</span>' +
        '</button>' +
        '<div class="titleInFileTile">{{title}}</div>' +
      '</div>' +
    '</div>'
  );

  var folderTileTmpl = Handlebars.compile(
    '<div title="{{folderpath}}" data-path="{{folderpath}}" data-isfile="false" class="fileTile {{class}}">' +
      '<div class="thumbnailArea" style="background-image: url(\'{{thumbPath}}\')">' +
      '</div>' +
      '<div class="fileInfoArea">' +
        '<button class="btn btn-link fileTileSelector {{coloredExtClass}}" data-ext="folder" data-path="{{folderpath}}">' +
          '<i class="fa fa-folder-o fa-lg"></i>' +
        '</button>' +
        '<div class="titleInFileTile">{{title}}</div>' +
      '</div>' +
    '</div>'
  );

  var mainLayoutTemplate = Handlebars.compile(
    '<div class="extMainContent accordion">' +
    '{{#each groups}}' +
      '<div class="accordion-group disableTextSelection" style="width: 100%; border: 0px #aaa solid;">' +
      '{{#if ../moreThanOneGroup}}' +
        '<div class="accordion-heading btn-group" style="width:100%; margin: 0px; border-bottom: solid 1px #eee; background-color: #f0f0f0;">' +
          '<button class="btn btn-link groupTitle" data-toggle="collapse" data-target="#{{../../id}}SortingButtons{{@index}}">' +
            '<i class="fa fa-minus-square">&nbsp;</i>' +
          '</button>' +
          '<span class="btn btn-link groupTitle" id="{{../../id}}HeaderTitle{{@index}}" style="margin-left: 0px; padding-left: 0px;"></span>' +
        '</div>' +
      '{{/if}}' +
      '<div class="accordion-body collapse in" id="{{../id}}SortingButtons{{@index}}" style="margin: 0px 0px 0px 3px; border: 0px;">' +
        '<div class="accordion-inner tileContainer" id="{{../id}}GroupContent{{@index}}"></div>' +
      '</div>' +
    '</div>' +
    '{{else}}' +
      '<p style="margin: 5px; font-size: 13px; text-align: center;">Directory does not contain any files or is currently being analysed.</p>' +
    '{{/each}}' +
      '<div id="gridShowAllFilesContainer">' +
        '<button class="btn btn-primary" id="gridShowAllFilesButton">Show all files</button>' +
      '</div>' +
    '</div>'
  );

  ExtUI.prototype.buildUI = function(toolbarTemplate) {
    console.log("Init UI module");

    var self = this;
    this.viewContainer.append(toolbarTemplate({id: this.extensionID}));

    $("#" + this.extensionID + "ToogleSelectAll").on("click", function() {
      self.toggleSelectAll();
    });

    $("#" + this.extensionID + "CreateFileButton").on("click", function() {
      TSCORE.showFileCreateDialog();
    });

    var $showFoldersInList = $("#" + this.extensionID + "showFoldersInListCheckbox");
    $showFoldersInList.on("click", function(evt) {
      self.showFoldersInListCheckbox();
    });

    var $hideFoldersInList = $("#" + this.extensionID + "hideFoldersInListCheckbox");
    $hideFoldersInList.on("click", function(evt) {
      self.hideFoldersInListCheckbox();
    });

    if (showFoldersInList) {
      $hideFoldersInList.show();
      $showFoldersInList.hide();
    } else {
      $hideFoldersInList.hide();
      $showFoldersInList.show();
    }

    $('#orderBy input').on('change', function() {
      if (this.value === 'ascending') {
        orderBy = true;
      } else if (this.value === 'descending') {
        orderBy = false;
      }
    });

    $("#modal_button_ok").on("click", function(evt) {
      TSCORE.navigateToDirectory(TSCORE.currentPath);
    });

    $("#" + this.extensionID + "CreateDirectoryButton").on("click", function() {
      TSCORE.showCreateDirectoryDialog(TSCORE.currentPath);
    });

    $("#" + this.extensionID + "IncludeSubDirsButton").on("click", function() {
      TSCORE.IOUtils.createDirectoryIndex(TSCORE.currentPath);
    });

    $("#" + this.extensionID + "TagButton").on("click", function() {
      if ($(this).parent().hasClass("disabled")) {
        return false;
      }
      TSCORE.showAddTagsDialog();
    });

    $("#" + this.extensionID + "CopyMoveButton").on("click", function() {
      if ($(this).parent().hasClass("disabled")) {
        return false;
      }
      TSCORE.showMoveCopyFilesDialog();
    });

    $("#" + this.extensionID + "DeleteSelectedFilesButton").on("click", function() {
      if ($(this).parent().hasClass("disabled")) {
        return false;
      } else {
        TSCORE.UI.showDeleteFilesDialog();
      }
    });

    $("#" + this.extensionID + "MainDropUp").on('click', function() {
      TSCORE.hideAllDropDownMenus();
    });

    $("#increasingThumbnails").on('click', function(e) {
      e.stopPropagation();
      $('#perspectiveGridSortingButtons0').find('.fileTile').each(function() {
        if ($(".fileTile").hasClass(zoomSteps[currentZoomState])) {
          $("div.fileTile.ui-droppable").removeClass(zoomSteps[currentZoomState]);
        }
      });
      currentZoomState++;
      if (currentZoomState >= zoomSteps.length) {
        currentZoomState = 6;
      }
      zoomFactor = currentZoomState;
      $('.fileTile').addClass(zoomSteps[currentZoomState]);
      saveExtSettings();
    });

    $("#decreasingThumbnails").on('click', function(e) {
      e.stopPropagation();
      $('#perspectiveGridSortingButtons0').find('.fileTile').each(function() {
        if ($(".fileTile").hasClass(zoomSteps[currentZoomState])) {
          $("div.fileTile.ui-droppable").removeClass(zoomSteps[currentZoomState]);
        }
      });
      currentZoomState--;
      if (currentZoomState < 0) {
        currentZoomState = 0;
      }
      zoomFactor = currentZoomState;
      $('.fileTile').addClass(zoomSteps[currentZoomState]);
      saveExtSettings();
    });

    this.initFileGroupingMenu();
    this.initFileSortingMenu();

    $('#viewContainers').on('scroll', _.debounce(function() { // Triggering thumbnails generation
      $('#viewContainers').find(".thumbnailArea").each(function() {
        self.setThumbnail(this);
      });
    }, 500));

  };

  ExtUI.prototype.reInit = function(showAllResult) {
    var self = this;
    var shouldShowAllFilesContainer;

    this.viewContainer.find('.extMainContent').remove();

    var $extMainContent = this.viewContainer.find(".extMainContent");
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
    if (orderBy === undefined) {
      self.sortByCriteria('byName', true);
    } else {
      self.sortByCriteria(showSortDataInList, orderBy);
    }

    var fileGroups = self.calculateGrouping(this.searchResults);

    var moreThanOneGroup = (fileGroups.length > 1) ? true : false;

    this.viewContainer.append(mainLayoutTemplate({
      id: self.extensionID,
      groups: fileGroups,
      moreThanOneGroup: moreThanOneGroup
    }));

    shouldShowAllFilesContainer ? $("#gridShowAllFilesContainer").show() : $("#gridShowAllFilesContainer").hide();

    $('#gridShowAllFilesButton').on("click", function() {
      self.reInit(true);
    });

    this.viewContainer.on("contextmenu", ".fileTile", function(e) {
      var selEl = $(this).parent().find(".fileTitle button");
      e.preventDefault();
      TSCORE.hideAllDropDownMenus();
      TSCORE.PerspectiveManager.clearSelectedFiles();
      self.selectFile($(this).data("path"));
      TSCORE.showContextMenu("#fileMenu", $(this));
      return false;
    });

    $extMainContent = this.viewContainer.find(".extMainContent");

    var $groupeContent;
    var $groupeTitle;

    _.each(fileGroups, function(value, index) {
      $groupeContent = $("#" + self.extensionID + "GroupContent" + index);
      $groupeTitle = $("#" + self.extensionID + "HeaderTitle" + index);

      var groupingTitle = self.calculateGroupTitle(value[0]);
      $groupeTitle.text(groupingTitle);

      // Sort the files in group by name
      /*
       value = _.sortBy(value, function(entry) {
       return entry.name;
       });
       */

      // Iterating over the files in group
      for (var j = 0; j < value.length; j++) {
        //console.warn("value: " +value[j].isDirectory + " -- " + value[j].name);        
        if (value[j].isDirectory) {
          if (showFoldersInList) {
            hasFolderInList = true;
            $groupeContent.append(self.createFolderTile(
              value[j].name,
              value[j].path,
              false
            ));
          }
        } else {
          $groupeContent.append(self.createFileTile(
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
    $extMainContent.find(".fileTile").each(function() {
      self.assingFileTileHandlers($(this));
    });

    $extMainContent.find(".groupTitle").click(function() {
      $(this).find('i').toggleClass("fa-minus-square").toggleClass("fa-plus-square");
    });

    // Enable all buttons
    $(this.extensionID + "IncludeSubDirsButton").prop('disabled', false);

    this.viewContainer.find(".extMainMenu .btn").prop('disabled', false);
    // Disable certain buttons again
    $("#" + this.extensionID + "IncreaseThumbsButton").prop('disabled', true);
    $("#" + this.extensionID + "TagButton").prop('disabled', true);

    if (this.searchResults.length) {
      var fileCount = 0;
      this.searchResults.forEach(function(entry) {
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
    Mousetrap.bind(TSCORE.Config.getSelectAllKeyBinding(), function() {
      self.toggleSelectAll();
    });

    TSCORE.hideLoadingAnimation();
    $('#viewContainers').trigger('scroll');
  };

  ExtUI.prototype.createFileTile = function(title, filePath, fileExt, fileTags, isSelected, metaObj) {
    var fileParentDir = TSCORE.TagUtils.extractParentDirectoryPath(filePath);
    var fileName = TSCORE.TagUtils.extractFileName(filePath);

    var tmbPath = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    var metaObj = metaObj || {thumbnailPath: ""};

    if (metaObj.thumbnailPath && metaObj.thumbnailPath.length > 2) {
      tmbPath = encodeURI(metaObj.thumbnailPath);
      if (isWin) {
        tmbPath = tmbPath.split('%5C').join('/').split('%3A').join(':');
      }
    }

    var context = {
      filepath: filePath,
      fileext: fileExt,
      title: title,
      coloredExtClass: TSCORE.Config.getColoredFileExtensionsEnabled() ? "fileExtColor" : "",
      tags: [],
      selected: isSelected ? "fa-check-square" : "fa-square-o",
      thumbPath: tmbPath,
      class: zoomSteps[currentZoomState]
     };

    if (fileTags.length > 0) {
      var tagString = "" + fileTags;
      var tags = tagString.split(",");

      for (var i = 0; i < tags.length; i++) {
        context.tags.push({
          tag: tags[i],
          filepath: filePath,
          style: TSCORE.generateTagStyle(TSCORE.Config.findTag(tags[i]))
        });
      }
    }

    if (metaObj.metaData && metaObj.metaData.tags) {
      metaObj.metaData.tags.forEach(function(elem) {
        context.tags.push({
          tag: elem.title,
          filepath: filePath,
          style: elem.style
        });
      });
    }

    return fileTileTmpl(context);
  };

  ExtUI.prototype.createFolderTile = function(name, filePath, isSelected) {
    var context = {
      folderpath: filePath,
      title: name,
      tags: [],
      selected: isSelected ? "fa-check-square" : "fa-square-o",
      class: zoomSteps[currentZoomState]
    };
    return folderTileTmpl(context);
  };

  ExtUI.prototype.initFileGroupingMenu = function() {
    var self = this;

    var suggMenu = $("#" + self.extensionID + "GroupingMenu");
    suggMenu.append($('<li>').append($('<a>', {
        title: $.i18n.t("ns.perspectives:ungroupTitle"),
        "data-dismiss": "modal",
        class: "btn btn-link transformation-none",
        text: $.i18n.t("ns.perspectives:ungroup")
      }).prepend("<i class='fa fa-times-circle'></i>").click(function() {
        self.switchGrouping("");
      })
    ));

    // Adding context menu entries according to the taggroups
    for (var i = 0; i < self.supportedGroupings.length; i++) {
      suggMenu.append($('<li>').append($('<button>', {
          text: $.i18n.t("ns.perspectives:groupBy") + " " + self.supportedGroupings[i].title,
          "data-dismiss": "modal",
          class: "btn btn-link transformation-none",
          key: self.supportedGroupings[i].key,
          group: self.supportedGroupings[i].title
        }).prepend("<i class='fa fa-group fa-fw'></i>&nbsp;&nbsp;&nbsp;").click(function() {
          self.switchGrouping($(this).attr("key"));
        }) // jshint ignore:line
      ));
    }
  };

  ExtUI.prototype.switchGrouping = function(grouping) {
    this.currentGrouping = grouping;
    //TSCORE.startTime = new Date().getTime(); 
    this.reInit();
  };

  ExtUI.prototype.calculateGroupTitle = function(rawSource) {
    var groupingTitle = "No Grouping";
    var self = this;
    var tmpDate;
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
        for (var i = 0; i < TSCORE.Config.Settings.tagGroups.length; i++) {
          if (TSCORE.Config.Settings.tagGroups[i].key === self.currentGrouping) {
            var tagsInGroup = _.pluck(TSCORE.Config.Settings.tagGroups[i].children, "title");
            var matchedTags = _.intersection(
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
  };

  // Helper function for organizing the files in data buckets
  ExtUI.prototype.calculateGrouping = function(data) {
    var self = this;
    switch (this.currentGrouping) {
      case "day":
        data = _.groupBy(data, function(value) {
          var tmpDate = new Date(value.lmdt);
          tmpDate.setHours(0, 0, 0, 0);
          return tmpDate.getTime();
        });
        break;
      case "month":
        data = _.groupBy(data, function(value) {
          var tmpDate = new Date(value.lmdt);
          tmpDate.setHours(0, 0, 0, 0);
          tmpDate.setDate(1);
          return tmpDate.getTime();
        });
        break;
      case "year":
        data = _.groupBy(data, function(value) {
          var tmpDate = new Date(value.lmdt);
          tmpDate.setHours(0, 0, 0, 0);
          tmpDate.setDate(1);
          tmpDate.setMonth(1);
          return tmpDate.getTime();
        });
        break;
      default:
        var grouped = false;
        this.supportedGroupings.forEach(function(grouping) {
          if (grouping.key === self.currentGrouping) {
            data = _.groupBy(data, function(value) {
              var tagGroup = TSCORE.Config.getTagGroupData(grouping.key);
              for (var i = 0; i < tagGroup.children.length; i++) {
                for (var j = 0; j < value.tags.length; j++) {
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
          data = _.groupBy(data, function() {
            return true;
          });
        }
        break;
    }

    // Sort groups by date
    //data = _.sortBy(data, function(value) {
    //  //var tmpDate = new Date(value[0].lmdt);
    //  return value;
    //});

    // Sort groups by name(alphabetical order)
    data = _(data).chain().sortBy(function(data) {
      return data[0].tags[0];
    }).value();

    return data;
  };

  ExtUI.prototype.setThumbnail = function(uiElement) {
    if (TSCORE.Utils.isVisibleOnScreen(uiElement) && (uiElement.style.backgroundImage.indexOf("image/gif") > 0)) {
      var filePath = $(uiElement).data('path');
      TSCORE.Meta.loadThumbnailPromise(filePath).then(function(url) {
        uiElement.style.backgroundImage = "url('" + url + "')";
      });
    }
  };

  ExtUI.prototype.assingFileTileHandlers = function($fileTile) {

    var path = $fileTile.data("path");
    var isFile = $fileTile.data("isfile");
    var self = this;

    $fileTile.hammer().on("doubletap", function() { //.dblclick(function() {
      return false;
    }).on('click', function() {
      if (isFile) {
        TSCORE.FileOpener.openFile(path);
        self.selectFile(path);
      } else {
        TSCORE.navigateToDirectory(path);
      }
    }).droppable({
      accept: ".tagButton",
      hoverClass: "activeRow",
      drop: function(event, ui) {
        var tagName = TSCORE.selectedTag;
        var targetFilePath = path;

        // preventing self drag of tags
        var targetTags = TSCORE.TagUtils.extractTags(targetFilePath);
        for (var i = 0; i < targetTags.length; i++) {
          if (targetTags[i] === tagName) {
            return true;
          }
        }

        console.log("Tagging file: " + tagName + " to " + targetFilePath);
        $(this).toggleClass("ui-selected");
        TSCORE.PerspectiveManager.clearSelectedFiles();
        TSCORE.selectedFiles.push(targetFilePath);
        TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [tagName]);
        self.handleElementActivation();

        $(ui.helper).remove();
      }
    });

    $fileTile.find(".fileInfoArea").on('click', function(e) {
      e.preventDefault();
      if (isFile) {
        var $stateTag = $(this).find("i");
        if ($stateTag.hasClass("fa-square-o")) {
          $stateTag.removeClass("fa-square-o").addClass("fa fa-check-square");
          $(this).parent().addClass("ui-selected");
          TSCORE.selectedFiles.push(path);
        } else {
          $stateTag.removeClass("fa-check-square").addClass("fa-square-o");
          $(this).parent().removeClass("ui-selected");
          TSCORE.selectedFiles.splice(TSCORE.selectedFiles.indexOf(path), 1);
        }
        selectedIsFolderArr[path] = false;
        self.handleElementActivation();
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
      "start": function() {
        if (isFile) {
          self.selectFile(path);
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
       "start": function() {
         TSCORE.selectedTag = $(this).data("tag");
         self.selectFile(path);
       }
    });
  };

  ExtUI.prototype.clearSelectedFiles = function() {
    TSCORE.selectedFiles = [];
    $("#" + this.extensionID + "Container").find(".ui-selected").removeClass("ui-selected");
    $("#" + this.extensionID + "Container").find(".fileTileSelector i").removeClass("fa-check-square").addClass("fa-square-o");
  };

  ExtUI.prototype.selectFile = function(filePath) {
    selectedIsFolderArr = [];
    TSCORE.PerspectiveManager.clearSelectedFiles();
    this.viewContainer.find('.fileTile').each(function() {
      var path = $(this).data("path");
      var isFile = $(this).data("isfile");
      if (path === filePath) {
        $(this).toggleClass("ui-selected");
        $(this).find(".fileTileSelector i").toggleClass("fa-check-square").toggleClass("fa-square-o");
        selectedIsFolderArr[path] = !isFile;

        if (!TSCORE.Utils.isVisibleOnScreen(this)) {
          $("#viewContainers").animate({
            scrollTop: $(this).offset().top - $("#perspectiveGridContainer").offset().top // $(this).height()
          }, 100);
        }
      }
    });
    TSCORE.selectedFiles.push(filePath);
    this.handleElementActivation();
  };


  ExtUI.prototype.toggleSelectAll = function() {
    var checkIcon = $("#" + this.extensionID + "ToogleSelectAll").find("i");
    if (checkIcon.hasClass("fa-square-o")) {
      TSCORE.selectedFiles = [];
      $(this.viewContainer).find('.fileTileSelector').each(function() {
        var fileTile = $(this).parent().parent();
        if (fileTile.data("isfile")) {
          fileTile.addClass("ui-selected");
          $(this).find("i").addClass("fa-check-square").removeClass("fa-square-o");
          TSCORE.selectedFiles.push(fileTile.data("path"));
        } else {
          fileTile.removeClass("ui-selected");
          $(this).find("i").removeClass("fa-check-square").addClass("fa-square-o");
        }
      });
    } else {
      TSCORE.PerspectiveManager.clearSelectedFiles();
    }
    this.handleElementActivation();
    checkIcon.toggleClass("fa-check-square");
    checkIcon.toggleClass("fa-square-o");
  };

  ExtUI.prototype.handleElementActivation = function() {
    console.log("Entering element activation handler...");

    var tagButton = $("#" + this.extensionID + "TagButton");
    var copyMoveButton = $("#" + this.extensionID + "CopyMoveButton");
    var deleteSelectedFilesButton = $("#" + this.extensionID + "DeleteSelectedFilesButton");

    var isFolderInSelection = false;

    if (hasFolderInList) {
      for (var inx = 0; inx < TSCORE.selectedFiles.length; inx++) {
        if (selectedIsFolderArr[TSCORE.selectedFiles[inx]]) {
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
  };

  ExtUI.prototype.removeFileUI = function(filePath) {
    console.log("Removing " + filePath + " from UI");

    // Updating the file selection
    TSCORE.selectedFiles.splice(TSCORE.selectedFiles.indexOf(filePath), 1);

    if (isWin && !isWeb) {
      filePath = filePath.replace("/\//g", "");
      this.viewContainer.find(".fileTile").each(function() {
        if ($(this).data("path").replace("/\//g", "") === filePath) {
          $(this).remove();
        }
      });
    } else {
      this.viewContainer.find(".fileTile[data-path='" + filePath + "']").remove();
    }
  };

  ExtUI.prototype.updateFileUI = function(oldFilePath, newFilePath) {
    console.log("Updating file in UI");

    // Updating the file selection
    if (oldFilePath !== newFilePath) {
      TSCORE.selectedFiles.splice(TSCORE.selectedFiles.indexOf(oldFilePath), 1);
      TSCORE.selectedFiles.push(newFilePath);
    }

    var title = TSCORE.TagUtils.extractTitle(newFilePath);
    var fileExt = TSCORE.TagUtils.extractFileExtension(newFilePath);
    var fileTags = TSCORE.TagUtils.extractTags(newFilePath);
    var parentFolderNewFile = TSCORE.TagUtils.extractParentDirectoryPath(newFilePath);
    var newFileName = TSCORE.TagUtils.extractFileName(newFilePath);

    var $fileTile;
    var attrFilePath;

    if (isWin && !isWeb) {
      oldFilePath = oldFilePath.replace("/\//g", "");
      this.viewContainer.find(".fileTile").each(function() {
        attrFilePath = $(this).data("path");
        if (attrFilePath.replace("/\//g", "") === oldFilePath) {
          $fileTile = $(this);
        }
      });
    } else {
      $fileTile = this.viewContainer.find(".fileTile[data-path='" + oldFilePath + "']");
    }

    var metaObj = TSCORE.Meta.findMetaObjectFromFileList(oldFilePath);
    if (!metaObj) {
      metaObj = {};
      metaObj.thumbnailPath = parentFolderNewFile + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + newFileName + TSCORE.thumbFileExt;
    }
    $fileTile.replaceWith(this.createFileTile(title, newFilePath, fileExt, fileTags, true, metaObj));

    if (isWin && !isWeb) {
      newFilePath = newFilePath.replace("/\//g", "");
      this.viewContainer.find(".fileTile").each(function() {
        attrFilePath = $(this).data("path");
        if (attrFilePath.replace("/\//g", "") === newFilePath) {
          $fileTile = $(this);
        }
      });
    } else {
      $fileTile = this.viewContainer.find(".fileTile[data-path='" + newFilePath + "']");
    }

    TSCORE.Meta.loadThumbnailPromise(newFilePath).then(function(url) {
      $fileTile.children('.thumbnailArea').attr("style", "background-image: url('" + url + "')");
    });

    this.assingFileTileHandlers($fileTile);
  };

  ExtUI.prototype.getNextFile = function(filePath) {
    var nextFilePath;
    var self = this;
    var indexNonDirectory = [];

    this.searchResults.forEach(function(entry) {
      if (!entry.isDirectory) {
        indexNonDirectory.push(entry);
      }
    });

    indexNonDirectory.forEach(function(entry, index) {
      if (entry.path === filePath) {
        var nextIndex = index + 1;
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
  };

  ExtUI.prototype.getPrevFile = function(filePath) {
    var prevFilePath;
    var self = this;
    var indexNonDirectory = [];

    this.searchResults.forEach(function(entry) {
      if (!entry.isDirectory) {
        indexNonDirectory.push(entry);
      }
    });

    indexNonDirectory.forEach(function(entry, index) {
      if (entry.path === filePath) {
        var prevIndex = index - 1;
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
  };

  ExtUI.prototype.showFoldersInListCheckbox = function() {
    showFoldersInList = true;
    TSCORE.navigateToDirectory(TSCORE.currentPath);
    saveExtSettings();
    $("#" + this.extensionID + "hideFoldersInListCheckbox").show();
    $("#" + this.extensionID + "showFoldersInListCheckbox").hide();
  };

  ExtUI.prototype.hideFoldersInListCheckbox = function() {
    showFoldersInList = false;
    TSCORE.navigateToDirectory(TSCORE.currentPath);
    saveExtSettings();
    $("#" + this.extensionID + "hideFoldersInListCheckbox").hide();
    $("#" + this.extensionID + "showFoldersInListCheckbox").show();
  };

  ExtUI.prototype.sortByCriteria = function(criteria, orderBy) {
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
        //showFoldersInList = true;
        if (showFoldersInList && this.searchResults.length > 0 && this.searchResults[0].isDirectory) { //sort by isDirectory and next by names only if in list have folders
          var arrFolders = [], arrFiles = [];
          for (var inx = 0; inx < this.searchResults.length; inx++) {
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
  };

  ExtUI.prototype.initFileSortingMenu = function() {
    var self = this;
    var suggMenuAscending = $("#" + self.extensionID + "SortingMenuAscending");
    var suggMenuDescending = $("#" + self.extensionID + "SortingMenuDescending");
    //Adding context menu
    for (var i = 0; i < self.supportedSortings.length; i++) {
      suggMenuAscending.append($('<li>').append($('<button>', {
          text: self.supportedSortings[i].title + " " + $.i18n.t("ns.perspectives:ascending"),
          "data-dismiss": "modal",
          class: "btn btn-link transformation-none",
          key: self.supportedSortings[i].key,
          group: self.supportedSortings[i].title
        }).prepend("<i class='fa fa-sort-amount-asc fa-fw'></i>&nbsp;&nbsp;").click(function() {
          $("#" + self.extensionID + "SortingButton").attr("title", " Sort by " + $(this).attr("sort") + " ").text(" " + $(this).attr("sort") + " ").prepend("<i class='fa fa-group fa-fw' />").append("<span class='caret'></span>");
          orderBy = true;
          showSortDataInList = $(this).attr("key");
          saveExtSettings();
          self.sortByCriteria($(this).attr("key"), orderBy);
          self.reInit();
        }) // jshint ignore:line
      ));
      suggMenuDescending.append($('<li>').append($('<button>', {
          text: self.supportedSortings[i].title + " " + $.i18n.t("ns.perspectives:descending"),
          "data-dismiss": "modal",
          class: "btn btn-link transformation-none",
          key: self.supportedSortings[i].key,
          group: self.supportedSortings[i].title
        }).prepend("<i class='fa fa-sort-amount-desc fa-fw'></i>&nbsp;&nbsp;").click(function() {
          $("#" + self.extensionID + "SortingButton").attr("title", " Sort by " + $(this).attr("sort") + " ").text(" " + $(this).attr("sort") + " ").prepend("<i class='fa fa-group fa-fw' />").append("<span class='caret'></span>");
          orderBy = false;
          showSortDataInList = $(this).attr("key");
          saveExtSettings();
          self.sortByCriteria($(this).attr("key"), orderBy);
          self.reInit();
        }) // jshint ignore:line
      ));
    }
  };

  exports.ExtUI = ExtUI;
});
