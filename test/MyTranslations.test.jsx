import React from "react";
import "@testing-library/jest-dom";

import { useSelector } from "react-redux";
import { render, fireEvent } from '@testing-library/react';
import MyTranslations from "../src/components/MyTranslations";

jest.mock("react-redux");

describe("MyTranslations component test", () => {
  beforeAll(async () => {
    window.IntersectionObserver = class IntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }

      disconnect() {
        return null;
      }

      observe(value) {
        this.callback([{
          isIntersecting: true,
        }]);
        return null;
      }

      takeRecords() {
        return null;
      }

      unobserve() {
        return null;
      }
    };

    const user = {
      clientId: "950605617290-fja07ouuq9tqihnksf0ac4jd50kpu3q4.apps.googleusercontent.com",
      translations: [{
        nanoId: "qWYBIfLPMsjP1LHNRqlFW",
        origin: "react",
        translated: "리액트",
        url: "vanilla"
      }],
      isServerOn: false,
      tokens: {
        idToken: "asdnoifqjeirnqoer"
      },
      email: "aidencoders@gmail.com"
    };

    useSelector.mockImplementation((selector) =>
      selector({
        user,
      }),
    );
  });

  afterAll(() => {
    delete window.IntersectionObserver;
  });

  test("should initial rendering showing translations with server off", () => {
    const { getByText } = render(<MyTranslations />);

    expect(getByText("react")).not.toBeNull();
    expect(getByText("리액트")).not.toBeNull();
    expect(getByText("vanilla")).not.toBeNull();
  });

  test("should to be able to search the contents.", () => {
    const { getByText, getByPlaceholderText } = render(<MyTranslations />);

    const input = getByPlaceholderText("검색어를 입력하세요.");
    const button = getByText("검색");

    fireEvent.change(input, {
      target: {
        value: "리액트",
      }
    });

    fireEvent.click(button);

    expect(getByText("리액트")).not.toBeNull();
  });
});
