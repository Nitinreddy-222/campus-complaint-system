import React from 'react';

const Loading = ({ message = 'Loading details, please wait...' }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5 my-5">
      <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-medium fs-6">{message}</p>
    </div>
  );
};

export default Loading;
