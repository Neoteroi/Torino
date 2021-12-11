import React from "react";
import {render} from "@testing-library/react";
import ErrorPanel from "./error";
import {ApplicationError} from "../../common/errors";

test("renders error title element", () => {
  const {getByText} = render(
    <ErrorPanel error={new ApplicationError("", 500)} />
  );
  const element = getByText(/Technical\serror/i);

  expect(element).toBeInTheDocument();
});

test("renders error message element", () => {
  const error = new ApplicationError("Lorem ipsum", 500);

  const {getByText} = render(<ErrorPanel error={error} />);
  const element = getByText(/An\sunexpected\serror\shas\soccurred/i);

  expect(element).toBeInTheDocument();
});
