import React, {Component, ReactElement} from "react";
import {Link} from "react-router-dom";
import {shouldConsiderDoubleClick} from "../../../common/dom";
import {isAudioMime, isImageMime, isVideoMime} from "../../../common/mime";
import {SelectOptions} from "../../../common/selections";
import {BaseURL} from "../../../service/api";
import {ContainerReadAuth} from "../../../service/domain/blobs";
import {FileSystemNode, FileSystemNodeType} from "../../../service/domain/vfs";
import AudioFile from "./audio-file";
import FileDownloadLink from "./file-download-link";
import ImageFile from "./image-file";
import VideoFile from "./video-file";

export interface FolderTableProps {
  albumId: string;
  auth: ContainerReadAuth;
  nodes: FileSystemNode[];
  selectedNodes: FileSystemNode[];
  cutNodes: FileSystemNode[];
  onDoubleClick: (node: FileSystemNode) => void;
  onImageClick: (node: FileSystemNode) => void;
  onSelectNode: (options: SelectOptions<FileSystemNode>) => void;
}

export default class FolderTable extends Component<FolderTableProps> {
  onClick(
    event: React.MouseEvent<HTMLTableRowElement>,
    node: FileSystemNode
  ): void {
    if (event.shiftKey) {
      event.preventDefault();
    }
    this.props.onSelectNode({
      item: node,
      addToSelection: event.shiftKey || event.ctrlKey,
      expandSelection: event.shiftKey,
    });
  }

  onDoubleClick(
    event: React.MouseEvent<HTMLElement>,
    node: FileSystemNode
  ): void {
    if (shouldConsiderDoubleClick(event.target as HTMLElement)) {
      this.props.onDoubleClick(node);
    }
  }

  renderItem(node: FileSystemNode): ReactElement {
    const {albumId, auth} = this.props;

    if (node.node_type === FileSystemNodeType.folder) {
      return (
        <Link to={`/album/${albumId}/${node.id}`}>
          <i className="fas fa-folder"></i>
        </Link>
      );
    }

    if (isImageMime(node.type)) {
      return (
        <ImageFile
          auth={auth}
          node={node}
          onImageClick={(node) => this.props.onImageClick(node)}
        />
      );
    }

    if (isAudioMime(node.type)) {
      return <AudioFile node={node} auth={auth} />;
    }

    if (isVideoMime(node.type)) {
      return <VideoFile node={node} auth={auth} />;
    }

    return <i className="far fa-file"></i>;
  }

  getSrc(node: FileSystemNode): string {
    return `${BaseURL}/api/albums/file/${node.id}`;
  }

  getNodeClass(
    node: FileSystemNode,
    selectedNodes: FileSystemNode[],
    cutNodes: FileSystemNode[]
  ): string {
    return (
      (selectedNodes.indexOf(node) > -1 ? "selected" : "") +
      (cutNodes.indexOf(node) > -1 ? " cut" : "")
    );
  }

  render(): ReactElement {
    const {albumId, nodes, selectedNodes, cutNodes} = this.props;
    return (
      <table id="table">
        <thead>
          <tr>
            <th className="icon"></th>
            <th>Name</th>
            <th>Type</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => {
            return (
              <tr
                id={node.id}
                key={node.id}
                onClick={(e) => this.onClick(e, node)}
                onDoubleClick={(e) => this.onDoubleClick(e, node)}
                className={this.getNodeClass(node, selectedNodes, cutNodes)}
              >
                <td className="icon">{this.renderItem(node)}</td>
                <td>
                  {node.node_type === FileSystemNodeType.folder && (
                    <Link to={`/album/${albumId}/${node.id}`}>
                      {node.name}
                    </Link>
                  )}
                  {node.node_type !== FileSystemNodeType.folder && (
                    <FileDownloadLink node={node} />
                  )}
                </td>
                <td>{node.type}</td>
                <td>{node.last_modified_time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}
