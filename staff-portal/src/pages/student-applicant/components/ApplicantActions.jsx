import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  UserAddOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ApplicantActions = ({ applicant, onAction, showView = true, showEdit = true }) => {
  const navigate = useNavigate();
  const status = applicant?.application_status;

  const handleAction = (action) => {
    if (onAction) {
      onAction(applicant.id, action);
    }
  };

  return (
    <Space size="small">
      {showView && (
        <Tooltip title="View Profile">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/student-applicants/${applicant.id}`)}
          />
        </Tooltip>
      )}

      {showEdit && status !== 'Approved' && (
        <Tooltip title="Edit">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/student-applicants/${applicant.id}/edit`)}
          />
        </Tooltip>
      )}

      {status === 'Applied' && (
        <>
          <Tooltip title="Approve">
            <Button 
              type="text" 
              icon={<CheckOutlined />} 
              style={{ color: 'green' }}
              onClick={() => handleAction('Approved')}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              style={{ color: 'red' }}
              onClick={() => handleAction('Rejected')}
            />
          </Tooltip>
        </>
      )}

      {status === 'Approved' && (
        <>
          <Tooltip title="Enroll Student">
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              size="small"
              onClick={() => navigate(`/student-applicants/${applicant.id}`)}
            >
              Enroll
            </Button>
          </Tooltip>
          <Tooltip title="Reject">
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              style={{ color: 'red' }}
              onClick={() => handleAction('Rejected')}
            />
          </Tooltip>
        </>
      )}

      {status === 'Rejected' && (
        <Tooltip title="Approve">
          <Button 
            type="text" 
            icon={<CheckOutlined />} 
            style={{ color: 'green' }}
            onClick={() => handleAction('Approved')}
          />
        </Tooltip>
      )}
    </Space>
  );
};

export default ApplicantActions;