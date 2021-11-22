import { useEventListener, useRequest } from 'ahooks';
import {
  Table,
  Badge,
  Tooltip,
  Button,
  Card,
  Typography,
  Modal,
  Descriptions,
  Alert,
  Divider,
  Select,
  message,
} from 'antd';
import {
  CheckOutlined, CloseOutlined, EditOutlined, PlusOutlined,
} from '@ant-design/icons';
import React, { useContext, useEffect, useState } from 'react';
import { request } from '../../compatible/httpAdapter';
import { WorkingContext } from '../../context';
import { langTableIndex, typeTable } from '../../.static/config';
import { getApi } from '../../compatible/apiAdapter';
import { isLocEqual } from '../../utils/compare';

const { Option } = Select;

let mname: any;
let mloc: any;
let mtype: any;

/** disable this rule since it will wrongly indent the return body */
// eslint-disable-next-line max-len
const ControlledEntityInfo: React.FC<{ name?: string, loc?: remote.location, type?: number }> = ({
  name, loc, type,
}) => {
  const [trackedName, setName] = useState(name);
  const [trackedLoc, setLoc] = useState(loc);
  const [trackedType, setType] = useState(type);

  useEffect(() => {
    mname = trackedName;
    mloc = trackedLoc;
    mtype = trackedType;
  });

  useEventListener('message', ({ data: { command, payload } }) => {
    if (command === 'selection-change') {
      setName(payload.name);
      setLoc(payload.loc);
    }
  });

  return (
    <>
      <Alert
        type="info"
        message="Select new range of the wanted entity name directly in the code editor left, and infos will be synced to here."
      />
      <Descriptions column={1} style={{ marginTop: '1em' }}>
        <Descriptions.Item label="Code name">{trackedName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Starts at">{trackedLoc ? `line ${trackedLoc?.start.line}, column ${trackedLoc?.start.column}` : '-'}</Descriptions.Item>
        <Descriptions.Item label="Ends at">{trackedLoc ? `line ${trackedLoc?.end.line}, column ${trackedLoc?.end.column}` : '-'}</Descriptions.Item>
      </Descriptions>
      <Divider />
      <Select
        showSearch
        placeholder="Entity Type"
        style={{ width: '100%' }}
        filterOption={(input, option) => ((option?.key) as string)
          .toLowerCase().indexOf(input.toLowerCase()) >= 0}
        defaultValue={trackedType}
        onSelect={setType}
      >
        {typeTable[glang].entity.map((t, i) => (
          <Option key={t} value={i}>
            {t}
          </Option>
        ))}
      </Select>
    </>
  );
};

const showModifyModal = (
  eid?: number,
  name?: string,
  loc?: remote.location,
  type?: number,
) => {
  Modal.confirm({
    title: name ? 'Modify to...' : 'Insert an entity...',
    icon: name ? <EditOutlined /> : <PlusOutlined style={{ color: '#108ee9' }} />,
    content: <ControlledEntityInfo name={name} loc={loc} type={type} />,
    onOk: (close) => {
      if (!mname || !mloc || mtype === undefined) {
        message.warning('Contents are not fullfilled');
        return;
      }
      if (name === mname && isLocEqual(loc as remote.location, mloc) && type === mtype) {
        message.warning('Nothing changed comparing to the old one');
        return;
      }
      if (eid === undefined && gdata.find((e) => isLocEqual(e.loc, mloc))) {
        message.warning('Entity already exist, you may want do modify rather than insert');
        return;
      }

      handleOperationClicked(eid !== undefined ? 'modify' : 'insert', eid, { name: mname, loc: mloc, eType: mtype });
      close();
    },
  });
};

let lock: boolean = false;

const handleOperationClicked = (
  type: string,
  eid?: number,
  entity?: remote.manuallyEntity,
) => {
  if (!lock) {
    lock = true;

    const key = `operation${Math.floor(Math.random() * 100)}`;
    message.loading({
      content: 'Uploading to the server',
      duration: 0,
      key,
    });
    switch (type) {
      case 'pass':
        request(`POST project/${gpid}/file/${gfid}/entity`, {
          data: [
            { isManually: false, eid, isCorrect: true },
          ],
        }).then(() => {
          message.success({
            content: 'Mark succeeded',
            key,
          });
          gmutate((compound: any) => {
            const data = compound.list as Array<remote.entity>;
            const it = data.find((e) => e.eid === eid) as remote.entity;
            it.status.hasBeenReviewed = true;
            it.status.operation = 0;
            return compound;
          });
        }).catch((json) => {
          message.error({
            content: json.message,
            key,
          });
        }).finally(() => { lock = false; });
        break;
      case 'remove':
        request(`POST project/${gpid}/file/${gfid}/entity`, {
          data: [
            {
              isManually: false, eid, isCorrect: false, fix: { shouldBe: 1 },
            },
          ],
        }).then(() => {
          message.success({
            content: 'Mark succeeded',
            key,
          });
          gmutate((compound: any) => {
            const data = compound.list as Array<remote.entity>;
            const it = data.find((e) => e.eid === eid) as remote.entity;
            it.status.hasBeenReviewed = true;
            it.status.operation = 1;
            return compound;
          });
        }).catch((json) => {
          message.error({
            content: json.message,
            key,
          });
        }).finally(() => { lock = false; });
        break;
      case 'modify':
        request(`POST project/${gpid}/file/${gfid}/entity`, {
          data: [
            {
              isManually: false,
              eid,
              isCorrect: false,
              fix: {
                shouldBe: 2,
                newly: entity,
              },
            },
          ],
        }).then(() => {
          message.success({
            content: 'Mark succeeded',
            key,
          });
          gmutate((compound: any) => {
            const data = compound.list as Array<remote.entity>;
            const it = data.find((e) => e.eid === eid) as remote.entity;
            it.status.hasBeenReviewed = true;
            it.status.operation = 2;
            it.status.newEntity = entity;
            return compound;
          });
        }).catch((json) => {
          message.error({
            content: json.message,
            key,
          });
        }).finally(() => { lock = false; });
        break;
      case 'insert':
        request(`POST project/${gpid}/file/${gfid}/entity`, {
          data: [
            {
              isManually: true,
              entity,
            },
          ],
        }).then(() => {
          message.success({
            content: 'Mark succeeded',
            key,
          });
          /** since newly inserted entity should be assigned an eid,
           * so leave this to server side, just refresh the page
           */
          grefresh();
        }).catch((json) => {
          message.error({
            content: json.message,
            key,
          });
        }).finally(() => { lock = false; });
        break;
      default:
        message.error({
          content: 'Unknown operation type',
          key,
        });
        lock = false;
    }
  }
};

const RenderExpandedRow = ({
  eid, name, loc, eType,
}: remote.entity) => (
  <Card title={(
    <>
      <span>Operation to entity&nbsp;</span>
      <Typography.Text code>{name}</Typography.Text>
    </>
  )}
  >
    <Card.Grid style={{ padding: 0 }}>
      <Button
        type="link"
        icon={<CheckOutlined />}
        style={{ height: '72px', color: 'green' }}
        block
        onClick={() => handleOperationClicked('pass', eid)}
      >
        Correct
      </Button>
    </Card.Grid>
    <Card.Grid style={{ padding: 0 }}>
      <Button
        type="link"
        icon={<CloseOutlined />}
        style={{ height: '72px' }}
        block
        danger
        onClick={() => handleOperationClicked('remove', eid)}
      >
        Remove
      </Button>
    </Card.Grid>
    <Card.Grid style={{ padding: 0 }}>
      <Button
        type="link"
        icon={<EditOutlined />}
        style={{ height: '72px', color: 'darkorange' }}
        block
        onClick={() => showModifyModal(eid, name, loc, eType)}
      >
        Modify
      </Button>
    </Card.Grid>
  </Card>
);

const columns = [
  {
    title: 'Status',
    align: 'center',
    render: (_: undefined, record: remote.entity) => {
      if (record.status.hasBeenReviewed) {
        switch (record.status.operation) {
          case 0 as remote.operation.reviewPassed:
            return (
              <Tooltip title="Passed">
                <Badge status="success" />
              </Tooltip>
            );
          case 1 as remote.operation.remove:
            return (
              <Tooltip title="Removed">
                <Badge status="error" />
              </Tooltip>
            );
          case 2 as remote.operation.modify:
            return (
              <Tooltip title="Modified">
                <Badge status="warning" />
              </Tooltip>
            );
          case 3 as remote.operation.insert:
            return (
              <Tooltip title="Inserted">
                <Badge color="blue" />
              </Tooltip>
            );
          default:
            return 'COLOR';
        }
      }

      return (
        <Tooltip title="Waiting for review">
          <Badge status="default" />
        </Tooltip>
      );
    },
  },
  {
    title: 'Code Name',
    dataIndex: 'name',
    key: 'name',
    render: (name: string, record: remote.entity) => (
      <Button
        type="link"
        style={{ paddingLeft: 0 }}
        onClick={() => {
          getApi.postMessage({
            command: 'highlight-entity',
            payload: record.loc,
          });
        }}
      >
        {name}
      </Button>
    ),
  },
  {
    title: 'Entity Type',
    dataIndex: 'eType',
    key: 'type',
    render: (value: number) => typeTable[glang].entity[value],
  },
  {
    title: 'Location',
    children: [
      {
        title: 'Start',
        children: [
          {
            title: 'Line',
            dataIndex: ['loc', 'start', 'line'],
            key: 'sl',
            align: 'center',
          },
          {
            title: 'Column',
            dataIndex: ['loc', 'start', 'column'],
            key: 'sc',
            align: 'center',
          },
        ],
      },
      {
        title: 'End',
        children: [
          {
            title: 'Line',
            dataIndex: ['loc', 'end', 'line'],
            key: 'el',
            align: 'center',
          },
          {
            title: 'Column',
            dataIndex: ['loc', 'end', 'column'],
            key: 'ec',
            align: 'center',
          },
        ],
      },
    ],
  },
];

let gmutate: any;
let grefresh: any;
let glang: langTableIndex;
let gpid: number;
let gfid: number;
let gdata: Array<remote.entity>;

export const EntityViewer: React.FC = () => {
  const {
    state: {
      project: {
        pid,
        lang,
        fsPath,
      },
      file: { fid, path },
    },
  } = useContext(WorkingContext);

  glang = lang;
  gpid = pid;
  gfid = fid;

  const {
    tableProps, pagination, mutate, refresh,
  } = useRequest(
    ({ current, pageSize }) => request(`GET project/${pid}/file/${fid}/entity?page=${current}&size=${pageSize}`)
      .then(({ entity, total }: remote.resEntities) => ({ list: entity, total })),
    {
      paginated: true,
      defaultPageSize: 100,
    },
  );

  const {
    dataSource: data,
    loading,
  } = tableProps;

  const [expandRow, setExpandRow] = useState(-1);

  gmutate = (executable: any) => {
    setExpandRow(-1);
    mutate(executable);
  };

  grefresh = () => {
    setExpandRow(-1);
    refresh();
  };

  useEffect(() => {
    if (data) {
      gdata = data;
      // FIXME: latter command should be invoked after previous one is done
      // in case directly go to this page by click the navbar
      getApi.postMessage({ command: 'open-file', payload: { fpath: path, mode: 'entity', base: fsPath } });
      getApi.postMessage({ command: 'show-entity', payload: data });
      // clear previous highlight after refresh
      getApi.postMessage({ command: 'highlight-entity', payload: undefined });
    }
    // FIXME: mutate should also trigger this effect
  }, [loading]);

  return (
    <>
      <Table
        sticky
        {...tableProps}
        pagination={{
          ...pagination as any,
          position: ['topLeft', 'bottomLeft'],
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
          size: 'default',
        }}
        rowKey={(record) => record.eid}
        // @ts-ignore
        columns={columns}
        expandable={{
          // TODO: handle collapse all after refreshed
          expandRowByClick: true,
          expandedRowKeys: [expandRow],
          rowExpandable: (record) => !record.status.hasBeenReviewed,
          expandIconColumnIndex: -1,
          expandedRowRender: (entity) => RenderExpandedRow(entity),
          // only one line can expand in a single time
          onExpandedRowsChange: (rows) => {
            if (rows.length === 0) {
              getApi.postMessage({
                command: 'highlight-entity',
                payload: undefined,
              });
            } else {
              const selectedKey = rows[rows.length - 1] as number;
              setExpandRow(selectedKey);
              getApi.postMessage({
                command: 'highlight-entity',
                payload: data?.find((i) => i.eid === selectedKey)?.loc,
              });
            }
          },
        }}
      />
      <Tooltip
        title="Manually insert an entity"
        placement="left"
      >
        <Button
          style={{
            position: 'absolute', right: '2.5em', bottom: '2.5em', zIndex: 999,
          }}
          type="primary"
          shape="circle"
          size="large"
          onClick={() => showModifyModal()}
        >
          <PlusOutlined />
        </Button>
      </Tooltip>
    </>
  );
};
