import React, {Component, ReactElement} from "react";

export interface HeadProps {
  title: string;
}

export default class Head extends Component<HeadProps> {
  componentDidMount(): void {
    document.title = this.props.title;
  }

  render(): ReactElement {
    return <React.Fragment></React.Fragment>;
  }
}
