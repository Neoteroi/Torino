import {Button} from "@material-ui/core";
import React, {Component, ReactElement} from "react";
import {ApplicationError, ConflictError} from "../../../common/errors";
import {i} from "../../../locale";
import {AlbumsAPI} from "../../../service/domain/albums";
import Form from "../../common/forms/form";
import AlbumDescriptionField from "./album-description-field";
import AlbumNameField from "./album-name-field";
import AlbumPictureField from "./album-picture-field";
import array from "../../../common/arrays";
import * as H from "history";

export interface NewAlbumProps {
  services: AlbumsAPI;
  history: H.History<H.LocationState>;
}

export interface NewAlbumState {
  waiting: boolean;
  error: ApplicationError | null;
}

const DEFAULT_PICTURES = ["/images/web_artist.jpg"];

export default class NewAlbum extends Component<NewAlbumProps, NewAlbumState> {
  private nameField: React.RefObject<AlbumNameField>;
  private descriptionField: React.RefObject<AlbumDescriptionField>;
  private pictureField: React.RefObject<AlbumPictureField>;

  constructor(props: NewAlbumProps) {
    super(props);

    this.nameField = React.createRef();
    this.descriptionField = React.createRef();
    this.pictureField = React.createRef();

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

      this.props.services
        .createAlbum({
          name: this.nameField.current?.value || "",
          storage_id: null,
          image_url:
            this.pictureField.current?.value || array.pick(DEFAULT_PICTURES),
          description: this.descriptionField.current?.value || "",
          public: false,
        })
        .then(
          () => {
            this.setState({
              error: null,
              waiting: false,
            });

            this.props.history.push("/albums");
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
    const {waiting, error} = this.state;

    return (
      <Form waiting={waiting} error={error} onSubmit={() => this.confirm()}>
        <h2>{i().CreateNewAlbum}</h2>
        <p className="note">An album is a container for files.</p>
        <dl>
          <dt>{i().Name}</dt>
          <dd>
            <AlbumNameField ref={this.nameField} />
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
            <AlbumDescriptionField ref={this.descriptionField} />
          </dd>
        </dl>
        <div className="buttons-area">
          <Button type="submit">{i().Confirm}</Button>
        </div>
      </Form>
    );
  }
}
