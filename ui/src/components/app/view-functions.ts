import {ApplicationError} from "../../common/errors";
import {Component, ReactElement} from "react";
import {ConfirmDialogProps} from "../common/dialogs/confirm-dialog";
import {DialogSize} from "../common/dialogs/size";

interface ILoaderViewInterface {
  loading: boolean;
  error?: ApplicationError;
}

interface IConfirmDialog extends ILoaderViewInterface {
  confirm: ConfirmDialogProps;
}

/**
 * Common function to load details, handling errors and loading state.
 */
export async function loadData<T, U extends ILoaderViewInterface>(
  component: Component<unknown, U>,
  provider: () => Promise<T | null>
): Promise<T | null> {
  component.setState({
    loading: true,
    error: undefined,
  });
  try {
    const data = await provider();
    component.setState({
      loading: false,
      error: undefined,
    });
    return data;
  } catch (error) {
    component.setState({
      loading: false,
      error,
    });
    return null;
  }
}

/**
 * Common function to display an edit view inside a dialog.
 */
export function showEditViewInDialog<U extends IConfirmDialog>(
  component: Component<unknown, U>,
  title: string,
  fragment: ReactElement
): void {
  component.setState({
    confirm: {
      open: true,
      title: title,
      description: "",
      fragment,
      close: () => {
        return;
      },
      confirm: () => {
        return;
      },
      noButtons: true,
      size: DialogSize.medium,
    },
  });
}

/**
 * Common function to dismiss a confirmation dialog.
 */
export function dismissDialog<U extends IConfirmDialog>(
  component: Component<unknown, U>
): void {
  const dialog = component.state.confirm;
  dialog.open = false;
  component.setState({
    loading: false,
    confirm: dialog,
  });
}

/**
 * Common function to add error details to a confirmation dialog.
 */
export function addErrorToDialog<U extends IConfirmDialog>(
  component: Component<unknown, U>,
  error: ApplicationError
): void {
  const dialog = component.state.confirm;
  dialog.error = error;
  component.setState({
    loading: false,
    confirm: dialog,
  });
}
