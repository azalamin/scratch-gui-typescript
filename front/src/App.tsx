import React, { lazy, Suspense, Fragment, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LoadingGif } from "./components/elements/Loading";
import { Provider } from "react-redux";
import store from "./store";
import setAuthToken from "./utils/setAuthToken";
import { loadUser, logout } from "./actions/register";
import PrivateRoute from "./utils/routing/PrivateRoute";
import "./components/styles/main.css";
import { ROUTES } from "./utils/routing/routes";
import { TOKEN_KEY } from "./utils/consts";
import { Navigate } from "react-router-dom";

const Alerts = lazy(() => import("./components/elements/Alerts"));
const Login = lazy(() => import("./components/AuthPages/Login"));
const Register = lazy(() => import("./components/AuthPages/Register"));
const Confirm = lazy(() => import("./components/AuthPages/Confirm"));
const Forgot = lazy(() => import("./components/AuthPages/Forgot"));

const Landing = lazy(() => import("./components/Landing"));

const Home = lazy(() => import("./components/Pages/Home"));

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
    const handleInvalidToken = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY && e.oldValue && !e.newValue) {
        store.dispatch(logout());
      }
    };
    window.addEventListener("storage", handleInvalidToken);
    return function cleanup() {
      window.removeEventListener("storage", handleInvalidToken);
    };
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Suspense fallback={LoadingGif}>
          <Fragment>
            <section>
              <Alerts />
              <Routes>
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.REGISTER} element={<Register />} />
                <Route path={ROUTES.FORGOT} element={<Forgot />} />
                <Route
                  path={`${ROUTES.CONFIRM}/:token`}
                  element={<Confirm />}
                />

                <Route path={ROUTES.ROOT} element={<Landing />} />

                <Route path="/scratch" element={<Landing />} />

                <Route
                  path={ROUTES.HOME}
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={() => <Navigate to={ROUTES.ROOT} />} />
              </Routes>
            </section>
          </Fragment>
        </Suspense>
      </Router>
    </Provider>
  );
};

export default App;
