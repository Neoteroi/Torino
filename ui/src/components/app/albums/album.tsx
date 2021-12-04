import Panel from "../../common/panel";
import React, {Component, ReactElement} from "react";
import {ApplicationError} from "../../../common/errors";
import {IServices} from "../../../service/services";
import {Album, AlbumDetails} from "../../../service/domain/albums";
import Alert, {AlertSeverity} from "../../common/alert";
import Loader from "../../common/loader";
import ErrorPanel from "../../common/error";
import Head from "../../common/head";
import FoldersPage from "../vfs/folders-page";
import {ContainerReadAuth} from "../../../service/domain/blobs";
import {UserContext} from "../user-context";

export interface AlbumPageProps {
  id: string;
  folderId?: string;
  services: IServices;
}

export interface AlbumPageState {
  loading: boolean;
  waiting: boolean;
  error?: ApplicationError;
  loadingError?: ApplicationError;
  details: AlbumDetails | null;
  auth: ContainerReadAuth | null;
}

export default class AlbumPage extends Component<
  AlbumPageProps,
  AlbumPageState
> {
  constructor(props: AlbumPageProps) {
    super(props);

    this.state = {
      loading: true,
      waiting: false,
      details: null,
      auth: null,
    };
    this.load();
  }

  get id(): string {
    return this.props.id;
  }

  componentDidUpdate(props: AlbumPageProps): void {
    if (props.id !== this.id) {
      this.load();
    }
  }

  load(): void {
    const service = this.props.services.albums;
    const blobService = this.props.services.blobs;

    if (!this.state.loading) {
      this.setState({
        loading: true,
        loadingError: undefined,
      });
    }

    service.getAlbumById(this.id).then(
      (data) => {
        blobService.getContainerReadAuthContext(this.id).then(
          (auth) => {
            this.setState({
              loading: false,
              details: data,
              auth,
            });
          },
          (error: ApplicationError) => {
            this.setState({
              loading: false,
              loadingError: error,
            });
          }
        );
      },
      (error: ApplicationError) => {
        this.setState({
          loading: false,
          loadingError: error,
        });
      }
    );
  }

  onUpdate(album: Album): void {
    const {details} = this.state;
    if (details !== null && details.id === album.id) {
      details.name = album.name;
      details.description = album.description;

      document.title = details.name;
    }
    this.setState({details});
  }

  render(): ReactElement {
    const {id, folderId, services} = this.props;
    const {auth, loading, error, details, waiting, loadingError} = this.state;

    return (
      <Panel loading={loading} error={loadingError}>
        {waiting && <Loader className="overlay" />}
        {details === null && (
          <Alert
            title="Album not found"
            message={`The Album with id ${id} was not found.`}
            severity={AlertSeverity.info}
          />
        )}
        {details !== null && auth !== null && (
          <div>
            <Head title={details.name} />
            {error && (
              <section>
                <ErrorPanel error={error} />
              </section>
            )}
            <div>
              <UserContext.Consumer>
                {(user) => (
                  <FoldersPage
                    services={services}
                    albumId={id}
                    album={details}
                    auth={auth}
                    folderId={folderId || ""}
                    onUpdate={(data) => this.onUpdate(data)}
                    user={user}
                  />
                )}
              </UserContext.Consumer>
            </div>
          </div>
        )}
      </Panel>
    );
  }
}
