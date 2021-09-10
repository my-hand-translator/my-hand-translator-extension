import React from "react";
import { render } from "react-dom";

import { globalCss } from "./config/stitches.config";
import reset from "./config/reset";

import Options from "./components/Options";

globalCss(reset)();

render(<Options />, document.getElementById("options"));
