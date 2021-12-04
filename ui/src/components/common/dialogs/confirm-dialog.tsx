import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import ErrorPanel from "../error";
import React from "react";
import {Component, ReactElement} from "react";
import {ApplicationError} from "../../../common/errors";
import {DialogSize} from "./size";

export interface ConfirmDialogProps {
  title: string;
  description: string;
  open: boolean;
  close: () => void;
  confirm: () => void;
  fragment?: ReactElement;
  error?: ApplicationError;
  noButtons?: true;
  size?: DialogSize;
}

export function closedDialog(): ConfirmDialogProps {
  return {
    open: false,
    title: "",
    description: "",
    close: (): void => {
      return;
    },
    confirm: (): void => {
      return;
    },
  };
}

function getSizeClass(size?: DialogSize): string {
  return size ? size : DialogSize.normal;
}

export default class ConfirmDialog extends Component<ConfirmDialogProps> {
  render(): ReactElement {
    const {
      open,
      close,
      title,
      description,
      fragment,
      error,
      noButtons,
      confirm,
      size,
    } = this.props;

    return (
      <Dialog
        open={open}
        onClose={() => close()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={"dialog confirm-dialog " + getSizeClass(size)}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {description && <DialogContentText>{description}</DialogContentText>}
          {fragment !== undefined && fragment}
          {error !== undefined && <ErrorPanel error={error} />}
        </DialogContent>
        {noButtons === undefined && (
          <DialogActions className="dialog-buttons">
            <Button
              onClick={() => close()}
              autoFocus
              className="cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => confirm()}
              className="confirm-button"
              color="secondary"
            >
              Confirm
            </Button>
          </DialogActions>
        )}
      </Dialog>
    );
  }
}
