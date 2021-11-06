import React, { useContext, useReducer } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from 'react-router-dom';
import { Menu, notification, Button } from 'antd';
import {
  UserOutlined, ProjectOutlined, FileTextOutlined, RightOutlined,
} from '@ant-design/icons';
import { Login } from './user/login';
import { FileViewer } from './project/fileViewer';
import { ProjectViewer } from './project/projectViewer';
import {
  LoginContext, loginReducer, WorkingContext, workingReducer, NavContext, navReducer,
} from '../context';
import { getApi } from '../compatible/apiAdapter';
import { ProjectDashboard } from './project/projectDashboard';
import { Entity } from './er/entity';

const RequireAuth = ({ children }: React.PropsWithChildren<any>) => {
  // @ts-ignore
  const { state } = useContext(LoginContext);

  if (!state?.token) {
    notification.error({
      message: 'Login required',
      description: 'Now Navigateing you to the login page.',
    });
  }

  return (
    state?.token ? (
      children
    ) : (
      <Navigate
        to={{
          pathname: '/',
        }}
      />
    )
  );
};

export const App: React.FC = () => {
  // useEffect(() => {
  //   window.addEventListener('message', ({ data }) => {
  //     switch (data.type) {
  //       case 'continueUrl':

  //         break;
  //       default:
  //         break;
  //     }
  //   });
  // });

  const [loginState, loginDispatcher] = useReducer(loginReducer, getApi.getState()?.login);
  const [workingState, workingDispatcher] = useReducer(workingReducer, getApi.getState()?.working);
  const [navState, navDispatcher] = useReducer(navReducer, 'index');

  return (
    <>
      {/* @ts-ignore */}
      <LoginContext.Provider value={{ state: loginState, dispatcher: loginDispatcher }}>
        {/* @ts-ignore */}
        <WorkingContext.Provider value={{ state: workingState, dispatcher: workingDispatcher }}>
          {/* @ts-ignore */}
          <NavContext.Provider value={{ state: navState, dispatcher: navDispatcher }}>
            <BrowserRouter>
              <Menu mode="horizontal" selectedKeys={[navState]} onClick={({ key }) => navDispatcher({ payload: key })}>
                <Menu.Item key="index" icon={<UserOutlined />}>
                  <NavLink to="/">
                    My
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="project" icon={<ProjectOutlined />} disabled={loginState?.token === undefined}>
                  <NavLink to="/project">
                    Projects
                  </NavLink>
                </Menu.Item>
                {loginState?.token && workingState?.project ? (
                  <Menu.Item key="pid" icon={<RightOutlined />}>
                    <NavLink to={`/project/${workingState.project.pid}`}>
                      {`Claimed: ${workingState.project.name}`}
                    </NavLink>
                  </Menu.Item>
                ) : undefined}
                <Menu.Item
                  key="file"
                  icon={<FileTextOutlined />}
                  disabled={loginState?.token === undefined || workingState?.project === undefined}
                >
                  <NavLink to={`/project/${workingState?.project?.pid}/file`}>
                    Files
                  </NavLink>
                </Menu.Item>
              </Menu>

              <div style={{ padding: '1em 1em 0 1em' }}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      loginState?.token
                        ? (
                          <Button onClick={
                            () => loginDispatcher({ payload: { token: undefined } })
                          }
                          >
                            Log out
                          </Button>
                        )
                        : <Login uid={loginState?.uid} />
                    }
                  />
                  <Route
                    path="/project"
                    element={(
                      <RequireAuth>
                        <ProjectViewer />
                      </RequireAuth>
                    )}
                  />
                  <Route
                    path="/project/:pid"
                    element={(
                      <RequireAuth>
                        <ProjectDashboard />
                      </RequireAuth>
                    )}
                  />
                  <Route
                    path="/project/:pid/file"
                    element={(
                      <RequireAuth>
                        <FileViewer />
                      </RequireAuth>
                    )}
                  />
                  <Route
                    path="/project/:pid/file/:fid/entity"
                    element={(
                      <RequireAuth>
                        <Entity />
                      </RequireAuth>
                    )}
                  />
                  <Route
                    path="/project/:pid/file/:fid/relation"
                    element={(
                      <RequireAuth>
                        TODO relation marker
                      </RequireAuth>
                    )}
                  />
                </Routes>
              </div>
            </BrowserRouter>
          </NavContext.Provider>
        </WorkingContext.Provider>
      </LoginContext.Provider>
    </>
  );
};
