import React, { useContext, useReducer } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Menu, notification } from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  FileTextOutlined,
  RightOutlined,
  NodeIndexOutlined,
  Loading3QuartersOutlined,
} from '@ant-design/icons';
import { useEventListener } from 'ahooks';
import { Login } from './user/login';
import { Settings } from './user/settings';
import { FileViewer } from './project/fileViewer';
import { ProjectViewer } from './project/projectViewer';
import {
  LoginContext, loginReducer, WorkingContext, workingReducer, NavContext, navReducer,
} from '../context';
import { getApi } from '../compatible/apiAdapter';
import { ProjectDashboard } from './project/projectDashboard';
import { EntityViewer } from './er/entityViewer';
import { RelationViewer } from './er/relationViewer';

// FIXME: for quick debug only, remove in production
const enabled = false;

const RequireAuth = ({ children }: React.PropsWithChildren<any>) => {
  const { state } = useContext(LoginContext);

  if (!enabled) {
    return children;
  }

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
  const [loginState, loginDispatcher] = useReducer(loginReducer, getApi.getState()?.login);
  const [workingState, workingDispatcher] = useReducer(workingReducer, getApi.getState()?.working);
  const [navState, navDispatcher] = useReducer(navReducer, 'index');

  /** post state to extension to presist */
  getApi.postMessage({
    command: 'set-state',
    payload: {
      login: loginState,
      working: workingState,
    },
  });

  /** restore state if necessary */
  useEventListener('message', ({
    data: {
      command, payload: {
        login, working,
      },
    },
  }: any) => {
    if (command === 'restore-state') {
      loginDispatcher({ payload: login });
      workingDispatcher({ payload: working });
    }
  });

  return (
    <>
      <LoginContext.Provider value={{ state: loginState, dispatcher: loginDispatcher }}>
        <WorkingContext.Provider value={{ state: workingState, dispatcher: workingDispatcher }}>
          <NavContext.Provider value={{ state: navState, dispatcher: navDispatcher }}>
            <BrowserRouter>
              <Menu mode="horizontal" selectedKeys={[navState]} onClick={({ key }) => navDispatcher({ payload: key })}>
                <Menu.Item key="index" icon={<UserOutlined />} tabIndex={0}>
                  <NavLink to="/">
                    My
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="project" icon={<ProjectOutlined />} disabled={!loginState?.token} tabIndex={0}>
                  <NavLink to="/project">
                    Projects
                  </NavLink>
                </Menu.Item>
                {loginState?.token && workingState?.project ? (
                  <Menu.Item key="pid" icon={<RightOutlined />} tabIndex={0}>
                    <NavLink to={`/project/${workingState.project.pid}`}>
                      {`Claimed: ${workingState.project.name}`}
                    </NavLink>
                  </Menu.Item>
                ) : undefined}
                <Menu.Item
                  key="file"
                  icon={<FileTextOutlined />}
                  disabled={!loginState?.token || !workingState?.project?.fsPath}
                  tabIndex={0}
                >
                  <NavLink to={`/project/${workingState?.project?.pid}/file`}>
                    Files
                  </NavLink>
                </Menu.Item>
                {loginState?.token && workingState?.project?.fsPath && workingState?.file ? (
                  <Menu.Item
                    key={workingState.file.workingOn}
                    icon={<RightOutlined />}
                    tabIndex={0}
                  >
                    <NavLink to={`/project/${workingState.project.pid}/file/${workingState.file.fid}/${workingState.file.workingOn}`}>
                      {`${workingState.file.path.split('/').pop()}: ${workingState.file.workingOn === 'entity' ? 'Entity' : 'Relation'}`}
                    </NavLink>
                  </Menu.Item>
                ) : undefined}
                {loginState?.token && workingState?.project?.fsPath && workingState?.file ? (
                  <Menu.Item
                    key={workingState.file.workingOn === 'entity' ? 'relation' : 'entity'}
                    icon={workingState.file.workingOn === 'entity' ? <NodeIndexOutlined /> : <Loading3QuartersOutlined />}
                    tabIndex={0}
                  >
                    <NavLink to={`/project/${workingState.project.pid}/file/${workingState.file.fid}/${workingState.file.workingOn === 'entity' ? 'relation' : 'entity'}`}>
                      {workingState.file.workingOn === 'entity' ? 'Relation' : 'Entity'}
                    </NavLink>
                  </Menu.Item>
                ) : undefined}
              </Menu>

              {/** height should minus 38 which is the navbar's height */}
              <div style={{ padding: '1em 1em 0 1em', height: 'calc(100% - 38px)', overflowY: 'auto' }}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      loginState?.token
                        ? <Settings />
                        : <Login uid={loginState?.uid} />
                    }
                  />
                  <Route
                    path="*"
                    element={
                      loginState?.token
                        ? <Settings />
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
                        <EntityViewer />
                      </RequireAuth>
                    )}
                  />
                  <Route
                    path="/project/:pid/file/:fid/relation"
                    element={(
                      <RequireAuth>
                        <RelationViewer />
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
