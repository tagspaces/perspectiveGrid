/* Copyright (c) 2017-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define((require, exports, module) => {

  const React = require("react");
  const ReactDOM = require("react-dom");

  class SortingDialog extends React.Component {

    render() {
      return React.createElement(
        "div",
        { className: "modal", id: this.props.extensionID + "SortExtensionModal", role: "dialog", "aria-hidden": "true" },
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
                { type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
                React.createElement("i", { className: "fa fa-times" })
              ),
              React.createElement("h4", { className: "modal-title", "data-i18n": "ns.perspectives:sortingCriteria" })
            ),
            React.createElement(
              "div",
              { className: "modal-body" },
              React.createElement(
                "div",
                { className: "btn-group" },
                React.createElement(
                  "div",
                  { className: "row" },
                  React.createElement(
                    "div",
                    { className: "col-sm-6 unpadding" },
                    React.createElement("ul", { className: "unstyled", id: this.props.extensionID + "SortingMenuAscending" })
                  ),
                  React.createElement(
                    "div",
                    { className: "col-sm-6 unpadding" },
                    React.createElement("ul", { className: "unstyled", id: this.props.extensionID + "SortingMenuDescending" })
                  )
                )
              )
            )
          )
        )
      );
    }
  }

  exports.SortingDialog = SortingDialog;
});