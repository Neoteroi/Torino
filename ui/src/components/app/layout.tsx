import MenuIcon from "@material-ui/icons/Menu";
import React, {Component, ReactElement} from "react";

import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {getMainMenu, getSecondaryMenu} from "./menu";
import {getRoutes} from "./routes";
import {User} from "../../service/user";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Drawer,
  Divider,
  List,
} from "@material-ui/core";
// import SearchBar from "../common/search-bar";

export interface LayoutProps {
  id?: string;
  className?: string;
  user: User;
}

export interface LayoutState {
  drawerOpen: boolean;
}

const DrawerOpenKey = "DRAWER_OPEN";

export default class Layout extends Component<LayoutProps, LayoutState> {
  constructor(props: LayoutProps) {
    super(props);

    this.state = {
      drawerOpen: false,
    };
  }

  toggleDrawer(): void {
    const isOpen = this.state.drawerOpen;
    this.setState({drawerOpen: !isOpen});
    this.setInitialOpen(!isOpen);
  }

  setInitialOpen(value: boolean): void {
    localStorage.setItem(DrawerOpenKey, value ? "1" : "0");
  }

  readInitialOpen(): boolean {
    const drawerOpen = localStorage.getItem(DrawerOpenKey);
    return drawerOpen === "1" || drawerOpen === null;
  }

  componentDidMount(): void {
    this.setState({
      drawerOpen: this.readInitialOpen(),
    });
  }

  getClassName(): string {
    const {drawerOpen} = this.state;
    return [
      "theme-default",
      drawerOpen ? "ui-drawer-open" : "ui-drawer-closed",
    ]
      .filter((item) => !!item)
      .join(" ");
  }

  render(): ReactElement {
    const {user} = this.props;
    const open = this.state.drawerOpen;
    const routes = getRoutes(user);
    return (
      <div id="layout" className={this.getClassName()}>
        <Router>
          <AppBar position="static">
            <Toolbar className="main-toolbar">
              <div className="bar-contents">
                <Typography
                  component="h1"
                  variant="h6"
                  color="inherit"
                  noWrap
                  className="headline"
                >
                  Torino
                </Typography>
                {/* <SearchBar /> */}
              </div>
              <div>
                <div>
                  <nav className="ui-menu-parent" role="navigation">
                    <ul className="ui-menu">
                      {/*
                      <li>
                        <span tabIndex={0}>
                          <AccountCircle />
                        </span>
                        <ul className="dropdown anchor-right">
                          <li onClick={() => logout()}>
                            <span tabIndex={0}>Logout</span>
                          </li>
                        </ul>
                      </li>
                      */}
                    </ul>
                  </nav>
                </div>
              </div>
            </Toolbar>
          </AppBar>
          <Drawer
            id="main-drawer"
            variant="permanent"
            className="drawer"
            open={open}
          >
            <div className="drawer-toggle-btn">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={() => this.toggleDrawer()}
              >
                <MenuIcon />
              </IconButton>
            </div>
            <Divider />
            <List id="main-menu">{getMainMenu(user)}</List>
            <Divider />
            <List>{getSecondaryMenu()}</List>
          </Drawer>
          <main>
            <div id="content-area">
              <Switch>
                {routes.map((route, index) => (
                  <Route key={index} path={route.path} exact={route.exact}>
                    {route.main}
                  </Route>
                ))}
              </Switch>
            </div>
          </main>
        </Router>
      </div>
    );
  }
}
