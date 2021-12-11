import React, {Component, ReactElement} from "react";
import {ContainerReadAuth} from "../../../service/domain/blobs";
import {FileSystemNode} from "../../../service/domain/vfs";

export enum ImageSize {
  small,
  medium,
  original,
}

export interface ImageFileProps {
  auth: ContainerReadAuth;
  node: FileSystemNode;
  size?: ImageSize;
  onImageClick: (node: FileSystemNode) => void;
}

export default class ImageFile extends Component<ImageFileProps> {
  getImageNameForSize(): string {
    const {node} = this.props;
    const imageData = node.image;

    if (!node.file_id) {
      throw new Error("The file node is not a file");
    }

    if (!imageData) {
      return node.file_id + node.file_extension;
    }

    const size = this.props.size || ImageSize.small;

    switch (size) {
      case ImageSize.small:
        return imageData.small_image_name;
      case ImageSize.medium:
        return imageData.medium_image_name;
      default:
        return node.file_id + node.file_extension;
    }
  }

  getImageSrc(): string {
    const {auth} = this.props;
    return auth.base_url + `${this.getImageNameForSize()}?${auth.token}`;
  }

  getClassName(): string {
    const size = this.props.size || ImageSize.small;

    switch (size) {
      case ImageSize.small:
        return "thumbnail";
      case ImageSize.medium:
        return "medium-size";
      default:
        return "";
    }
  }

  render(): ReactElement {
    return (
      <img
        src={this.getImageSrc()}
        className={this.getClassName()}
        onClick={() => this.props.onImageClick(this.props.node)}
      />
    );
  }
}
