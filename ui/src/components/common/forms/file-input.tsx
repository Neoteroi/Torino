import React, {ReactElement} from "react";
import {FileInfo} from "../../../common/files";
import {Button} from "@material-ui/core";

export interface FileInputProps {
  id?: string;
  inputName?: string;
  onFilesSelected: (files: FileInfo[]) => void;
  multiple?: boolean;
  accept?: string;
}

export default class FileInput extends React.Component<FileInputProps> {
  private input: React.RefObject<HTMLInputElement>;

  constructor(props: FileInputProps) {
    super(props);

    this.input = React.createRef();
  }

  onChange(e: React.ChangeEvent<HTMLInputElement>): any {
    const filesList = e.target?.files;

    if (filesList === null) {
      return;
    }

    const info: FileInfo[] = [];
    for (let i = 0, l = filesList.length; i < l; i++)
      info.push(FileInfo.fromFile(filesList[i]));

    this.props.onFilesSelected(info);
  }

  reset(): void {
    const field = this.input.current;

    if (field) {
      // important
      (field as any).value = null;
    }
  }

  render(): ReactElement {
    const {accept, id, inputName, multiple} = this.props;

    return (
      <Button className="btn btn-success fileinput-button">
        <i className="fas fa-paperclip"></i>
        <span>Select files</span>
        <input
          id={id}
          type="file"
          name={inputName || "files[]"}
          accept={accept}
          multiple={multiple}
          onChange={this.onChange.bind(this)}
          ref={this.input}
        />
      </Button>
    );
  }
}
