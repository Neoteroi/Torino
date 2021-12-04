import React, {Component, ReactElement} from "react";
import {FileSystemNode} from "../../../service/domain/vfs";
import {IServices} from "../../../service/services";
import {ServicesContext} from "../services-context";
import {downloadURL} from "../../../common/files";

export interface FileDownloadLinkProps {
  node: FileSystemNode;
}

export default class FileDownloadLink extends Component<FileDownloadLinkProps> {
  async onClick(services: IServices): Promise<void> {
    // Note: a simple anchor element with download attribute
    // does not work, because the API is protected by JWT Bearer authentication
    // It would work if we used cookie based authentication, since cookies
    // are sent by default at each web request.
    const {node} = this.props;
    const data = await services.albums.getFileURL(node);

    downloadURL(data.url, node.name);
  }

  render(): ReactElement {
    const {node} = this.props;
    return (
      <ServicesContext.Consumer>
        {(services) => (
          <button
            type="button"
            className="fake-anchor"
            onClick={() => this.onClick(services)}
          >
            {node.name}
          </button>
        )}
      </ServicesContext.Consumer>
    );
  }
}
