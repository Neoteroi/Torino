import React, {Component, ReactElement} from "react";
import SearchIcon from "@material-ui/icons/Search";
import {InputBase} from "@material-ui/core";
import {i} from "../../locale";

export interface SearchBarProps {
  id?: string;
}

export default class SearchBar extends Component<SearchBarProps> {
  render(): ReactElement {
    const {id} = this.props;
    return (
      <div id={id} className="search-bar">
        <div className="search-icon">
          <SearchIcon />
        </div>
        <InputBase placeholder={i().Search} className="search-field" />
      </div>
    );
  }
}
