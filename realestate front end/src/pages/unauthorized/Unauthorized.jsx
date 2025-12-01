// src/pages/Unauthorized.jsx
import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-lg p-8 text-center shadow bg-white/60 rounded-2xl">
        <h1 className="mb-4 text-3xl font-bold text-text-primary">
          Access Denied
        </h1>
        <p className="mb-6 text-text-secondary">
          You don’t have permission to view this page.
        </p>
        <div className="space-x-3">
          <Link to="/" className="px-4 py-2 text-white rounded-md bg-primary">
            Go home
          </Link>
          <Link to="/login" className="px-4 py-2 border rounded-md">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
