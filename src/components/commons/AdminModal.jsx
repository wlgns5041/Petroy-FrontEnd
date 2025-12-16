import React, { useEffect, useMemo, useState, useRef } from "react";
import ReactDOM from "react-dom";
import CloseIcon from "@mui/icons-material/Close";
import "../../styles/AdminModal.css";

import AlertModal from "./AlertModal.jsx";
import MyPageConfirmModal from "../../components/MyPage/MyPageConfirmModal";
import { fetchCategories } from "../../services/CommunityService";
import { fetchSpeciesList, fetchBreedList } from "../../services/PetService";
import {
  createCategory,
  deleteCategory,
  createSpecies,
  deleteSpecies,
  createBreed,
  deleteBreed,
} from "../../services/AdminService.jsx";

const AdminModal = ({ open, onClose }) => {
  const [tab, setTab] = useState("category");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [species, setSpecies] = useState([]);

  const [newBreedName, setNewBreedName] = useState("");
  const [creatingBreed, setCreatingBreed] = useState(false);
  const [deletingBreedId, setDeletingBreedId] = useState(null);

  const [breedConfirmOpen, setBreedConfirmOpen] = useState(false);
  const [pendingDeleteBreedId, setPendingDeleteBreedId] = useState(null);

  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null);
  const [breeds, setBreeds] = useState([]);
  const [isSpeciesOpen, setIsSpeciesOpen] = useState(false);

  const speciesSelectRef = useRef(null);
  const [speciesDropdownPos, setSpeciesDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const [newSpeciesName, setNewSpeciesName] = useState("");
  const [creatingSpecies, setCreatingSpecies] = useState(false);
  const [deletingSpeciesId, setDeletingSpeciesId] = useState(null);

  const [speciesConfirmOpen, setSpeciesConfirmOpen] = useState(false);
  const [pendingDeleteSpeciesId, setPendingDeleteSpeciesId] = useState(null);

  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState("");

  const selectedSpecies = useMemo(() => {
    return species.find(
      (s) => String(s.speciesId ?? s.id) === String(selectedSpeciesId)
    );
  }, [species, selectedSpeciesId]);

  const reloadCategories = async () => {
    const catList = await fetchCategories();
    setCategories(Array.isArray(catList) ? catList : []);
  };

  const reloadSpecies = async () => {
    const list = await fetchSpeciesList();
    setSpecies(Array.isArray(list) ? list : []);
  };

  const reloadBreeds = async () => {
    if (!selectedSpeciesId) {
      setBreeds([]);
      return;
    }
    const list = await fetchBreedList(selectedSpeciesId);
    setBreeds(Array.isArray(list) ? list : []);
  };

  const updateSpeciesDropdownPos = () => {
    const el = speciesSelectRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setSpeciesDropdownPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setAlertMessage("카테고리 이름을 입력해주세요.");
      setShowAlert(true);
      return;
    }

    try {
      setCreating(true);
      const ok = await createCategory(name);
      if (ok) {
        setNewCategoryName("");
        await reloadCategories();
      }
    } catch (e) {
      const msg =
        e?.response?.data?.errorMessage ||
        "카테고리 생성 중 오류가 발생했습니다.";
      setErrorMsg(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (!categoryId) return;
    setPendingDeleteId(categoryId);
    setConfirmOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!pendingDeleteId) return;

    try {
      setDeletingId(pendingDeleteId);
      const ok = await deleteCategory(pendingDeleteId);
      if (ok) {
        await reloadCategories();
      }
    } catch (e) {
      const msg =
        e?.response?.data?.errorMessage ||
        "카테고리 삭제 중 오류가 발생했습니다.";
      setErrorMsg(msg);
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
      setConfirmOpen(false);
    }
  };

  const handleCreateSpecies = async () => {
    const name = newSpeciesName.trim();
    if (!name) {
      setAlertMessage("종 이름을 입력해주세요.");
      setShowAlert(true);
      return;
    }

    try {
      setCreatingSpecies(true);
      const ok = await createSpecies(name);
      if (ok) {
        setNewSpeciesName("");
        await reloadSpecies();
      }
    } catch (e) {
      const msg =
        e?.response?.data?.errorMessage || "종 생성 중 오류가 발생했습니다.";
      setErrorMsg(msg);
    } finally {
      setCreatingSpecies(false);
    }
  };

  const handleDeleteSpecies = (speciesId) => {
    if (!speciesId) return;
    setPendingDeleteSpeciesId(speciesId);
    setSpeciesConfirmOpen(true);
  };

  const confirmDeleteSpecies = async () => {
    if (!pendingDeleteSpeciesId) return;

    try {
      setDeletingSpeciesId(pendingDeleteSpeciesId);
      const ok = await deleteSpecies(pendingDeleteSpeciesId);
      if (ok) {
        await reloadSpecies();
        if (String(selectedSpeciesId) === String(pendingDeleteSpeciesId)) {
          const nextList = await fetchSpeciesList();
          const firstId = nextList?.[0]?.speciesId ?? nextList?.[0]?.id ?? null;
          setSelectedSpeciesId(firstId ? String(firstId) : null);
        }
      }
    } catch (e) {
      const msg =
        e?.response?.data?.errorMessage || "종 삭제 중 오류가 발생했습니다.";
      setErrorMsg(msg);
    } finally {
      setDeletingSpeciesId(null);
      setPendingDeleteSpeciesId(null);
      setSpeciesConfirmOpen(false);
    }
  };

  const handleCreateBreed = async () => {
    const name = newBreedName.trim();
    if (!name) {
      setAlertMessage("세부 종 이름을 입력해주세요.");
      setShowAlert(true);
      return;
    }
    if (!selectedSpeciesId) {
      setAlertMessage("먼저 종을 선택해주세요.");
      setShowAlert(true);
      return;
    }

    try {
      setCreatingBreed(true);
      const ok = await createBreed(selectedSpeciesId, name);
      if (ok) {
        setNewBreedName("");
        await reloadBreeds();
      }
    } catch (e) {
      const msg = e?.message || "세부 종 생성 중 오류가 발생했습니다.";
      setErrorMsg(msg);
    } finally {
      setCreatingBreed(false);
    }
  };

  const handleDeleteBreed = (breedId) => {
    if (!breedId) return;
    setPendingDeleteBreedId(breedId);
    setBreedConfirmOpen(true);
  };

  const confirmDeleteBreed = async () => {
    if (!pendingDeleteBreedId) return;

    try {
      setDeletingBreedId(pendingDeleteBreedId);
      const ok = await deleteBreed(pendingDeleteBreedId);
      if (ok) {
        await reloadBreeds();
      }
    } catch (e) {
      const msg = e?.message || "세부 종 삭제 중 오류가 발생했습니다.";
      setErrorMsg(msg);
    } finally {
      setDeletingBreedId(null);
      setPendingDeleteBreedId(null);
      setBreedConfirmOpen(false);
    }
  };

    useEffect(() => {
    if (!isSpeciesOpen) return;

    updateSpeciesDropdownPos();

    const handleResize = () => updateSpeciesDropdownPos();

    const handleScroll = () => updateSpeciesDropdownPos();

    const handleOutsideClick = (e) => {
      const wrap = speciesSelectRef.current;
      const dropdown = document.getElementById("admin-species-dropdown");
      if (!wrap) return;

      if (
        !wrap.contains(e.target) &&
        dropdown &&
        !dropdown.contains(e.target)
      ) {
        setIsSpeciesOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isSpeciesOpen]);

  useEffect(() => {
    if (!open) return;

    setErrorMsg("");
    setLoading(true);

    (async () => {
      try {
        const [catList, speciesList] = await Promise.all([
          fetchCategories(),
          fetchSpeciesList(),
        ]);

        setCategories(Array.isArray(catList) ? catList : []);
        setSpecies(Array.isArray(speciesList) ? speciesList : []);

        const firstSpeciesId =
          speciesList?.[0]?.speciesId ?? speciesList?.[0]?.id ?? null;

        setSelectedSpeciesId(firstSpeciesId ? String(firstSpeciesId) : null);
      } catch (e) {
        console.error(e);
        setErrorMsg("관리자 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!selectedSpeciesId) {
      setBreeds([]);
      return;
    }

    setErrorMsg("");
    setLoading(true);

    (async () => {
      try {
        const list = await fetchBreedList(selectedSpeciesId);
        setBreeds(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        setErrorMsg("세부 종 목록을 불러오지 못했습니다.");
        setBreeds([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, selectedSpeciesId]);

  if (!open) return null;

  return (
    <>
      <div className="admin-modal-mask" onClick={onClose} />
      <div className="admin-modal" role="dialog" aria-modal="true">
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">관리자 모드</h3>
          <button className="admin-modal-close" onClick={onClose} type="button">
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="admin-modal-tabs">
          <button
            type="button"
            className={`admin-modal-tab ${tab === "category" ? "active" : ""}`}
            onClick={() => setTab("category")}
          >
            게시글 카테고리
          </button>
          <button
            type="button"
            className={`admin-modal-tab ${tab === "species" ? "active" : ""}`}
            onClick={() => setTab("species")}
          >
            반려동물 종
          </button>
          <button
            type="button"
            className={`admin-modal-tab ${tab === "breed" ? "active" : ""}`}
            onClick={() => setTab("breed")}
          >
            세부 종
          </button>
        </div>

        <div className="admin-modal-body">
          {loading && <div className="admin-modal-info">불러오는 중...</div>}
          {!loading && errorMsg && (
            <div className="admin-modal-error">{errorMsg}</div>
          )}

          {!loading && !errorMsg && tab === "category" && (
            <section className="admin-section">
              <div className="admin-section-title">
                <span>카테고리 목록</span>
              </div>

              <div className="admin-add-row">
                <input
                  className="admin-add-input"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="카테고리 이름 입력"
                  maxLength={30}
                />
                <button
                  type="button"
                  className="admin-add-confirm"
                  onClick={handleCreateCategory}
                  disabled={creating}
                >
                  추가
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="admin-empty">카테고리가 없습니다.</div>
              ) : (
                <ul className="admin-list">
                  {categories.map((c, idx) => {
                    const id = c.categoryId ?? c.id;
                    return (
                      <li key={id ?? idx} className="admin-list-item">
                        <div className="admin-item-left">
                          <span className="admin-item-name">
                            {c.categoryName ?? c.name ?? "이름 없음"}
                          </span>
                          <span className="admin-item-sub">
                            ID: {id ?? "-"}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="admin-item-delete-btn"
                          onClick={() => handleDeleteCategory(id)}
                          disabled={deletingId === id}
                          aria-label="카테고리 삭제"
                          title="삭제"
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {!loading && !errorMsg && tab === "species" && (
            <section className="admin-section">
              <div className="admin-section-title">
                <span>종 목록</span>
              </div>

              <div className="admin-add-row">
                <input
                  className="admin-add-input"
                  value={newSpeciesName}
                  onChange={(e) => setNewSpeciesName(e.target.value)}
                  placeholder="종 이름 입력"
                  maxLength={30}
                />
                <button
                  type="button"
                  className="admin-add-confirm"
                  onClick={handleCreateSpecies}
                  disabled={creatingSpecies}
                >
                  추가
                </button>
              </div>

              {species.length === 0 ? (
                <div className="admin-empty">종 데이터가 없습니다.</div>
              ) : (
                <ul className="admin-list">
                  {species.map((s, idx) => {
                    const id = s.speciesId ?? s.id;
                    return (
                      <li key={id ?? idx} className="admin-list-item">
                        <div className="admin-item-left">
                          <span className="admin-item-name">
                            {s.speciesName ?? s.name ?? "이름 없음"}
                          </span>
                          <span className="admin-item-sub">
                            ID: {id ?? "-"}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="admin-item-delete-btn"
                          onClick={() => handleDeleteSpecies(id)}
                          disabled={deletingSpeciesId === id}
                          aria-label="종 삭제"
                          title="삭제"
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {!loading && !errorMsg && tab === "breed" && (
            <section className="admin-section">
              <div className="admin-section-title">세부 종 목록</div>

              <div className="admin-row">
                <label className="admin-label">종 선택</label>
                <div className="admin-select-wrapper" ref={speciesSelectRef}>
                  <div
                    className={`admin-select ${isSpeciesOpen ? "active" : ""}`}
                    onClick={() => setIsSpeciesOpen((prev) => !prev)}
                  >
                    {selectedSpecies?.speciesName ??
                      selectedSpecies?.name ??
                      "종 선택"}
                    <span className="admin-select-arrow">▼</span>
                  </div>
                </div>
              </div>

              <div className="admin-add-row">
                <input
                  className="admin-add-input"
                  value={newBreedName}
                  onChange={(e) => setNewBreedName(e.target.value)}
                  placeholder="세부 종 이름 입력"
                  maxLength={30}
                  disabled={!selectedSpeciesId}
                />
                <button
                  type="button"
                  className="admin-add-confirm"
                  onClick={handleCreateBreed}
                  disabled={creatingBreed || !selectedSpeciesId}
                >
                  추가
                </button>
              </div>

              {breeds.length === 0 ? (
                <div className="admin-empty">세부 종(품종)이 없습니다.</div>
              ) : (
                <ul className="admin-list">
                  {breeds.map((b, idx) => {
                    const id = b.breedId ?? b.id;
                    return (
                      <li key={id ?? idx} className="admin-list-item">
                        <div className="admin-item-left">
                          <span className="admin-item-name">
                            {b.breedName ?? b.name ?? "이름 없음"}
                          </span>
                          <span className="admin-item-sub">
                            ID: {id ?? "-"}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="admin-item-delete-btn"
                          onClick={() => handleDeleteBreed(id)}
                          disabled={deletingBreedId === id}
                          aria-label="세부 종 삭제"
                          title="삭제"
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>

      {isSpeciesOpen &&
        ReactDOM.createPortal(
          <ul
            id="admin-species-dropdown"
            className="admin-select-dropdown"
            style={{
              position: "fixed",
              top: speciesDropdownPos.top,
              left: speciesDropdownPos.left,
              width: speciesDropdownPos.width,
              zIndex: 2200,
            }}
          >
            {species.map((s) => {
              const id = String(s.speciesId ?? s.id);
              const isSelected = String(selectedSpeciesId) === id;

              return (
                <li
                  key={id}
                  className={`admin-select-option ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={async () => {
                    setSelectedSpeciesId(id);
                    setIsSpeciesOpen(false);
                    setNewBreedName("");
                    const list = await fetchBreedList(id);
                    setBreeds(Array.isArray(list) ? list : []);
                  }}
                >
                  {s.speciesName ?? s.name ?? id}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
      {confirmOpen && (
        <MyPageConfirmModal
          message={"해당 카테고리를 삭제할까요?"}
          onCancel={() => {
            setConfirmOpen(false);
            setPendingDeleteId(null);
          }}
          onConfirm={confirmDeleteCategory}
        />
      )}

      {speciesConfirmOpen && (
        <MyPageConfirmModal
          message={"해당 종을 삭제할까요?"}
          onCancel={() => {
            setSpeciesConfirmOpen(false);
            setPendingDeleteSpeciesId(null);
          }}
          onConfirm={confirmDeleteSpecies}
        />
      )}

      {breedConfirmOpen && (
        <MyPageConfirmModal
          message={"해당 세부 종을 삭제할까요?"}
          onCancel={() => {
            setBreedConfirmOpen(false);
            setPendingDeleteBreedId(null);
          }}
          onConfirm={confirmDeleteBreed}
        />
      )}

      {showAlert && (
        <AlertModal
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </>
  );
};

export default AdminModal;
