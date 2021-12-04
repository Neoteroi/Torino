import {RouteComponentProps} from "react-router-dom";

export interface RouteConfiguration {
  name: string;
  path: string;
  exact: boolean;
  hidden?: true;
  main:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
}
