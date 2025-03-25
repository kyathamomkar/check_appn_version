import React, { useState, useEffect } from "react";

var fetchMetaInterval = null;
var dialogOpenTimeout = null;

const clearCacheAndReload = async () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  if ("caches" in window) {
    const caches = await window.caches.keys();
    await Promise.all(caches.map((key) => window.caches.delete(key)));
  }
  window.location.replace(window.location.href);
};

const AutoRefresh = (props) => {
  const {
    label = "",
    onClick = null,
    btnName = "Reload",
    currentVersion = "",
    fileName = "",
    dialogInactivityTimeout = 60 * 3 * 1000, // Defaulted to 3 minutesF
    defaultAutoRefreshTime = 60 * 10 * 1000, // Defaulted to 10 minutes,
  } = props;

  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchVersionFromServer = () => {
    try {
      fetch("/".concat(fileName), {
        cache: "no-store",
      })
        .then((r) => r.json())
        .then((response) => {
          if (response.version !== currentVersion) {
            setDialogOpen(true);
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (fileName) {
      fetchVersionFromServer();
      fetchMetaInterval = setInterval(
        () => fetchVersionFromServer(),
        defaultAutoRefreshTime
      );
    }
    return () => {
      dialogOpenTimeout && clearTimeout(dialogOpenTimeout);
      fetchMetaInterval && clearInterval(fetchMetaInterval);
    };
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      dialogOpenTimeout = setTimeout(
        () => clearCacheAndReload(),
        dialogInactivityTimeout
      );
    } else {
      dialogOpenTimeout && clearTimeout(dialogOpenTimeout);
    }
  }, [dialogOpen]);

  return (
    <>
      {dialogOpen && (
        <div
          style={{
            zIndex: 3000,
            width: "100vw",
            height: "100vh",
            position: "absolute",
            background: "rgb(0 0 0 / 57%)",
          }}
        >
          <div
            style={{
              top: "45%",
              margin: "auto",
              color: "black",
              padding: "10px",
              background: "white",
              width: "fit-content",
              position: "relative",
              borderRadius: "9px",
              border: "1px solid #ccc",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "#1f1e1ecc", fontFamily: "sans-serif" }}>
                {label ||
                  "An updated version of the app is available. Reload to the latest version"}
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <button
                  style={{
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "white",
                    cursor: "pointer",
                    borderRadius: "6px",
                    background: "#016db8",
                    border: "0.5px solid #016db8",
                  }}
                  onClick={() => {
                    if (onClick) onClick(clearCacheAndReload);
                    else clearCacheAndReload();
                  }}
                >
                  {btnName}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoRefresh;
