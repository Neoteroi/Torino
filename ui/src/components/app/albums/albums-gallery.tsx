import {
  Button,
  Card,
  CardActionArea,
  CardMedia,
  Typography,
  CardContent,
} from "@material-ui/core";
import React, {Component, ReactElement} from "react";
import {Link} from "react-router-dom";
import {ApplicationError} from "../../../common/errors";
import {i} from "../../../locale";
import {AlbumsAPI, Album} from "../../../service/domain/albums";
import Panel from "../../common/panel";

export interface AlbumsProps {
  services: AlbumsAPI;
}

export interface AlbumsState {
  loading: boolean;
  error?: ApplicationError;
  albums: Album[];
}

export default class Albums extends Component<AlbumsProps, AlbumsState> {
  constructor(props: AlbumsProps) {
    super(props);

    this.state = {
      loading: true,
      albums: [],
    };

    this.load();
  }

  load(): void {
    const {services} = this.props;

    if (!this.state.loading) {
      this.setState({
        loading: true,
        error: undefined,
      });
    }

    services.getAlbums().then(
      (albums) => {
        this.setState({
          loading: false,
          albums,
        });
      },
      (error: ApplicationError) => {
        error.retry = () => {
          this.load();
        };
        this.setState({
          loading: false,
          error,
        });
      }
    );
  }

  render(): ReactElement {
    const {loading, error, albums} = this.state;

    return (
      <Panel loading={loading} error={error}>
        {albums.length === 0 && (
          <div>
            <h2>{i().YouDontHaveAnyAlbum}</h2>
            <Link to="/albums/new">
              <Button>{i().CreateYourFirstAlbum}</Button>
            </Link>
          </div>
        )}
        <div className="cards">
          {albums.map((container) => {
            return (
              <Link to={"/album/" + container.id} key={container.id}>
                <Card className="card-root">
                  <CardMedia
                    image={
                      container.image_url || "/images/pexels-photo-156934.jpeg"
                    }
                    className="card-image"
                  />
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h2">
                        {container.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            );
          })}
        </div>
      </Panel>
    );
  }
}
