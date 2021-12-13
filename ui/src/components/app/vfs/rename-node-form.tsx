import ConfirmButtons from "../../common/forms/confirm-buttons";
import Form from "../../common/forms/form";
import React, {Component, ReactElement} from "react";
import TextInput from "../../common/forms/text-input";
import {
  ApplicationError,
  ConflictError,
  PreconditionFailedError,
} from "../../../common/errors";
import {FileSystemNode} from "../../../service/domain/vfs";
import {IServices} from "../../../service/services";

export interface RenameNodeFormProps {
  services: IServices;
  node: FileSystemNode;
  onUpdated: (value: FileSystemNode) => void;
  onCancel: () => void;
}

export interface RenameNodeFormState {
  value: string;
  waiting: boolean;
  error: ApplicationError | null;
}

export default class RenameNodeForm extends Component<
  RenameNodeFormProps,
  RenameNodeFormState
> {
  private nameField: React.RefObject<TextInput>;

  constructor(props: RenameNodeFormProps) {
    super(props);

    this.nameField = React.createRef();

    this.state = {
      value: props.node.name,
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
      const {node} = this.props;
      const data = await fs.updateNode({
        id: node.id,
        name: value,
        parent_id: node.parent_id,
        etag: node.etag,
      });

      this.props.onUpdated(data);
    } catch (error: any) {
      if (error instanceof ConflictError) {
        this.nameField.current?.setError(
          "An item already exists with this name"
        );
        this.setState({
          waiting: false,
        });
        return;
      }
      if (error instanceof PreconditionFailedError) {
        this.nameField.current?.setError(
          "This node was modified since it was loaded on the page."
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
