import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import React from "react";
import {Component, ReactElement} from "react";
import {AlertSeverity} from "../alert";
import ErrorPanel, {ErrorProps} from "../error";
import {DialogSize} from "./size";

export enum DialogButtonColor {
  primary = "primary",
  secondary = "secondary",
  default = "default",
}

export interface DialogButton {
  id: string;
  label: string;
  onClick: () => void;
  color?: DialogButtonColor;
  disabled?: boolean;
}

export interface GenericDialogProps {
  title: string;
  description: string;
  open: boolean;
  close: () => void;
  error?: ErrorProps;
  buttons: DialogButton[];
  size?: DialogSize;
  className?: string;
  severity?: AlertSeverity;
}

export function closedDialog(): GenericDialogProps {
  return {
    open: false,
    title: "",
    description: "",
    close: (): void => {
      return;
    },
    buttons: [],
  };
}

function getSizeClass(size?: DialogSize): string {
  return size ? size : DialogSize.normal;
}

function getClass(className?: string): string {
  return className ? ` ${className}` : "";
}

function getButtonsClassName(buttons: DialogButton[]): string {
  if (buttons.length > 1) {
    return "dialog-buttons";
  }
  if (buttons.length === 1) {
    return "dialog-single-button";
  }
  return "";
}

export default class GenericDialog extends Component<GenericDialogProps> {
  renderSeverityIcon(severity: AlertSeverity): ReactElement {
    if (severity === AlertSeverity.warning) {
      return <i className="fas fa-exclamation-triangle"></i>;
    }

    return <i className="fas fa-info"></i>;
  }

  render(): ReactElement {
    const {
      open,
      close,
      title,
      description,
      error,
      size,
      buttons,
      children,
      className,
      severity,
    } = this.props;

    return (
      <Dialog
        open={open}
        onClose={() => close()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={
          "dialog generic-dialog " + getSizeClass(size) + getClass(className)
        }
      >
        <DialogTitle>
          {severity !== undefined && this.renderSeverityIcon(severity)}
          {title}
        </DialogTitle>
        <DialogContent>
          {description && <DialogContentText>{description}</DialogContentText>}
          {children}
          {error !== undefined && <ErrorPanel {...error} />}
        </DialogContent>
        {buttons.length ? (
          <DialogActions className={getButtonsClassName(buttons)}>
            {buttons.map((item) => (
              <Button
                key={item.id}
                onClick={() => item.onClick()}
                className={item.id}
                color={item.color}
                disabled={item.disabled}
              >
                {item.label}
              </Button>
            ))}
          </DialogActions>
        ) : (
          <React.Fragment></React.Fragment>
        )}
      </Dialog>
    );
  }
}
