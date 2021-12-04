import {getAlbumsPage} from "./albums";
import {getAlbumPage} from "./album";
import {getAccountPage} from "./account";
import {ReactElement} from "react";
import {User} from "../../service/user";

interface Route {
  path: string;
  exact: boolean;
  main: () => ReactElement;
  auth?: (user: User) => boolean;
}

function _getRoutes(user: User): Route[] {
  return [
    {
      path: "/albums",
      exact: false,
      main: getAlbumsPage(user),
    },
    {
      path: "/album",
      exact: false,
      main: getAlbumPage(user),
    },
    {
      path: "/account",
      exact: false,
      main: getAccountPage(user),
    },
  ];
}

export function getRoutes(user: User): Route[] {
  return _getRoutes(user).filter(
    (item) => item.auth === undefined || item.auth(user)
  );
}
