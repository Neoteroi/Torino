import defer from "lodash/defer";
import React, {Component, ReactElement, ChangeEvent} from "react";
import {ApplicationError} from "../../../common/errors";
import {changeHandler} from "../../../common/forms";
import array from "../../../common/arrays";

export interface AlbumPictureFieldProps {
  onChange?: (value: string) => void;
  value?: string | null;
  disabled?: boolean;
}

export interface AlbumPictureFieldState {
  error?: ApplicationError;
  value: string;
  valueError: boolean;
  valueHelperText: string;
}

const DEFAULT_PICTURES = [
  "/images/pexels-photo-1643457.jpeg",
  "/images/pexels-photo-4466546.jpeg",
  "/images/pexels-photo-460797.jpeg",
  "/images/pexels-photo-5706559.jpeg",
];

export default class AlbumPictureField extends Component<
  AlbumPictureFieldProps,
  AlbumPictureFieldState
> {
  constructor(props: AlbumPictureFieldProps) {
    super(props);

    this.state = {
      value: props.value || array.pick(DEFAULT_PICTURES),
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
    return (
      <div className="picture-selection">
        {DEFAULT_PICTURES.map((defaultPicture) => {
          return (
            <div key={defaultPicture}>
              <img src={defaultPicture} />
            </div>
          );
        })}
      </div>
    );

    /*
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
        disabled={this.props.disabled}
      />
    );*/
  }
}
