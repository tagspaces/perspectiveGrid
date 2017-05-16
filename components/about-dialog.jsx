/* Copyright (c) 2017-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define((require, exports, module) => {

  const React = require("react");
  const ReactDOM = require("react-dom");
  const TSCORE = require('tscore');
  const readme = require('text!../README.md'); // TODO make loading conditional
  
  class AboutDialog extends React.Component {

    componentDidMount() {
      $('#aboutExtensionModalGrid').on('show.bs.modal', function() {
        var modalBody = $("#aboutExtensionModalGrid .modal-body");
        TSCORE.Utils.setMarkDownContent(modalBody, readme);
      });
    }

    render() {
      return (
        <div className="modal fullScreenMobile" id="aboutExtensionModalGrid" role="dialog" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" id="closeAboutExtensionModal" className="close" data-dismiss="modal" aria-hidden="true"><i className="fa fa-times"></i></button>
                <h4 className="modal-title" data-i18n="ns.perspectives:aboutTitle"></h4>
              </div>
              <div className="modal-body markdown-content"></div>
              <div className="modal-footer">
                <button className="btn btn-primary" data-dismiss="modal" aria-hidden="true">
                  <i className="fa fa-check fa-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  exports.AboutDialog = AboutDialog;
})