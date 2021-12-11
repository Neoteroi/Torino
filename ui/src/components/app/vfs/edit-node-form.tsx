import React, {Component, ReactElement} from "react";
import {ApplicationError} from "../../../common/errors";
import {IServices} from "../../../service/services";
import ConfirmButtons from "../../common/forms/confirm-buttons";
import TextInput from "../../common/forms/text-input";

export interface EditNodeFormProps {
  disabled?: boolean;
  initialValue?: string;
  services: IServices;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export interface EditNodeFormState {
  waiting: boolean;
  error: ApplicationError | null;
}

export default class EditNodeForm extends Component<
  EditNodeFormProps,
  EditNodeFormState
> {
  private nameField: React.RefObject<TextInput>;

  constructor(props: EditNodeFormProps) {
    super(props);

    this.nameField = React.createRef();

    this.state = {
      waiting: false,
      error: null,
    };
  }

  async validate(value: string): Promise<string | null> {
    if (!value) {
      return "Please insert a value";
    }

    // const service = this.props.services.applications;
    // const apps = await service.getApplications("", "", value);
    //
    // if (apps.some((item) => ciEquals(value, item.id))) {
    //   return "There is already an application with the same id.";
    // }

    return null;
  }

  async confirm(): Promise<void> {
    const isValid = await this.nameField.current?.validate();

    if (!isValid) {
      return;
    }

    const value = this.nameField.current?.value ?? "";

    // TODO: post!
    this.props.onConfirm(value);
  }

  cancel(): void {
    this.props.onCancel();
  }

  render(): ReactElement {
    const {initialValue} = this.props;
    return (
      <div>
        <TextInput
          value={initialValue}
          validate={this.validate.bind(this)}
          autoFocus
          ref={this.nameField}
        />
        <ConfirmButtons
          cancel={this.cancel.bind(this)}
          confirm={this.confirm.bind(this)}
        />
      </div>
    );
  }
}
