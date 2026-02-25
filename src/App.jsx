import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "./services/api";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import Sidebar from "./components/Sidebar";
import LeadUsersPage from "./pages/LeadUsers";
import ContentLibraryPage from "./pages/ContentLibrary";

function TokenBar() {
  const dispatch = useDispatch();
  const [token, setToken] = useState(
    () => localStorage.getItem("mds_auth_token") || ""
  );
  const [saved, setSaved] = useState(!!token);

  const handleSave = () => {
    if (token.trim()) {
      localStorage.setItem("mds_auth_token", token.trim());
      setSaved(true);
      dispatch(api.util.resetApiState());
    }
  };

  const handleClear = () => {
    localStorage.removeItem("mds_auth_token");
    setToken("");
    setSaved(false);
    dispatch(api.util.resetApiState());
  };

  if (saved) {
    return (
      <div className="bg-green-50 border-b border-green-200 px-6 py-2 flex items-center gap-3 text-sm">
        <span className="text-green-700">Auth token set</span>
        <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 text-xs">
          Change token
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 flex items-center gap-3">
      <span className="text-sm text-yellow-800 whitespace-nowrap">
        Paste x-app-token:
      </span>
      <Input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Bearer eyJ..."
        className="h-8 text-sm flex-1 max-w-xl"
      />
      <Button size="sm" onClick={handleSave} className="h-8">
        Save
      </Button>
    </div>
  );
}

function App() {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <TokenBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="px-6 pt-6 max-w-[1400px]">
            <Routes>
              <Route path="/leads" element={<LeadUsersPage />} />
              <Route path="/content-library" element={<ContentLibraryPage />} />
              <Route path="*" element={<Navigate to="/leads" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
