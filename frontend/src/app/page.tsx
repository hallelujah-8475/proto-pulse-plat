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
  }, [fetchPosts, paging.page, paging.per_page]);

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

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPaging({ ...paging, page: newPage });
    }
  };

  const totalPages = Math.ceil(paging.total_count / paging.per_page);

  return (
    <>
      <div className="relative flex flex-col items-center max-w-screen-xl px-4 mx-auto md:flex-row sm:px-6 p-8">
        <div className="flex items-center py-5 md:w-1/2 md:pb-20 md:pt-10 md:pr-10">
          <div className="text-left">
            <h2 className="text-4xl font-extrabold leading-10 tracking-tight text-gray-800 sm:text-5xl sm:leading-none md:text-4xl">
              必要なものを
              <span className="font-bold text-blue-500">必要な人へ</span>
            </h2>
            <p className="max-w-md mx-auto mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              あなたのいらないが誰かの役に立つ
            </p>
          </div>
        </div>
        <div className="flex items-center py-5 md:w-1/2 md:pb-20 md:pt-10 md:pl-10">
          <div className="relative w-full p-3 rounded  md:p-8">
            <div className="rounded-lg bg-white text-black w-full">
              <img src="https://picsum.photos/400/300" />
            </div>
          </div>
        </div>
      </div>
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
              : selectedCategory === "content_title"
              ? "コンテンツ"
              : selectedCategory === "location"
              ? "取引場所"
              : ""}
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
                  onClick={() => handleCategorySelect("content_title")}
                >
                  コンテンツ
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
      <div className="flex justify-center mt-8 mb-5">
        <ol className="flex list-reset space-x-1">
          <li>
            <button
              onClick={() => {
                if (paging.page > 1) {
                  handlePageChange(paging.page - 1);
                }
              }}
              className={`inline-flex items-center justify-center w-8 h-8 border border-gray-100 rounded ${
                paging.page > 1 ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={paging.page <= 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, index) => (
            <li key={index}>
              <button
                onClick={() => handlePageChange(index + 1)}
                className={`block w-8 h-8 text-center border border-gray-100 rounded leading-8 ${
                  paging.page === index + 1
                    ? "text-white bg-blue-600 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                {index + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => {
                if (paging.page < totalPages) {
                  handlePageChange(paging.page + 1);
                }
              }}
              className={`inline-flex items-center justify-center w-8 h-8 border border-gray-100 rounded ${
                paging.page < totalPages ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={paging.page >= totalPages}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>
        </ol>
      </div>
    </>
  );
}
