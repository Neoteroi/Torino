import React, {Component, ReactElement} from "react";

export interface FoldersTreeProps {
  id?: string;
}

export interface FoldersTreeState {
  loading: boolean;
}

export default class FoldersTree extends Component<FoldersTreeProps> {
  render(): ReactElement {
    const {id} = this.props;
    return (
      <div id={id}>
        {/*
        TODO: fetch a list of folders; support pagination?

        */}
      </div>
    );
  }
}
