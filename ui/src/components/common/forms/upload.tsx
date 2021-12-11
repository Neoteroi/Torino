import arrays from "../../../common/arrays";
import FileInput from "./file-input";
import FileUpload from "./file-upload";
import React, {Component, ReactElement} from "react";
import {ApplicationError} from "../../../common/errors";
import {Button} from "@material-ui/core";
import {FileInfo} from "../../../common/files";
import {IServices} from "../../../service/services";

export interface UploadProps {
  albumId: string;
  folderId: string;
  services: IServices;
  waiting?: boolean;
  error?: ApplicationError | null;
  onCancel: () => void;
  onUpload: () => void;
  dismissError?: () => void;
}

export interface UploadState {
  files: FileInfo[];
  uploading: boolean;
  done: boolean;
}

export default class Upload extends Component<UploadProps, UploadState> {
  private filesInput: React.RefObject<FileInput>;
  private filesUpload: {[key: string]: FileUpload | null};

  constructor(props: UploadProps) {
    super(props);

    this.state = {
      files: [],
      uploading: false,
      done: false,
    };
    this.filesInput = React.createRef();
    this.filesUpload = {};
  }

  onChange(): void {
    //
  }

  componentWillUnmount(): void {
    this.filesUpload = {};
  }

  onFilesSelected(files: FileInfo[]): void {
    this.setState({
      files,
    });
  }

  onRemoveClick(file: FileInfo): void {
    const {files} = this.state;
    arrays.remove(files, file);
    delete this.filesUpload[file.id];

    this.setState({
      files,
    });

    if (!files.length) this.clearFiles();
  }

  onClearSelectionClick(): void {
    this.setState({files: []});
    this.clearFiles();
  }

  onUploadMoreClick(): void {
    this.setState({files: [], done: false});
    this.clearFiles();
  }

  onUploadClick(): void {
    this.setState({uploading: true});
    const operations: Array<Promise<void>> = [];

    for (const key in this.filesUpload) {
      const control = this.filesUpload[key];

      if (control && control.canStartUpload()) {
        operations.push(control.upload());
      }
    }

    Promise.all(operations).then(
      () => {
        // all files uploaded correctly
        this.setState({uploading: false, done: true});

        this.props.onUpload();
      },
      () => {
        // there is no need to display an error message here,
        // because child views handle this; the user can also cancel the
        // upload, so nothing is wrong
        this.setState({uploading: false});
      }
    );
  }

  clearFiles(): void {
    this.filesInput.current?.reset();
    this.filesUpload = {};
  }

  onDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const {files} = this.state;

    if (event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === "file") {
          const file = event.dataTransfer.items[i].getAsFile();
          if (file !== null) files.push(FileInfo.fromFile(file));
        }
      }
    } else {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        files.push(FileInfo.fromFile(event.dataTransfer.files[i]));
      }
    }

    // TODO: handle duplicate file names, apply a counter automatically

    this.setState({
      files,
    });
  }

  onDragOver(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
  }

  render(): ReactElement {
    const {albumId, folderId} = this.props;
    const {files, uploading, done} = this.state;
    const displayControlButtons = !uploading && !done && files.length > 0;

    return (
      <div
        className="file-input-region"
        onDrop={this.onDrop.bind(this)}
        onDragOver={this.onDragOver.bind(this)}
      >
        <div className="controls">
          {done === false && (
            <FileInput
              onFilesSelected={this.onFilesSelected.bind(this)}
              ref={this.filesInput}
              multiple
            />
          )}
          {displayControlButtons && (
            <>
              <Button color="primary" onClick={() => this.onUploadClick()}>
                <i className="fas fa-upload"></i>
                Upload
              </Button>
              <Button
                color="secondary"
                onClick={() => this.onClearSelectionClick()}
              >
                Clear Selection
              </Button>
              <Button onClick={() => this.props.onCancel()}>Cancel</Button>
            </>
          )}
          {done && (
            <>
              <Button onClick={() => this.onUploadMoreClick()}>
                Upload more files
              </Button>
              <Button onClick={() => this.props.onCancel()}>Close</Button>
            </>
          )}
          {done === false && displayControlButtons === false && (
            <Button onClick={() => this.props.onCancel()}>Close</Button>
          )}
          {done && <em>All file were uploaded.</em>}
          {uploading && <em>Upload in progress, do not close this window.</em>}
        </div>
        {files.map((file) => {
          return (
            <div key={file.id}>
              <FileUpload
                file={file}
                albumId={albumId}
                folderId={folderId}
                services={this.props.services}
                onRemoveClick={() => this.onRemoveClick(file)}
                ref={(ref) => (this.filesUpload[file.id] = ref)}
              />
            </div>
          );
        })}
        {files.length === 0 && (
          <div className="drop-zone">
            <p>Use the select button, or drag one or more files...</p>
          </div>
        )}
      </div>
    );
  }
}
