import {ApplicationError} from "../../common/errors";
import {AlertSeverity} from "./alert";
import {vocabulary, i} from "../../locale";

export interface ErrorRepresentation {
  title: string;
  message: string;
  severity: AlertSeverity;
}

const TechnicalError = {
  title: "Technical error",
  message:
    "An unexpected error has occurred. " +
    "Please contact the service administrators if the problem persists.",
  severity: AlertSeverity.error,
};

function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName];
}

/**
 * Maps an instance of ApplicationError to an object that describes it.
 */
export function reprError(error: ApplicationError): ErrorRepresentation {
  if (!(error instanceof ApplicationError)) {
    // this can happen in TypeScript;
    // caught exceptions are `any` and it is comfortable to handle any
    // exception here, even when we think we should receive a specific type
    return TechnicalError;
  }

  const data = error.data;

  if (data instanceof Object && "error" in data) {
    const errorCode = data.error;
    const currentVocabulary = i();

    if (errorCode in currentVocabulary.Errors) {
      const info = getProperty(
        currentVocabulary.Errors,
        errorCode as keyof typeof vocabulary.Errors
      );

      return {
        title: info.title,
        message: info.message,
        severity: AlertSeverity.warning,
      };
    }
  }

  switch (error.status) {
    case 202:
      return {
        title: "Accepted",
        message:
          error.message ||
          "The operation has been accepted for processing, " +
            "but it has not been completed.",
        severity: AlertSeverity.info,
      };
    case 419: // custom
      return {
        title: "Warning",
        message: error.message,
        severity: AlertSeverity.warning,
      };
    case 404:
      return {
        title: "Object not found",
        message: error.message,
        severity: AlertSeverity.warning,
      };
    case 401:
      return {
        title: "Unauthorized",
        message: error.message || "Your session might have expired.",
        severity: AlertSeverity.warning,
      };
    case 403:
      return {
        title: "Forbidden",
        message:
          error.message ||
          "You are not authorized to complete the requested operation.",
        severity: AlertSeverity.warning,
      };
    case 409:
      return {
        title: "Conflict",
        message:
          error.message ||
          "You are not authorized to complete the requested operation.",
        severity: AlertSeverity.warning,
      };
    default:
      return TechnicalError;
  }
}
