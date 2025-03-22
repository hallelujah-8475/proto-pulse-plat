"use client";

import React from "react";
import Image from "next/image";

export const Footer: React.FC = () => {
  return (
    <footer className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
      <div className="border-t border-slate-900/5 py-10">
        <p className="mt-5 text-center text-sm leading-6 text-slate-500">
          © 2025 Costole! All rights reserved.
        </p>
      </div>
    </footer>
  );
};
