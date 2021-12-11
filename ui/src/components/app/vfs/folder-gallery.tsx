import {
  Card,
  CardActionArea,
  CardContent,
  ListItemText,
} from "@material-ui/core";
import React, {Component, ReactElement} from "react";
import {Link} from "react-router-dom";
import {isAudioMime, isImageMime, isVideoMime} from "../../../common/mime";
import {SelectOptions} from "../../../common/selections";
import {ContainerReadAuth} from "../../../service/domain/blobs";
import {FileSystemNode, FileSystemNodeType} from "../../../service/domain/vfs";
import ImageFile, {ImageSize} from "./image-file";
import AudioFile from "./audio-file";
import VideoFile from "./video-file";
export interface FolderGalleryProps {
  albumId: string;
  auth: ContainerReadAuth;
  nodes: FileSystemNode[];
  selectedNodes: FileSystemNode[];
  onImageClick: (node: FileSystemNode) => void;
  onDoubleClick: (node: FileSystemNode) => void;
  onSelectNode: (options: SelectOptions<FileSystemNode>) => void;
}

export default class FolderGallery extends Component<FolderGalleryProps> {
  renderItem(node: FileSystemNode): ReactElement {
    const {albumId, auth} = this.props;

    if (node.node_type === FileSystemNodeType.folder) {
      /*
      return (
        <div className="folder">
          <Link to={`/album/${albumId}/${node.id}`}>
            <i className="fas fa-folder"></i>
            <ListItemText primary={node.name} />
          </Link>
        </div>
      );*/
      return (
        <Card className="card-root folder">
          <Link to={`/album/${albumId}/${node.id}`}>
            <CardActionArea>
              <CardContent>
                <i className="fas fa-folder"></i>
                <ListItemText primary={node.name} />
              </CardContent>
            </CardActionArea>
          </Link>
        </Card>
      );
    }

    if (isImageMime(node.type))
      return (
        <ImageFile
          auth={auth}
          node={node}
          size={ImageSize.small}
          onImageClick={(node) => this.props.onImageClick(node)}
        />
      );

    if (isAudioMime(node.type))
      return (
        <AudioFile auth={auth} node={node}>
          <span>{node.name}</span>
        </AudioFile>
      );

    if (isVideoMime(node.type))
      return (
        <VideoFile node={node} auth={auth}>
          <span>{node.name}</span>
        </VideoFile>
      );

    return (
      <div className="card">
        <ListItemText primary={node.name} />
      </div>
    );
  }

  render(): ReactElement {
    const {nodes} = this.props;
    // TODO: handle selected nodes?
    return (
      <ul className="folders-list">
        {nodes.map((node) => {
          return (
            <li id={node.id} key={node.id} className="node">
              {this.renderItem(node)}
            </li>
          );
        })}
      </ul>
    );
  }
}
