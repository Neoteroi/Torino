import React, {Component, ReactElement} from "react";
import {ContainerReadAuth} from "../../../service/domain/blobs";
import {FileSystemNode} from "../../../service/domain/vfs";

export interface AudioFileProps {
  auth: ContainerReadAuth;
  node: FileSystemNode;
}

export default class AudioFile extends Component<AudioFileProps> {
  getSrc(): string {
    const {auth, node} = this.props;
    const {file_id, file_extension} = node;

    if (!file_id || !file_extension) {
      return "";
    }

    return auth.base_url + `${file_id + file_extension}?${auth.token}`;
  }

  render(): ReactElement {
    const {node} = this.props;

    return (
      <div className="audio">
        <audio controls={true}>
          <source src={this.getSrc()} type={node.type} />
          Browser not supporting audio
        </audio>
        {this.props.children}
      </div>
    );
  }
}
