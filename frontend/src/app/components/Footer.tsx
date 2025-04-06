"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-slate-300 mt-12">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Costole</h3>
            <p className="text-sm">
              気軽にコスプレグッズをシェアしよう。
              <br />
              Costoleは自由な取引のためのきっかけを提供します。
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">
              ナビゲーション
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  このサービスについて
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-700 pt-6 text-center text-sm">
          © 2025 Costole. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
