"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./toast-styles.css";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container"
        toastClassName={() =>
          "relative flex p-4 min-h-16 rounded-2xl justify-between overflow-hidden cursor-pointer toast-item shadow-2xl border-0 backdrop-blur-md bg-white/95"
        }
        progressClassName="toast-progress"
      />
      {children}
    </>
  );
}
