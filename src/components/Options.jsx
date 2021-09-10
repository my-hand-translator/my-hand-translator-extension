import React from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import Layout from "./shared/layouts";
import EditGlossary from "./EditGlossary";
import Popup from "./Popup";

function Options() {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route exact path="/">
            <Redirect to="/options.html" />
          </Route>
          <Route exact path="/popup">
            <Popup />
          </Route>
          <Route exact path="/my-glossary">
            <EditGlossary />
          </Route>
          <Route exact path="/my-translations">
            <div>My Translations</div>
          </Route>
          <Route exact path="/other-glossaries">
            <div>Other Glossaries</div>
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
}

export default Options;
