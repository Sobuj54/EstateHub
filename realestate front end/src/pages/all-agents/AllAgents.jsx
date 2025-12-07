// src/pages/AllAgents.jsx
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Icon from "components/AppIcon";
import Image from "components/AppImage";
import { Link } from "react-router-dom";
import Pagination from "components/ui/Pagination";
import Header from "components/ui/Header";
import AgentDetailsModal from "./components/AgentDetailsModal";

const API = import.meta.env.VITE_API;

const fetchAgents = async ({ queryKey }) => {
  const [_key, limit, pageNo] = queryKey;

  const currentLimit = Number(limit);
  const currentPageNo = Number(pageNo);

  const url = `${API}/users/agents/verified/`;

  const res = await axios.get(url, {
    params: {
      limit: currentLimit,
      pageNo: currentPageNo,
    },
  });

  return (
    res.data?.data || {
      users: [],
      totalPages: 1,
      totalCount: 0,
      currentPage: 1,
    }
  );
};

const AllAgents = () => {
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(5);
  const [agents, setAgents] = useState([]);
  const [totalPagesLocal, setTotalPagesLocal] = useState(1);
  const [totalCountLocal, setTotalCountLocal] = useState(0);

  // --- MODAL STATE ---
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'message', 'email', or 'profile'
    agent: null,
  });

  const openModal = (agent, type) => {
    setModalState({ isOpen: true, type, agent });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, agent: null });
  };
  // -------------------

  // reset to page 1 when limit changes
  useEffect(() => setPageNo(1), [limit]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["all-agents", limit, pageNo],
    queryFn: fetchAgents,

    // Fix for pagination issue: aggressively manage caching
    cacheTime: 0,
    keepPreviousData: false,

    onSuccess: (payload) => {
      setAgents(payload?.users ?? []);
      setTotalPagesLocal(payload?.totalPages ?? 1);
      setTotalCountLocal(payload?.totalCount ?? 0);
    },
  });

  // Keep a fallback in case the query hasn't populated via onSuccess yet:
  useEffect(() => {
    if (!data) return;
    setAgents(data.users ?? []);
    setTotalPagesLocal(data.totalPages ?? 1);
    setTotalCountLocal(data.totalCount ?? 0);
  }, [data]);

  return (
    <main className="min-h-screen py-12 bg-background">
      <Header />
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 pt-18">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-text-primary">
              Verified Agents
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Browse our verified agents. We currently have{" "}
              <span className="font-semibold text-text-primary">
                {totalCountLocal}
              </span>{" "}
              agents.
              {isFetching && (
                <span className="ml-2 text-sm text-blue-500 animate-pulse">
                  (Refreshing...)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center w-full gap-3 sm:w-auto">
            <label className="text-sm text-text-secondary">Per page:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-5 py-2 text-sm border rounded-lg focus:ring-0"
              aria-label="Agents per page"
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <Link
              to="/agent-dashboard"
              className="inline-flex items-center px-4 py-2 text-sm font-medium transition bg-white border rounded-lg shadow-sm hover:bg-gray-50"
            >
              View Dashboard
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Link>

            <button
              onClick={() => refetch()}
              className="px-3 py-2 text-sm text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
              aria-label="Refresh agents"
            >
              <Icon name="RefreshCw" size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(limit)].map((_, i) => (
              <div
                key={i}
                className="p-6 bg-white shadow rounded-2xl animate-pulse"
              >
                <div className="w-24 h-24 mb-4 bg-gray-200 rounded-full" />
                <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded" />
                <div className="w-1/2 h-4 mb-4 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="w-full h-3 bg-gray-200 rounded" />
                  <div className="w-3/4 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-white shadow rounded-2xl">
            <h3 className="mb-2 text-lg font-semibold text-red-600">
              Failed to load agents
            </h3>
            <p className="mb-4 text-sm text-text-secondary">
              Please check your network or try again.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary"
              >
                Retry
              </button>
            </div>
          </div>
        ) : agents.length === 0 ? (
          <div className="p-8 text-center bg-white shadow rounded-2xl">
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              No agents found
            </h3>
            <p className="text-sm text-text-secondary">
              Try adjusting your page or page size.
            </p>
          </div>
        ) : (
          <>
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((u) => (
                <article
                  key={u._id}
                  className="relative flex flex-col overflow-hidden bg-white border border-gray-100 shadow-md rounded-2xl"
                >
                  <div className="flex items-center gap-4 p-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 overflow-hidden bg-gray-100 rounded-full">
                        <Image
                          src={u.avatar || ""}
                          alt={u.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold truncate text-text-primary">
                        {u.name}
                      </h4>
                      <p className="mt-1 text-sm truncate text-text-secondary">
                        {u.email}
                      </p>

                      <div className="flex items-center mt-3 text-sm text-text-secondary">
                        <span className="inline-flex items-center px-2 py-1 mr-2 text-xs rounded bg-primary-100 text-primary">
                          {u.role ?? "agent"}
                        </span>
                        <span className="text-xs">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-6 py-3 mt-auto border-t">
                    <div className="flex items-center gap-3">
                      {/* --- MESSAGE BUTTON UPDATED TO OPEN MODAL --- */}
                      <button
                        onClick={() => openModal(u, "message")}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-primary-600"
                        aria-label={`Message ${u.name}`}
                      >
                        <Icon name="MessageCircle" size={16} className="mr-2" />
                        Message
                      </button>

                      {/* --- EMAIL BUTTON UPDATED TO OPEN MODAL --- */}
                      <button
                        onClick={() => openModal(u, "email")}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50"
                        aria-label={`Email ${u.name}`}
                      >
                        <Icon name="Mail" size={14} className="mr-2" />
                        Email
                      </button>
                    </div>

                    {/* --- VIEW PROFILE BUTTON UPDATED TO OPEN MODAL --- */}
                    <button
                      onClick={() => openModal(u, "profile")}
                      className="px-3 py-2 text-sm font-medium text-gray-700 transition border rounded-lg hover:bg-gray-50"
                    >
                      View Profile
                    </button>
                  </div>
                </article>
              ))}
            </section>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                page={pageNo}
                totalPages={totalPagesLocal}
                setPage={setPageNo}
              />
            </div>
          </>
        )}
      </div>

      {/* --- RENDER MODAL BASED ON STATE --- */}
      {modalState.isOpen && (
        <AgentDetailsModal
          agent={modalState.agent}
          type={modalState.type}
          onClose={closeModal}
        />
      )}
    </main>
  );
};

export default AllAgents;
