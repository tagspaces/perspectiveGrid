/* Copyright (c) 2017-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define((require, exports, module) => {

  const React = require("react");
  const ReactDOM = require("react-dom");
  const TSCORE = require('tscore');
  const readme = require('text!../README.md'); // TODO make loading conditional

  class AboutDialog extends React.Component {

    componentDidMount() {
      $('#aboutExtensionModalGrid').on('show.bs.modal', function () {
        var modalBody = $("#aboutExtensionModalGrid .modal-body");
        TSCORE.Utils.setMarkDownContent(modalBody, readme);
      });
    }

    render() {
      return React.createElement(
        "div",
        { className: "modal fullScreenMobile", id: "aboutExtensionModalGrid", role: "dialog", "aria-hidden": "true" },
        React.createElement(
          "div",
          { className: "modal-dialog" },
          React.createElement(
            "div",
            { className: "modal-content" },
            React.createElement(
              "div",
              { className: "modal-header" },
              React.createElement(
                "button",
                { type: "button", id: "closeAboutExtensionModal", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
                React.createElement("i", { className: "fa fa-times" })
              ),
              React.createElement("h4", { className: "modal-title", "data-i18n": "ns.perspectives:aboutTitle" })
            ),
            React.createElement("div", { className: "modal-body markdown-content" }),
            React.createElement(
              "div",
              { className: "modal-footer" },
              React.createElement(
                "button",
                { className: "btn btn-primary", "data-dismiss": "modal", "aria-hidden": "true" },
                React.createElement("i", { className: "fa fa-check fa-lg" })
              )
            )
          )
        )
      );
    }
  }

  exports.AboutDialog = AboutDialog;
});