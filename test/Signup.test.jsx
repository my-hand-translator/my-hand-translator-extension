import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";

import Signup from "../src/components/Signup";
import { user } from "../src/utils/test-utils";

describe("Signup component test", () => {
  beforeEach(() => {
    const mockHandleSignupResult = jest.fn();

    console.log(user);
    act(() => {
      render(<Signup handleSignupResult={mockHandleSignupResult} user={user} />);
    });
  });
  test("rendering test", () => {

    expect(screen.getByText("사용자 등록하기")).toBeInTheDocument();
  });
});
