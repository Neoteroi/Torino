import React, {Component, ReactElement} from "react";
import {
  ApplicationError,
  ConflictError,
  PreconditionFailedError,
} from "../../../common/errors";
import {IServices} from "../../../service/services";
import {Album, AlbumDetails} from "../../../service/domain/albums";
import AlbumNameField from "./album-name-field";
import Form from "../../common/forms/form";
import AlbumDescriptionField from "./album-description-field";
import {Button} from "@material-ui/core";
import {i} from "../../../locale";

export interface AlbumSettingsProps {
  album: AlbumDetails;
  services: IServices;
  onUpdate: (album: Album) => void;
  onCancel: () => void;
}

export interface AlbumSettingsState {
  waiting: boolean;
  error: ApplicationError | null;
}

export default class AlbumSettings extends Component<
  AlbumSettingsProps,
  AlbumSettingsState
> {
  private nameField: React.RefObject<AlbumNameField>;
  private descriptionField: React.RefObject<AlbumDescriptionField>;

  constructor(props: AlbumSettingsProps) {
    super(props);

    this.nameField = React.createRef();
    this.descriptionField = React.createRef();

    this.state = {
      waiting: false,
      error: null,
    };
  }

  async validate(): Promise<boolean> {
    const results = await Promise.all([
      this.nameField.current?.validate(),
      this.descriptionField.current?.validate(),
      // this.pictureField.current?.validate(),
    ]);

    return results.every((item) => item === true);
  }

  confirm(): void {
    const nameField = this.nameField.current;

    if (nameField) {
      nameField.user_interaction = true;
    }

    this.validate().then((valid) => {
      if (!valid) {
        return;
      }

      this.setState({
        error: null,
        waiting: true,
      });

      const {album} = this.props;

      this.props.services.albums
        .updateAlbum({
          id: album.id,
          name: this.nameField.current?.value || "",
          image_url: "",
          description: this.descriptionField.current?.value || "",
          etag: album.etag,
          public: false,
        })
        .then(
          (data) => {
            this.setState({
              error: null,
              waiting: false,
            });
            this.props.onUpdate(data);
          },
          (error: ApplicationError) => {
            if (error instanceof ConflictError) {
              this.nameField.current?.setError(
                "An album already exists with this name"
              );
              this.setState({
                waiting: false,
              });
              return;
            }
            if (error instanceof PreconditionFailedError) {
              this.nameField.current?.setError(
                "The album was modified since it was loaded on the page."
              );
              this.setState({
                waiting: false,
              });
              return;
            }
            error.retry = () => {
              this.confirm();
            };
            this.setState({
              error,
              waiting: false,
            });
          }
        );
    });
  }

  render(): ReactElement {
    const {album} = this.props;
    const {waiting, error} = this.state;

    return (
      <Form waiting={waiting} error={error} onSubmit={() => this.confirm()}>
        <dl>
          <dt>{i().Name}</dt>
          <dd>
            <AlbumNameField ref={this.nameField} value={album.name} />
          </dd>
          {/*
          TODO: enable selection
          <dt>{i().Picture}</dt>
          <dd>
            <AlbumPictureField ref={this.pictureField} />
          </dd>
          */}
          <dt>Description</dt>
          <dd>
            <AlbumDescriptionField
              ref={this.descriptionField}
              value={album.description}
            />
          </dd>
          {/*
          <dt>Access level</dt>
          <dd>
            <select>
              <option>Private</option>
              <option>Public read access</option>
            </select>
          </dd>
          */}
        </dl>
        <div className="buttons-area">
          <Button onClick={() => this.props.onCancel()}>{i().Cancel}</Button>
          <Button type="submit" color="secondary">
            {i().Confirm}
          </Button>
        </div>
      </Form>
    );
  }
}
