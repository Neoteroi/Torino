import React, {ReactElement} from "react";
import {RouteConfiguration} from "../../common/routing";
import {Link, Switch, Route} from "react-router-dom";
import {Button} from "@material-ui/core";

function selectedRoute(route: RouteConfiguration): boolean {
  return route.path === window.location.pathname;
}

export function Tabs(subRoutes: RouteConfiguration[]): ReactElement {
  return (
    <div>
      <div className="tabs">
        {subRoutes
          .filter((item) => !item.hidden)
          .map((route) => {
            return (
              <div
                key={route.path}
                className={"tab" + (selectedRoute(route) ? " selected" : "")}
              >
                <Link to={route.path}>
                  <Button>{route.name}</Button>
                </Link>
              </div>
            );
          })}
      </div>
      <div className="wrapper">
        <Switch>
          {subRoutes.map((route) => {
            return (
              <Route
                key={route.path}
                exact={route.exact}
                path={route.path}
                component={route.main}
              />
            );
          })}
        </Switch>
      </div>
    </div>
  );
}
