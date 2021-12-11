import React, {Component, ReactElement} from "react";

export interface FileImagePreviewProps {
  file: File;
  maxHeight?: number;
}

export default class FileImagePreview extends Component<FileImagePreviewProps> {
  private root: React.RefObject<HTMLDivElement>;

  constructor(props: FileImagePreviewProps) {
    super(props);

    this.root = React.createRef();
  }

  componentDidMount(): void {
    const {maxHeight} = this.props;
    (window as any).loadImage(
      this.props.file,
      (img: HTMLImageElement) => {
        this.root.current?.appendChild(img);
      },
      {
        orientation: true,
        maxHeight: maxHeight || 160,
      }
    );
  }

  render(): ReactElement {
    return <div className="image-preview" ref={this.root}></div>;
  }
}
