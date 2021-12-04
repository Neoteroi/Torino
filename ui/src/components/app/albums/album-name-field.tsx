import defer from "lodash/defer";
import React, {Component, ReactElement, ChangeEvent} from "react";
import {ApplicationError} from "../../../common/errors";
import {TextField} from "@material-ui/core";
import {changeHandler} from "../../../common/forms";
import {i} from "../../../locale";

export interface AlbumNameFieldProps {
  onChange?: (value: string) => void;
  value?: string | null;
  disabled?: boolean;
}

export interface AlbumNameFieldState {
  error?: ApplicationError;
  value: string;
  valueError: boolean;
  valueHelperText: string;
}

export default class AlbumNameField extends Component<
  AlbumNameFieldProps,
  AlbumNameFieldState
> {
  public user_interaction: boolean;

  constructor(props: AlbumNameFieldProps) {
    super(props);

    this.user_interaction = false;
    this.state = {
      value: props.value || "",
      valueError: false,
      valueHelperText: "",
    };
  }

  public get value(): string {
    return this.state.value;
  }

  setError(error: string): void {
    this.setState({
      valueError: true,
      valueHelperText: error,
    });
  }

  onChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | {name?: string; value: unknown}
    >
  ): void {
    changeHandler.call(this, event);

    this.user_interaction = true;

    defer(() => {
      if (this.props.onChange) {
        this.props.onChange(this.state.value);
      }
    });
  }

  async validate(): Promise<boolean> {
    if (!this.user_interaction) {
      return false;
    }
    let error = "";
    const value = this.state.value.trim();

    if (!value) {
      error = i().ErrorInsertValue;
    }

    if (error) {
      this.setState({
        valueError: true,
        valueHelperText: error,
      });
      return false;
    }

    this.setState({
      valueError: false,
      valueHelperText: "",
    });
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
        autoFocus
        autoComplete="off"
        onChange={this.onChange.bind(this)}
        onBlur={this.onBlur.bind(this)}
        disabled={this.props.disabled}
      />
    );
  }
}
