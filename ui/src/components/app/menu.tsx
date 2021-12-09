import AssignmentInd from "@material-ui/icons/AssignmentInd";
import DashboardIcon from "@material-ui/icons/Dashboard";
import InfoIcon from "@material-ui/icons/Info";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import React, {ReactElement} from "react";
import {Link} from "react-router-dom";
import {User} from "../../service/user";
import {i} from "../../locale";

interface MenuItem {
  path: string;
  text: string;
  icon: ReactElement;
  auth?: (user: User) => boolean;
}

function getMenu(items: MenuItem[]): ReactElement {
  return (
    <div>
      {items.map((item) => (
        <Link to={item.path} key={item.path}>
          <ListItem button>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        </Link>
      ))}
    </div>
  );
}

export function getMainMenu(user: User): ReactElement {
  const mainItems: MenuItem[] = [
    {
      path: "/albums",
      text: i().Menu.Dashboard,
      icon: <DashboardIcon />,
    },
  ];

  return getMenu(
    mainItems.filter((item) => item.auth === undefined || item.auth(user))
  );
}

export function getSecondaryMenu(): ReactElement {
  return getMenu([
    {
      path: "/account",
      text: i().Menu.Account,
      icon: <AssignmentInd />,
    },
    {
      path: "/about",
      text: i().Menu.About,
      icon: <InfoIcon />,
    },
  ]);
}
