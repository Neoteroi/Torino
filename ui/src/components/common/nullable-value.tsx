import React, {ReactElement, Component} from "react";

interface NullableValueProps {
  value: any;
}

export default class Nullable extends Component<NullableValueProps> {
  render(): ReactElement {
    const {value} = this.props;

    if (value === null || value === undefined) {
      return <i>Null</i>;
    }
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}
