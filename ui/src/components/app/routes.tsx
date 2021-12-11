import {getAboutPage} from "./about";
import {getAccountPage} from "./account";
import {getAlbumPage} from "./album";
import {getAlbumsPage} from "./albums";
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
    {
      path: "/about",
      exact: false,
      main: getAboutPage(),
    },
  ];
}

export function getRoutes(user: User): Route[] {
  return _getRoutes(user).filter(
    (item) => item.auth === undefined || item.auth(user)
  );
}
