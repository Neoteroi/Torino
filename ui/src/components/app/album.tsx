import Album from "./albums/album";
import Head from "../common/head";
import React, {ReactElement} from "react";
import {AuthRouteConfiguration} from "./routing";
import {i} from "../../locale";
import {ServicesContext} from "./services-context";
import {Tabs} from "../common/tabs";
import {User} from "../../service/user";
import {useParams} from "react-router-dom";

function AlbumPage(): ReactElement {
  const {album_id, folder_id} = useParams<{
    album_id: string;
    folder_id?: string;
  }>();
  return (
    <React.Fragment>
      <Head title="Album details" />
      <ServicesContext.Consumer>
        {(services) => (
          <Album id={album_id} folderId={folder_id} services={services} />
        )}
      </ServicesContext.Consumer>
    </React.Fragment>
  );
}

export function getAlbumPage(user: User): () => ReactElement {
  const subRoutes: AuthRouteConfiguration[] = [
    {
      path: "/album/:album_id/:folder_id?",
      name: i().Pages.Albums,
      exact: false,
      hidden: true,
      main: AlbumPage,
    },
  ];

  return (): ReactElement =>
    Tabs(
      subRoutes.filter((route) => route.auth === undefined || route.auth(user))
    );
}
