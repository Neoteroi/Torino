import React, {Component, ReactElement} from "react";
import {ContainerReadAuth} from "../../../service/domain/blobs";
import {FileSystemNode} from "../../../service/domain/vfs";

export interface VideoFileProps {
  auth: ContainerReadAuth;
  node: FileSystemNode;
  height?: number;
}

export default class VideoFile extends Component<VideoFileProps> {
  getSrc(): string {
    const {auth, node} = this.props;
    const {file_id, file_extension} = node;

    if (!file_id || !file_extension) {
      return "";
    }

    return auth.base_url + `${file_id + file_extension}?${auth.token}`;
  }

  render(): ReactElement {
    const {node, height} = this.props;

    return (
      <div className="video">
        <video controls={true} height={height || 200}>
          <source src={this.getSrc()} type={node.type} />
          Browser not supporting video
        </video>
        {this.props.children}
      </div>
    );
  }
}
