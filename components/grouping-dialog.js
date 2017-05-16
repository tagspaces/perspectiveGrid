/* Copyright (c) 2017-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define((require, exports, module) => {

  const React = require("react");
  const ReactDOM = require("react-dom");

  class GroupingDialog extends React.Component {

    render() {
      return React.createElement(
        "div",
        { className: "modal", id: this.props.extensionID + "ExtensionModal", role: "dialog", "aria-hidden": "true" },
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
              React.createElement("h4", { className: "modal-title", "data-i18n": "ns.perspectives:fileGrouping" })
            ),
            React.createElement(
              "div",
              { className: "modal-body" },
              React.createElement("ul", { id: this.props.extensionID + "GroupingMenu", className: "" })
            )
          )
        )
      );
    }
  }

  exports.GroupingDialog = GroupingDialog;
});