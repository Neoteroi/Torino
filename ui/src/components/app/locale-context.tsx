import React, {Component, ReactElement} from "react";
import {vocabulary} from "../../locale";

export const LocaleContext = React.createContext<typeof vocabulary>(
  vocabulary
);

export interface LocaleContextViewProps {
  locale: typeof vocabulary;
}

export class LocaleContextView extends Component<LocaleContextViewProps> {
  render(): ReactElement {
    const locale = this.props.locale || vocabulary;
    return (
      <LocaleContext.Provider value={locale}>
        {this.props.children}
      </LocaleContext.Provider>
    );
  }
}
