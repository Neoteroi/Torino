import ConfirmButtons from "../../common/forms/confirm-buttons";
import React, {Component, ReactElement} from "react";
import TextInput from "../../common/forms/text-input";
import {ApplicationError, ConflictError} from "../../../common/errors";
import {FileSystemNode, FileSystemNodeType} from "../../../service/domain/vfs";
import {IServices} from "../../../service/services";
import Form from "../../common/forms/form";

export interface NewNodeFormProps {
  services: IServices;
  albumId: string;
  parentId: string;
  onCreated: (value: FileSystemNode) => void;
  onCancel: () => void;
}

export interface NewNodeFormState {
  value: string;
  waiting: boolean;
  error: ApplicationError | null;
}

export default class NewNodeForm extends Component<
  NewNodeFormProps,
  NewNodeFormState
> {
  private nameField: React.RefObject<TextInput>;

  constructor(props: NewNodeFormProps) {
    super(props);

    this.nameField = React.createRef();

    this.state = {
      value: "",
      waiting: false,
      error: null,
    };
  }

  async confirm(): Promise<void> {
    const isValid = await this.nameField.current?.validate();

    if (!isValid) {
      return;
    }

    const value = this.nameField.current?.value ?? "";

    const {fs} = this.props.services;

    this.setState({
      error: null,
      waiting: true,
    });

    try {
      const {albumId, parentId} = this.props;
      const data = await fs.createNodes([
        {
          name: value,
          parent_id: parentId || null,
          album_id: albumId,
          file_mime: "folder",
          node_type: FileSystemNodeType.folder,
        },
      ]);

      this.props.onCreated(data[0]);
    } catch (error: any) {
      if (error instanceof ConflictError) {
        this.nameField.current?.setError(
          "A folder already exists with this name"
        );
        this.setState({
          waiting: false,
        });
        return;
      }
      this.setState({
        error,
        waiting: false,
      });
    }
  }

  cancel(): void {
    this.props.onCancel();
  }

  render(): ReactElement {
    const {value, waiting, error} = this.state;
    return (
      <Form waiting={waiting} error={error} onSubmit={() => this.confirm()}>
        <TextInput value={value} ref={this.nameField} required autoFocus />
        <ConfirmButtons
          cancel={this.cancel.bind(this)}
          confirm={this.confirm.bind(this)}
        />
      </Form>
    );
  }
}
