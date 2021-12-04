import Albums from "./albums/albums-gallery";
import Head from "../common/head";
import NewAlbumForm from "./albums/new-album";
import React, {ReactElement} from "react";
import {AuthRouteConfiguration} from "./routing";
import {i} from "../../locale";
import {ServicesContext} from "./services-context";
import {Tabs} from "../common/tabs";
import {User} from "../../service/user";
import {useHistory} from "react-router-dom";

function AlbumsList(): ReactElement {
  return (
    <React.Fragment>
      <Head title={i().Pages.Albums} />
      <ServicesContext.Consumer>
        {(services) => <Albums services={services.albums} />}
      </ServicesContext.Consumer>
    </React.Fragment>
  );
}

function NewAlbumPage(): ReactElement {
  const history = useHistory();
  return (
    <React.Fragment>
      <Head title={i().Pages.NewAlbum} />
      <ServicesContext.Consumer>
        {(services) => (
          <NewAlbumForm history={history} services={services.albums} />
        )}
      </ServicesContext.Consumer>
    </React.Fragment>
  );
}

export function getAlbumsPage(user: User): () => ReactElement {
  const subRoutes: AuthRouteConfiguration[] = [
    {
      path: "/albums",
      name: i().Pages.Albums,
      exact: true,
      main: AlbumsList,
    },
    {
      path: "/albums/new",
      name: i().Pages.NewAlbum,
      exact: true,
      main: NewAlbumPage,
      auth: (user) => {
        return user.can("ALBUMS_WRITE");
      },
    },
  ];

  return (): ReactElement =>
    Tabs(
      subRoutes.filter((route) => route.auth === undefined || route.auth(user))
    );
}
