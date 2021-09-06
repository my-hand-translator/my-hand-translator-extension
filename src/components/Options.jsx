import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";

import Popup from "./Popup";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};

function Options() {
  return (
    <Router>
      <div style={styles.container}>
        <h1>Options</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Options</Link>
            </li>
            <li>
              <Link to="/popup">Popup</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route exact path="/">
            <Redirect to="/options.html" />
          </Route>
          <Route exact path="/popup">
            <Popup />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default Options;
