// @flow
import React from 'react';
import { withStyles } from 'material-ui/styles';
import { type FileSystemEntry } from '../../../services/utils-io';
import { type Tag } from '../../../reducers/taglibrary';

type Props = {
  classes: Object,
  openFile: (path: string) => void,
  openFileNatively: (path: string) => void,
  deleteFile: (path: string) => void,
  renameFile: (path: string) => void,
  openDirectory: (path: string) => void,
  loadDirectoryContent: (path: string) => void,
  directoryContent: Array<FileSystemEntry>
};

type State = {
  selectedFilePath?: string | null,
  itemPath?: string | null,
  fileContextMenuAnchorEl?: Object | null,
  fileContextMenuOpened?: boolean,
};

const styles = theme => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: '100px 100px',
    backgroundColor: theme.palette.background.default
  },
  cellGrid: {
    border: '1px solid green'
  }
});

class GridPerspective extends React.Component<Props, State> {
  renderCell = (fsEntry: FileSystemEntry) => {
    const classes = this.props.classes;
    return (
      <div key={fsEntry.uuid} className={classes.cellGrid}>{fsEntry.name}</div>
    );
  }

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.mainGrid}>
        { this.props.directoryContent.map((entry) => this.renderCell(entry)) }
      </div>
    );
  }
}

// export default GridPerspective;
export default withStyles(styles)(GridPerspective);
