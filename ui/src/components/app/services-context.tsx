import React, {Component, ReactElement} from "react";
import {IServices, Services} from "../../service/services";

export const ServicesContext = React.createContext<IServices>(Services);

export interface ServicesContextViewProps {
  services?: IServices;
}

export class ServicesContextView extends Component<ServicesContextViewProps> {
  render(): ReactElement {
    const services = this.props.services || Services;
    return (
      <ServicesContext.Provider value={services}>
        {this.props.children}
      </ServicesContext.Provider>
    );
  }
}
