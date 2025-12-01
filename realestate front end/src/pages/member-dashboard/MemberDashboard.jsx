// src/pages/member/MemberDashboard.jsx
import React, { useEffect, useState } from "react";
import Icon from "components/AppIcon";
import useAxiosSecure from "hooks/useAxiosSecure";
import Header from "components/ui/Header";

const MemberDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    // TODO: Fetch dashboard stats from backend
    setTimeout(() => {
      setStats({
        propertiesViewed: 24,
        savedProperties: 5,
        messages: 3,
        activeSubscriptions: 1,
      });

      setRecentActivities([
        {
          id: 1,
          action: "Viewed Property",
          property: "2BHK Apartment",
          date: "2025-11-30",
        },
        {
          id: 2,
          action: "Saved Property",
          property: "Luxury Villa",
          date: "2025-11-28",
        },
        {
          id: 3,
          action: "Sent Message",
          property: "Commercial Space",
          date: "2025-11-27",
        },
      ]);

      setSavedProperties([
        {
          id: 1,
          name: "2BHK Apartment",
          location: "Downtown",
          price: "$1200/mo",
        },
        {
          id: 2,
          name: "Luxury Villa",
          location: "Beverly Hills",
          price: "$5000/mo",
        },
      ]);
    }, 1000);
  }, []);

  return (
    <main>
      <Header />
      <div className="p-4 mx-auto space-y-8 md:p-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-text-primary">
          Member Dashboard
        </h1>

        {/* Stats Cards */}
        {stats ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center p-4 space-x-4 bg-white shadow rounded-2xl">
              <div className="p-3 rounded-full bg-primary-100">
                <Icon name="Eye" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Properties Viewed</p>
                <p className="text-xl font-semibold text-text-primary">
                  {stats.propertiesViewed}
                </p>
              </div>
            </div>

            <div className="flex items-center p-4 space-x-4 bg-white shadow rounded-2xl">
              <div className="p-3 rounded-full bg-secondary-100">
                <Icon name="Heart" size={20} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Saved Properties</p>
                <p className="text-xl font-semibold text-text-primary">
                  {stats.savedProperties}
                </p>
              </div>
            </div>

            <div className="flex items-center p-4 space-x-4 bg-white shadow rounded-2xl">
              <div className="p-3 rounded-full bg-info-100">
                <Icon name="MessageCircle" size={20} className="text-info" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Messages</p>
                <p className="text-xl font-semibold text-text-primary">
                  {stats.messages}
                </p>
              </div>
            </div>

            <div className="flex items-center p-4 space-x-4 bg-white shadow rounded-2xl">
              <div className="p-3 rounded-full bg-success-100">
                <Icon name="CheckCircle" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">
                  Active Subscriptions
                </p>
                <p className="text-xl font-semibold text-text-primary">
                  {stats.activeSubscriptions}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-text-secondary">Loading stats...</p>
        )}

        {/* Recent Activities */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Recent Activities
          </h2>
          <div className="overflow-x-auto bg-white shadow rounded-2xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">
                    Action
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">
                    Property
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.property}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Saved Properties */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Saved Properties
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedProperties.map((property) => (
              <div
                key={property.id}
                className="p-4 transition bg-white shadow rounded-2xl hover:shadow-lg"
              >
                <h3 className="font-semibold text-text-primary">
                  {property.name}
                </h3>
                <p className="text-text-secondary">{property.location}</p>
                <p className="mt-2 font-medium text-text-primary">
                  {property.price}
                </p>
                <button className="px-3 py-1 mt-4 text-sm text-white transition rounded bg-primary hover:bg-primary-700">
                  View Property
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MemberDashboard;
