"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require, exports, module) {

  var React = require("react");
  var ReactDOM = require("react-dom");

  var SortingDialog = function (_React$Component) {
    _inherits(SortingDialog, _React$Component);

    function SortingDialog() {
      _classCallCheck(this, SortingDialog);

      return _possibleConstructorReturn(this, (SortingDialog.__proto__ || Object.getPrototypeOf(SortingDialog)).apply(this, arguments));
    }

    _createClass(SortingDialog, [{
      key: "render",
      value: function render() {
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
    }]);

    return SortingDialog;
  }(React.Component);

  exports.SortingDialog = SortingDialog;
});