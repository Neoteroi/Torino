import React, {Component, ReactElement} from "react";
import {Link} from "react-router-dom";
import {ApplicationError} from "../../../common/errors";
import {FileSystemNodePathFragment} from "../../../service/domain/vfs";
import {IServices} from "../../../service/services";
import Panel from "../../common/panel";

export interface NodePathProps {
  services: IServices;
  albumId: string;
  folderId: string;
}

export interface NodePathState {
  value: string;
  loading: boolean;
  error: ApplicationError | null;
  path: FileSystemNodePathFragment[];
}

export default class NodePath extends Component<NodePathProps, NodePathState> {
  constructor(props: NodePathProps) {
    super(props);

    this.state = {
      value: "",
      loading: props.folderId !== "",
      error: null,
      path: [],
    };

    this.load();
  }

  componentDidUpdate(props: NodePathProps): void {
    if (this.props.folderId !== props.folderId) {
      this.load();
    }
  }

  load(): void {
    if (this.props.folderId === "") {
      if (this.state.path.length !== 0) {
        this.setState({path: []});
      }
      return;
    }

    const service = this.props.services.fs;

    if (!this.state.loading) {
      this.setState({
        loading: true,
        error: null,
      });
    }

    const {folderId} = this.props;

    service.getNodePath(folderId).then(
      (data) => {
        this.setState({
          loading: false,
          path: data,
        });
      },
      (error: ApplicationError) => {
        this.setState({
          loading: false,
          error,
        });
      }
    );
  }

  shouldDisplayEllipsis(): boolean {
    const {albumId} = this.props;
    const {path} = this.state;
    return (
      path.length > 0 &&
      path.find(
        (item) => item.parent_id === null || item.parent_id == albumId
      ) === undefined
    );
  }

  render(): ReactElement {
    const {albumId, folderId} = this.props;
    const {path, error} = this.state;
    const basePath = "/album/" + albumId;

    // TODO: remove loading state here, settings the loading below
    // causes an unpleasant flashing effect
    return (
      <div className="node-path">
        <Panel error={error} loading={false} loaderClassName="mini">
          <Link key={albumId} to={basePath} title={"Root folder"}>
            /root
          </Link>
          {this.shouldDisplayEllipsis() && <span className="divider">…</span>}
          {path.map((fragment) => {
            if (fragment.id === folderId) {
              return (
                <span
                  className="current-folder"
                  key={fragment.id}
                  title="Current folder"
                >
                  /{fragment.name}
                </span>
              );
            }
            return (
              <Link key={fragment.id} to={basePath + `/${fragment.id}`}>
                /{fragment.name}
              </Link>
            );
          })}
        </Panel>
      </div>
    );
  }
}
