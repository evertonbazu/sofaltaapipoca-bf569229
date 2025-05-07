
import React from 'react';

const VerificationMessage: React.FC = () => {
  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-amber-800">
      <p className="font-medium">Verify your email</p>
      <p className="text-sm">A confirmation link has been sent to your email inbox. Please verify your email to log in.</p>
    </div>
  );
};

export default VerificationMessage;
