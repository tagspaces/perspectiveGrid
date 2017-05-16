define(function(require, exports, module) {

  const React = require("react");
  const ReactDOM = require("react-dom");

  class AboutDialog extends React.Component {

    render() {
      return (
        <div className="modal fullScreenMobile" id="aboutExtensionModalGrid" tabindex="-1" role="dialog" aria-hidden="true">
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