import {createMuiTheme, Theme} from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";

// primary #56073e 94146d?
// secondary #398ec1 177f63?

export default function getMuiTheme(impersonating: boolean): Theme {
  return createMuiTheme({
    palette: {
      primary: {
        main: impersonating ? "#56073e" : "#0f4245",
      },
      secondary: {
        main: impersonating ? "#398ec1" : "#dc004e",
      },
      error: {
        main: red.A400,
      },
      background: {
        default: "#fff",
      },
    },
    props: {
      MuiButton: {
        variant: "outlined",
        color: "primary",
      },
      MuiTextField: {},
    },
  });
}
