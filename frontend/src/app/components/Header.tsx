"use client";

import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";

export const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchOAuthURL = async (): Promise<string | null> => {
    const oauthURL = process.env.NEXT_PUBLIC_API_URL + "/oauth";
    if (!oauthURL) {
      console.error("OAuth URL is not defined");
      return null;
    }

    try {
      const response = await axios.get(oauthURL, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 && response.data.redirectURL) {
        return response.data.redirectURL;
      } else {
        console.error("Redirect URL is not available");
        return null;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error during OAuth request:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      return null;
    }
  };

  const oauth = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const redirectURL = await fetchOAuthURL();
    if (redirectURL != null) {
      window.location.href = redirectURL;
    }
  };

  const logout = () => {
    try {
      const logoutAPI = `${process.env.NEXT_PUBLIC_API_URL}/logout`;
      axios.post(logoutAPI, {}, { withCredentials: true }).then(() => {
        localStorage.removeItem("auth_token");
        setIsAuthenticated(false);
        window.location.href = "/";
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const checkCookie = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    checkCookie();
  }, []);

  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center gap-2">
        <a
          href="/"
          className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-3 text-xl">Tailblocks</span>
        </a>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center"></nav>
        <a href="/post/add">
          <button
            type="button"
            className="mb-2 flex rounded bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200 text-white px-6 py-2.5 text-xs font-medium uppercase leading-normal shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            投稿する
          </button>
        </a>

        {/* ログイン状態によってボタンを切り替え */}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={logout}
            className="mb-2 flex text-xs bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2.5 px-4 border border-gray-400 rounded shadow"
          >
            ログアウト
          </button>
        ) : (
          <button
            type="button"
            onClick={oauth}
            className="mb-2 flex rounded bg-[#1da1f2] px-6 py-2.5 text-xs font-medium text-white shadow-md transition duration-150 ease-in-out"
          >
            <span className="me-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 512 512"
                className="h-4 w-4"
              >
                <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
              </svg>
            </span>
            Twitterでログイン
          </button>
        )}
      </div>
    </header>
  );
};
