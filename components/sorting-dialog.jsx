define(function(require, exports, module) {

  const React = require("react");
  const ReactDOM = require("react-dom");

  class SortingDialog extends React.Component {

    render() {
      return (
        <div className="modal" id={this.props.extensionID + "SortExtensionModal"} role="dialog" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true"><i className="fa fa-times"></i></button>
                <h4 className="modal-title" data-i18n="ns.perspectives:sortingCriteria"></h4>
              </div>
              <div className="modal-body">
                <div className="btn-group">
                  <div className="row">
                    <div className="col-sm-6 unpadding">
                      <ul className="unstyled" id={this.props.extensionID + "SortingMenuAscending"}></ul>
                    </div>
                    <div className="col-sm-6 unpadding">
                      <ul className="unstyled" id={this.props.extensionID + "SortingMenuDescending"}></ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  exports.SortingDialog = SortingDialog;
})