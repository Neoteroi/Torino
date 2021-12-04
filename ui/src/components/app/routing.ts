import {RouteConfiguration} from "../../common/routing";
import {User} from "../../service/user";

export interface AuthRouteConfiguration extends RouteConfiguration {
  auth?: (user: User) => boolean;
}
