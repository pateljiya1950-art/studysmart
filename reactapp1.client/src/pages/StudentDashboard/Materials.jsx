import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";
import { FaFileAlt, FaFilePdf, FaFileWord, FaFileImage, FaTrash, FaPlus, FaLink, FaFolderOpen, FaExternalLinkAlt, FaUpload, FaDownload } from "react-icons/fa";
import "./Materials.css";

// Helper to pick an icon based on file extension in path
function getFileIcon(path) {
  const p = (path || "").toLowerCase();
  if (p.endsWith(".pdf")) return <FaFilePdf className="mt-icon-pdf" />;
  if (p.endsWith(".doc") || p.endsWith(".docx")) return <FaFileWord className="mt-icon-word" />;
  if (p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".jpeg")) return <FaFileImage className="mt-icon-img" />;
  if (p.startsWith("http")) return <FaLink className="mt-icon-link" />;
  return <FaFileAlt className="mt-icon-generic" />;
}

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [title, setTitle] = useState("");
  const [filePath, setFilePath] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadMode, setUploadMode] = useState("url"); // "url" | "file"

  useEffect(() => { loadMaterials(); }, []);

  const loadMaterials = async () => {
    try {
      const data = await authFetch("/student/materials");
      setMaterials(data || []);
    } catch (err) {
      console.error("Failed to load materials", err);
    }
  };

  const addMaterial = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (uploadMode === "url") {
        if (!filePath.trim()) return;
        await authFetch("/student/materials", {
          method: "POST",
          body: JSON.stringify({ Title: title, FilePath: filePath })
        });
      } else {
        if (files.length === 0) return;
        
        const uploadPromises = files.map(f => {
          const formData = new FormData();
          const uploadTitle = files.length > 1 ? `${title} - ${f.name}` : title;
          formData.append("Title", uploadTitle);
          formData.append("File", f);

          return authFetch("/student/materials/upload", {
            method: "POST",
            body: formData
          });
        });

        await Promise.all(uploadPromises);
      }

      setTitle("");
      setFilePath("");
      setFiles([]);
      loadMaterials();
    } catch (err) {
      console.error("Failed to add material", err);
    }
  };

  const deleteMaterial = async (id) => {
    try {
      await authFetch(`/student/materials/${id}`, { method: "DELETE" });
      loadMaterials();
    } catch (err) {
      console.error("Failed to delete material", err);
    }
  };

  return (
    <div className="mt">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="mt-header">
        <div>
          <h1 className="mt-title">Study Materials</h1>
          <p className="mt-subtitle">Organize your study resources, links, and documents</p>
        </div>
      </div>

      <div className="mt-layout">

        {/* ── ADD NEW RESOURCE ────────────────────────────────────── */}
        <div className="mt-side">
          <div className="mt-add-card">
            <h3 className="mt-card-title">Add Resource</h3>
            <form className="mt-form" onSubmit={addMaterial}>

              <div className="mt-input-group">
                <label>Resource Title</label>
                <input
                  placeholder="e.g.Chapter 4 Notes"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mt-input-group mt-mode-toggle">
                <div
                  className={`mt-mode-btn ${uploadMode === "url" ? "active" : ""}`}
                  onClick={() => setUploadMode("url")}
                >
                  <FaLink /> Link
                </div>
                <div
                  className={`mt-mode-btn ${uploadMode === "file" ? "active" : ""}`}
                  onClick={() => setUploadMode("file")}
                >
                  <FaUpload /> Upload
                </div>
              </div>

              {uploadMode === "url" ? (
                <div className="mt-input-group">
                  <label>URL / File Path</label>
                  <div className="mt-input-icon-wrap">
                    <FaLink className="mt-input-icon" />
                    <input
                      placeholder="https://... or /downloads/..."
                      value={filePath}
                      onChange={e => setFilePath(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-input-group">
                  <label>Select File(s)</label>
                  <input
                    type="file"
                    className="mt-file-input"
                    multiple
                    onChange={e => setFiles(Array.from(e.target.files))}
                    required
                  />
                  {files.length > 0 && (
                    <span className="mt-file-name">
                      {files.length === 1 ? files[0].name : `${files.length} files selected`}
                    </span>
                  )}
                </div>
              )}

              <button type="submit" className="mt-btn-add">
                <FaPlus /> Save Material
              </button>
            </form>
          </div>

          <div className="mt-info-box">
            <h4>Pro Tip</h4>
            <p>You can add direct web links (URLs) or local paths to easily track lecture slides, PDFs, and related reading.</p>
          </div>
        </div>

        {/* ── RESOURCE GRID ───────────────────────────────────────── */}
        <div className="mt-main">
          {materials.length === 0 ? (
            <div className="mt-empty">
              <FaFolderOpen className="mt-empty-icon" />
              <p>Your library is empty.</p>
              <span>Add a resource from the left menu.</span>
            </div>
          ) : (
            <div className="mt-grid">
              {materials.map(m => {
                const isUrl = m.filePath?.startsWith("http");

                return (
                  <div key={m.materialId} className="mt-item-card">
                    <div className="mt-item-top">
                      <div className="mt-item-icon-box">
                        {getFileIcon(m.filePath)}
                      </div>
                      <div className="mt-item-actions">
                        <button
                          className="mt-btn-delete"
                          onClick={() => deleteMaterial(m.materialId)}
                          title="Delete Material"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="mt-item-body">
                      <h4 className="mt-item-title">{m.title}</h4>
                      <p className="mt-item-path" title={m.filePath}>
                        {m.filePath}
                      </p>
                    </div>

                    <div className="mt-item-footer">
                      {isUrl ? (
                        <a href={m.filePath} target="_blank" rel="noreferrer" className="mt-btn-action">
                          <FaExternalLinkAlt /> Open Link
                        </a>
                      ) : (
                        <a href={`https://localhost:7214${m.filePath}`} target="_blank" rel="noreferrer" className="mt-btn-action mt-btn-download">
                          <FaDownload /> Download File
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}