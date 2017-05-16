"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require, exports, module) {

  var React = require("react");
  var ReactDOM = require("react-dom");
  var TSCORE = require('tscore');
  var readme = require('text!../README.md'); // TODO make loading conditional

  var AboutDialog = function (_React$Component) {
    _inherits(AboutDialog, _React$Component);

    function AboutDialog() {
      _classCallCheck(this, AboutDialog);

      return _possibleConstructorReturn(this, (AboutDialog.__proto__ || Object.getPrototypeOf(AboutDialog)).apply(this, arguments));
    }

    _createClass(AboutDialog, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        $('#aboutExtensionModalGrid').on('show.bs.modal', function () {
          var modalBody = $("#aboutExtensionModalGrid .modal-body");
          TSCORE.Utils.setMarkDownContent(modalBody, readme);
        });
      }
    }, {
      key: "render",
      value: function render() {
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
    }]);

    return AboutDialog;
  }(React.Component);

  exports.AboutDialog = AboutDialog;
});