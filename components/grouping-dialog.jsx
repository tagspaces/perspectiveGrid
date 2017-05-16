/* Copyright (c) 2017-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define((require, exports, module) => {

  const React = require("react");
  const ReactDOM = require("react-dom");

  class GroupingDialog extends React.Component {

    render() {
      return (
        <div className="modal" id={this.props.extensionID + "ExtensionModal"} role="dialog" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true"><i className="fa fa-times"></i></button>
                <h4 className="modal-title" data-i18n="ns.perspectives:fileGrouping"></h4>
              </div>
              <div className="modal-body">
                <ul id={this.props.extensionID + "GroupingMenu"} className=""></ul>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  exports.GroupingDialog = GroupingDialog;
})