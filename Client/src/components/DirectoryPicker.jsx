import { useState, useEffect, useMemo } from "react";
import {
  X,
  Folder,
  ChevronRight,
  ArrowLeft,
  HardDrive,
  Search,
  Check,
} from "lucide-react";
import PropTypes from "prop-types";

export default function DirectoryPicker({
  isOpen,
  onClose,
  onSelect,
  serverUrl,
}) {
  const [currentPath, setCurrentPath] = useState("");
  const [folders, setFolders] = useState([]);
  const [parentPath, setParentPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* 🔁 Fetch folders */
  const fetchFolders = async (path = "") => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${serverUrl}/explorer?path=${encodeURIComponent(path)}`
      );
      const data = await res.json();

      if (res.ok) {
        setFolders(data.folders || []);
        setCurrentPath(data.currentPath || "");
        setParentPath(data.parentPath || "");
      }
    } catch (err) {
      console.error("Failed to fetch folders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* 🔄 Load on open */
  useEffect(() => {
    if (isOpen) {
      fetchFolders(currentPath);
    }
  }, [isOpen]);

  /* 🔍 Filtered folders (optimized) */
  const filteredFolders = useMemo(() => {
    return folders.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [folders, search]);

  /* ⛔ Don't render if closed */
  if (!isOpen) return null;

  /* 📂 Breadcrumb generator */
  const pathParts = currentPath
    .split(/[\\\/]/)
    .filter((p) => p);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl h-[600px] bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Folder className="w-5 h-5 text-purple-400" />
              Choose Project Directory
            </h3>
            <p className="text-sm text-slate-400 mt-1 truncate">
              {currentPath || "My Computer"}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="bg-slate-800/30 border-b border-slate-800 flex flex-col">
          
          {/* Breadcrumb */}
          <div className="p-4 flex items-center gap-3">
            <button
              onClick={() => fetchFolders("")}
              title="This PC"
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
              <HardDrive className="w-5 h-5" />
            </button>

            <div className="flex-1 flex items-center gap-1 overflow-x-auto text-sm py-1">
              <span className="text-slate-500 whitespace-nowrap">
                This PC
              </span>

              {pathParts.map((part, i) => {
                const path =
                  pathParts.slice(0, i + 1).join("\\") +
                  (i === 0 ? "\\" : "");

                return (
                  <div key={i} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <button
                      onClick={() => fetchFolders(path)}
                      className="text-slate-300 hover:text-white px-1 rounded"
                    >
                      {part}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Back button */}
            {currentPath && (
              <button
                onClick={() => fetchFolders(parentPath)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white flex items-center gap-2 text-xs font-bold transition-all group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
            )}
          </div>

          {/* Search */}
          <div className="px-4 pb-4">

          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-600/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filteredFolders.length > 0 ? (
            <div className="grid gap-1">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.path}
                  onClick={() => fetchFolders(folder.path)}
                  className="group w-full flex items-center justify-between p-3 rounded-xl hover:bg-purple-600/10 border border-transparent hover:border-purple-500/20 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    {folder.isDrive ? (
                      <HardDrive className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Folder className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    )}
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                      {folder.name}
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          ) : (

          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur">
          <div className="text-xs text-slate-500 font-mono truncate max-w-[50%]">
            Selection: {currentPath || "Root"}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-slate-400 hover:text-white"
            >
              Close
            </button>

            <button
              onClick={() => onSelect(currentPath)}
              disabled={!currentPath}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
                !currentPath
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-500 text-white"
              }`}
            >
              <Check className="w-4 h-4" />
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ✅ Prop Types */
DirectoryPicker.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  serverUrl: PropTypes.string.isRequired,
};