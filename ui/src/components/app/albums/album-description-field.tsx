import defer from "lodash/defer";
import React, {Component, ReactElement, ChangeEvent} from "react";
import {ApplicationError} from "../../../common/errors";
import {TextField} from "@material-ui/core";
import {changeHandler} from "../../../common/forms";

export interface AlbumDescriptionFieldProps {
  onChange?: (value: string) => void;
  value?: string | null;
  disabled?: boolean;
}

export interface AlbumDescriptionFieldState {
  error?: ApplicationError;
  value: string;
  valueError: boolean;
  valueHelperText: string;
}

export default class AlbumDescriptionField extends Component<
  AlbumDescriptionFieldProps,
  AlbumDescriptionFieldState
> {
  constructor(props: AlbumDescriptionFieldProps) {
    super(props);

    this.state = {
      value: props.value || "",
      valueError: false,
      valueHelperText: "",
    };
  }

  public get value(): string {
    return this.state.value;
  }

  onChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | {name?: string; value: unknown}
    >
  ): void {
    changeHandler.call(this, event);

    defer(() => {
      if (this.props.onChange) {
        this.props.onChange(this.state.value);
      }
    });
  }

  async validate(): Promise<boolean> {
    return true;
  }

  onBlur(): void {
    const value = this.state.value;

    if (value !== value.trim()) {
      this.setState({
        value: value.trim(),
      });
    }
    defer(() => {
      this.validate();
    });
  }

  render(): ReactElement {
    const {value, valueError, valueHelperText} = this.state;
    return (
      <TextField
        variant="outlined"
        error={valueError}
        helperText={valueHelperText}
        name="value"
        value={value}
        autoComplete="off"
        multiline={true}
        rows={4}
        onChange={this.onChange.bind(this)}
        onBlur={this.onBlur.bind(this)}
        disabled={this.props.disabled}
      />
    );
  }
}
