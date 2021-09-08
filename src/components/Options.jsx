import React from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";

import Popup from "./Popup";

function Options() {
  return (
    <Router>
      <h1>Options</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Options</Link>
          </li>
          <li>
            <Link to="/my-glossary">My Glossary</Link>
          </li>
          <li>
            <Link to="/my-translations">My Translations</Link>
          </li>
          <li>
            <Link to="/other-glossaries">Other Glossaries</Link>
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
        <Route exact path="/my-glossary">
          <div>My Glossary</div>
        </Route>
        <Route exact path="/my-translations">
          <div>My Translations</div>
        </Route>
        <Route exact path="/other-glossaries">
          <div>Other Glossaries</div>
        </Route>
      </Switch>
    </Router>
  );
}

export default Options;
