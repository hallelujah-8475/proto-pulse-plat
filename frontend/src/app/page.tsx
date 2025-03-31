"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import PostCard from "./components/PostCard";
import { Post, Paging } from "./types/post";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [paging, setPaging] = useState<Paging>({
    total_count: 0,
    page: 1,
    per_page: 8,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const [selectedCategory, setSelectedCategory] = useState("title");
  const [searchKeyword, setSearchKeyword] = useState("");

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(
    (selectedCategory: string, searchKeyword: string) => {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/post/list`, {
          params: {
            page: paging.page,
            limit: paging.per_page,
            [selectedCategory]: searchKeyword,
          },
          withCredentials: true,
        })
        .then((response) => {
          const fetchedPosts = Array.isArray(response.data.posts)
            ? response.data.posts
            : [];

          setPosts(fetchedPosts);
          setPaging({
            total_count: response.data.total_count,
            page: response.data.page,
            per_page: response.data.per_page,
          });
        });
    },
    [paging.page, paging.per_page]
  );

  useEffect(() => {
    fetchPosts("", "");
  }, [fetchPosts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(selectedCategory, searchKeyword);
  };

  return (
    <>
      <form className="max-w-lg mx-auto p-4" onSubmit={handleSearch}>
        <div className="flex relative">
          <button
            ref={buttonRef}
            id="dropdown-button"
            onClick={toggleDropdown}
            className="shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600"
            type="button"
          >
            {selectedCategory === "title"
              ? "タイトル"
              : selectedCategory === "content"
              ? "内容"
              : "取引場所"}{" "}
            <svg
              className="w-2.5 h-2.5 ms-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <div className="relative w-full">
            <input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
              placeholder="検索する"
            />
            <button
              type="submit"
              className="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
              <span className="sr-only">Search</span>
            </button>
          </div>
        </div>
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 20,
            }}
            className="bg-white divide-y divide-gray-100 rounded-lg shadow-md w-44 dark:bg-gray-700"
          >
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li>
                <button
                  type="button"
                  className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleCategorySelect("title")}
                >
                  タイトル
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleCategorySelect("content")}
                >
                  内容
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleCategorySelect("location")}
                >
                  取引場所
                </button>
              </li>
            </ul>
          </div>
        )}
      </form>
      <div className="py-20 px-6 md:px-16 lg:grid lg:grid-cols-4 lg:gap-2">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p>まだ投稿はありません。</p>
        )}
      </div>
    </>
  );
}
