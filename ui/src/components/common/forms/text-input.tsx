import React, {Component, ReactElement} from "react";
import {TextField} from "@material-ui/core";
import {defer} from "lodash";
import {changeHandler} from "../../../common/forms";

export interface TextInputProps {
  value?: string | null;
  disabled?: boolean;
  onChange?: (value: string) => void;
  validate?: (value: string) => Promise<string | null>;
  format?: (value: string) => string;
  autoFocus?: boolean;
  required?: boolean;
}

interface TextInputState {
  value: string;
  valueError: boolean;
  valueHelperText: string;
}

/**
 * Common component for text input fields.
 */
export default class TextInput extends Component<
  TextInputProps,
  TextInputState
> {
  _user_interaction: boolean;

  constructor(props: TextInputProps) {
    super(props);

    this._user_interaction = false;
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

  onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this._user_interaction = true;

    const {disabled, onChange} = this.props;
    if (disabled) {
      event.preventDefault();
      return;
    }

    changeHandler.call(this, event);
    defer(() => {
      if (onChange) {
        onChange(this.state.value);
      }
    });
  }

  async validate(): Promise<boolean> {
    const {value} = this.state;
    const {required, validate} = this.props;

    if (required && !value) {
      this.setState({
        valueError: true,
        valueHelperText: "Please insert a value",
      });
      return false;
    }

    if (validate) {
      try {
        const error = await validate(value);

        if (error) {
          this.setState({
            valueError: true,
            valueHelperText: error,
          });
          return false;
        }
      } catch (error) {
        this.setState({
          valueError: true,
          valueHelperText: "Validation failed",
        });
        return false;
      }
    }

    if (this.state.valueError)
      this.setState({
        valueError: false,
        valueHelperText: "",
      });
    return true;
  }

  onBlur(): boolean {
    const {format} = this.props;
    let value = this.state.value;

    if (!this._user_interaction) {
      return true;
    }

    if (format) {
      value = format(value);
    } else {
      value = value.trim();
    }

    if (value !== this.state.value) {
      this.setState({
        value: value,
      });
    }
    defer(() => {
      this.validate();
    });

    return true;
  }

  render(): ReactElement {
    const {autoFocus, disabled} = this.props;
    const {value, valueError, valueHelperText} = this.state;

    return (
      <TextField
        variant="outlined"
        error={valueError}
        helperText={valueHelperText}
        name="value"
        value={value}
        autoComplete="off"
        onChange={this.onChange.bind(this)}
        onBlur={this.onBlur.bind(this)}
        disabled={disabled}
        autoFocus={autoFocus}
        fullWidth
        inputRef={
          autoFocus
            ? (input) => input && setTimeout(() => input.focus(), 0)
            : undefined
        }
      />
    );
  }
}
