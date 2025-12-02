// src/pages/admin/Settings.jsx
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import Icon from "components/AppIcon";
import useAxiosSecure from "hooks/useAxiosSecure";

/**
 * AdminSettings
 * (Internal logic for state management and API calls remains the same)
 */

const MOCK_DEFAULTS = {
  registrationOpen: true,
  maintenanceMode: false,
  featuredListingLimit: 5,
  allowAgentSignup: true,
};

const Settings = () => {
  const api = useAxiosSecure();

  const [settings, setSettings] = useState(null);
  const [original, setOriginal] = useState(null); // last-saved copy
  const [saving, setSaving] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // load settings (with fallback to mock) - LOGIC UNCHANGED
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      if (mockMode) {
        if (!mounted) return;
        setSettings(MOCK_DEFAULTS);
        setOriginal(MOCK_DEFAULTS);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/admin/settings");
        const data = res?.data?.data ?? res?.data ?? null;

        if (!mounted) return;

        if (data) {
          const normalized = {
            registrationOpen: Boolean(data.registrationOpen ?? true),
            maintenanceMode: Boolean(data.maintenanceMode ?? false),
            featuredListingLimit:
              Number.isFinite(Number(data.featuredListingLimit)) &&
              Number(data.featuredListingLimit) >= 0
                ? Number(data.featuredListingLimit)
                : MOCK_DEFAULTS.featuredListingLimit,
            allowAgentSignup: Boolean(data.allowAgentSignup ?? true),
          };
          setSettings(normalized);
          setOriginal(normalized);
        } else {
          // backend returned no data -> use mock
          setSettings(MOCK_DEFAULTS);
          setOriginal(MOCK_DEFAULTS);
        }
      } catch (err) {
        console.warn(
          "Failed to load admin settings — using mock defaults.",
          err
        );
        if (!mounted) return;
        setSettings(MOCK_DEFAULTS);
        setOriginal(MOCK_DEFAULTS);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [api, mockMode]);

  // helper to check if user modified settings - LOGIC UNCHANGED
  const dirty = useMemo(() => {
    if (!settings || !original) return false;
    return JSON.stringify(settings) !== JSON.stringify(original);
  }, [settings, original]);

  const handleToggle = (key, value) => {
    // protect maintenance mode toggle with confirm when enabling - LOGIC UNCHANGED
    if (key === "maintenanceMode" && value === true) {
      const ok = window.confirm(
        "Enable Maintenance Mode will make the public site unavailable. Are you sure?"
      );
      if (!ok) return;
    }
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const handleNumberChange = (key, val) => {
    // LOGIC UNCHANGED
    const n = parseInt(val, 10);
    if (Number.isNaN(n)) return;
    setSettings((s) => ({ ...s, [key]: n }));
  };

  const handleSave = async () => {
    // LOGIC UNCHANGED
    if (!settings) return;
    setSaving(true);
    try {
      const payload = {};
      Object.keys(settings).forEach((k) => {
        if (settings[k] !== original[k]) payload[k] = settings[k];
      });

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        setSaving(false);
        return;
      }

      await api.post("/admin/settings", payload);
      setOriginal(settings);
      toast.success("Settings saved");
    } catch (err) {
      console.error("Save settings failed:", err);
      toast.error("Save failed — please try again");
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    // LOGIC UNCHANGED
    if (!original) return;
    setSettings(original);
    toast.info("Reverted to last saved");
  };

  if (loading || !settings) {
    // Adjusted skeleton structure for mobile (default 1 column, sm: 2 columns)
    return (
      <div className="space-y-4">
        <div className="w-full h-8 rounded bg-secondary-100 animate-pulse sm:w-1/3" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 p-6 bg-secondary-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER: Changed to flex-col (default/mobile) and sm:flex-row (desktop) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Title and Description */}
        <div>
          <h1 className="text-2xl font-bold md:text-3xl text-text-primary">
            System Settings
          </h1>
          <p className="mt-1 text-text-secondary">
            Configure global site behaviour and policies. Changes will take
            effect across the platform once saved.
          </p>
        </div>

        {/* Developer Controls: Changed to flex-col on mobile, using sm: to revert */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex items-center space-x-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={mockMode}
              onChange={(e) => setMockMode(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span>Developer: Use mock data</span>
          </label>

          <button
            onClick={() => {
              // ... Export logic UNCHANGED ...
              const blob = new Blob([JSON.stringify(settings, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `admin-settings-${new Date()
                .toISOString()
                .slice(0, 10)}.json`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
            // Made full width on mobile, auto on sm:
            className="w-full px-3 py-2 text-sm font-medium text-white rounded-md sm:w-auto bg-primary"
          >
            Export
          </button>
        </div>
      </div>

      {/* Mock indicator - UNCHANGED */}
      {mockMode && (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-yellow-800 border border-yellow-100 rounded-md bg-yellow-50">
          <Icon name="Info" size={16} />
          <div>
            <strong>Mock mode</strong> — settings are not persisted to backend
            while enabled.
          </div>
        </div>
      )}

      {/* Settings grid: Changed to default 1 column, sm: 2 columns */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Registration Open */}
        <div className="p-6 bg-white shadow rounded-2xl">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">
                Open Registration
              </div>
              <div className="text-xs text-text-secondary">
                Allow new users to sign up
              </div>
            </div>
            <input
              aria-label="Open registration"
              type="checkbox"
              checked={Boolean(settings.registrationOpen)}
              onChange={(e) =>
                handleToggle("registrationOpen", e.target.checked)
              }
              className="w-4 h-4 rounded"
            />
          </label>
        </div>

        {/* Maintenance Mode */}
        <div className="p-6 bg-white shadow rounded-2xl">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">
                Maintenance Mode
              </div>
              <div className="text-xs text-text-secondary">
                Put site in maintenance mode (public site will show maintenance
                page)
              </div>
            </div>
            <input
              aria-label="Maintenance mode"
              type="checkbox"
              checked={Boolean(settings.maintenanceMode)}
              onChange={(e) =>
                handleToggle("maintenanceMode", e.target.checked)
              }
              className="w-4 h-4 rounded"
            />
          </label>
        </div>

        {/* Featured Listing Limit */}
        <div className="p-6 bg-white shadow rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">
                Featured Listing Limit
              </div>
              <div className="text-xs text-text-secondary">
                How many listings shown in featured carousel
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                aria-label="Featured listing limit"
                type="number"
                min={0}
                value={settings.featuredListingLimit}
                onChange={(e) =>
                  handleNumberChange("featuredListingLimit", e.target.value)
                }
                className="w-20 px-2 py-1 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Allow Agent Signup */}
        <div className="p-6 bg-white shadow rounded-2xl">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">
                Allow Agent Signup
              </div>
              <div className="text-xs text-text-secondary">
                Allow agents to self-register
              </div>
            </div>
            <input
              aria-label="Allow agent signup"
              type="checkbox"
              checked={Boolean(settings.allowAgentSignup)}
              onChange={(e) =>
                handleToggle("allowAgentSignup", e.target.checked)
              }
              className="w-4 h-4 rounded"
            />
          </label>
        </div>
      </div>

      {/* Actions: Changed to flex-wrap (allows wrapping), kept items-center (aligns vertically) */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          // Made full width on mobile (up to sm:), auto on sm:
          className={`w-full sm:w-auto px-4 py-2 rounded-md text-white transition ${
            !dirty || saving
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary hover:bg-primary-700"
          }`}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>

        <button
          onClick={handleRevert}
          disabled={!dirty || saving}
          // Made full width on mobile (up to sm:), auto on sm:
          className={`w-full sm:w-auto px-4 py-2 rounded-md border ${
            !dirty || saving
              ? "text-text-secondary border-gray-200 cursor-not-allowed"
              : "text-text-primary border-border hover:bg-secondary-100"
          }`}
        >
          Revert
        </button>

        <button
          onClick={() => {
            // quick reset to sensible defaults (local only)
            if (
              window.confirm(
                "Reset local form to recommended defaults? This does not save changes to the server."
              )
            ) {
              setSettings(MOCK_DEFAULTS);
            }
          }}
          disabled={saving}
          // Made full width on mobile (up to sm:), auto on sm:
          className="w-full px-3 py-2 text-sm border rounded-md sm:w-auto"
        >
          Reset to recommended
        </button>

        {/* Status message: Pushed to the right on desktop (ml-auto), keeps space on mobile */}
        <div className="w-full ml-0 text-sm sm:w-auto sm:ml-auto text-text-secondary">
          {dirty ? (
            <span>Unsaved changes</span>
          ) : (
            <span>All changes saved</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
