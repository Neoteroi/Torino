import React, {Component, ReactElement} from "react";
import {FileInfo, isImage} from "../../../common/files";
import FileImagePreview from "./file-image-preview";
import {Button, LinearProgress} from "@material-ui/core";
import Loader from "../loader";
import ErrorPanel from "../error";
import {ConflictError, UserCancelledOperation} from "../../../common/errors";
import {IServices} from "../../../service/services";
import {FileUploadData} from "../../../service/domain/blobs";
import {FileSystemNodeType} from "../../../service/domain/vfs";

export interface FileUploadProps {
  albumId: string;
  folderId: string;
  services: IServices;
  file: FileInfo;
  onRemoveClick: () => void;
}

export interface FileUploadState {
  uploading: boolean;
  progress: number;
  error: any;
  done: boolean;
}

export default class FileUpload extends Component<
  FileUploadProps,
  FileUploadState
> {
  constructor(props: FileUploadProps) {
    super(props);

    this.state = {
      uploading: false,
      progress: 0,
      error: null,
      done: false,
    };
  }

  get uploading(): boolean {
    return this.state.uploading;
  }

  get done(): boolean {
    return this.state.done;
  }

  canStartUpload(): boolean {
    return this.uploading === false && this.done === false;
  }

  onProgress(progress: number): void {
    this.setState({
      progress,
    });
  }

  async upload(): Promise<void> {
    if (this.uploading) {
      return;
    }
    const filesService = this.props.services.blobs;
    const {albumId, file} = this.props;
    this.setState({
      uploading: true,
      progress: 0,
    });

    let fileInfo: FileUploadData | null = null;

    try {
      const data = await filesService.initializeFileUpload({
        container_id: albumId,
        file_name: file.name,
        file_type: file.mime,
        file_size: file.size,
      });

      fileInfo = await filesService.uploadFile(file.htmlFile, data, this);
    } catch (error) {
      if (error instanceof UserCancelledOperation) {
        // nothing wrong
        this.setState({
          uploading: false,
          done: false,
          progress: 0,
        });

        throw error;
      }
      this.setState({
        uploading: false,
        error: {},
        done: false,
      });
    }

    // now store node information
    if (fileInfo !== null) {
      const {albumId, folderId} = this.props;
      try {
        await this.props.services.fs.createNodes([
          {
            name: file.name,
            album_id: albumId,
            parent_id: folderId || null,
            node_type: FileSystemNodeType.file,
            file_id: fileInfo.file_id,
            file_size: fileInfo.file_size,
            file_mime: fileInfo.file_type,
          },
        ]);
      } catch (error) {
        if (error instanceof ConflictError) {
          // duplicate file name -
          // TODO: let the user rename the file?
          // TODO: automatically rename?
          this.setState({
            uploading: false,
            error,
            done: false,
          });

          throw error;
        }
      }

      this.setState({
        uploading: false,
        progress: 100,
        done: true,
      });
    }
  }

  onCancelUploadClick(): void {
    this.setState({
      uploading: false,
    });
  }

  render(): ReactElement {
    const {file} = this.props;
    const {done, uploading, progress, error} = this.state;

    return (
      <>
        <div className="file-input">
          <div className="file-graphics">
            {isImage(file) && <FileImagePreview file={file.htmlFile} />}
          </div>
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            {uploading && <Loader className="mini" />}
            <span className="file-size">{file.getSizeRepr()}</span>
            {(uploading || done) && (
              <>
                <LinearProgress
                  variant="determinate"
                  className="progress-bar"
                  value={progress}
                />
                {done === false && (
                  <em className="file-upload-progress">
                    Upload in progress...
                  </em>
                )}
                {done === true && (
                  <em className="file-upload-progress">
                    The file was uploaded
                  </em>
                )}
              </>
            )}
            {error && <ErrorPanel error={error} />}
          </div>
          <div className="buttons">
            {uploading === false && done === false && (
              <Button
                color="secondary"
                onClick={() => this.props.onRemoveClick()}
              >
                Remove
              </Button>
            )}
            {uploading === true && (
              <Button
                color="secondary"
                onClick={() => this.onCancelUploadClick()}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }
}
