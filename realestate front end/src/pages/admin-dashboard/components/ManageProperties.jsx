// src/pages/admin/ManageProperties.jsx
import React, { useEffect, useState } from "react";

const ManageProperties = () => {
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    // TODO: Fetch properties from backend
    setTimeout(() => {
      setProperties([
        { id: 1, title: "Luxury Villa", agent: "John Smith", status: "Active" },
        {
          id: 2,
          title: "Modern Apartment",
          agent: "Jane Doe",
          status: "Inactive",
        },
      ]);
    }, 1000);
  }, []);

  if (!properties) {
    return (
      <div className="space-y-4">
        <div className="w-1/4 h-6 rounded bg-secondary-100 animate-pulse"></div>
        <div className="mt-4 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded bg-secondary-100 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-text-primary">
        Manage Properties
      </h1>
      <div className="overflow-x-auto bg-white shadow rounded-2xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">
                Title
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">
                Agent
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">
                Status
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((prop) => (
              <tr key={prop.id}>
                <td className="px-6 py-4 whitespace-nowrap">{prop.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prop.agent}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prop.status}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button className="text-primary hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProperties;
