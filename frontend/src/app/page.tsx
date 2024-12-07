// pages/index.tsx
"use client"; // クライアントサイドコンポーネントとしてマーク
import React, { useLayoutEffect, useState } from "react";
import axios from "axios";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import PostCard from "./components/PostCard"; // Post コンポーネントをインポート
import { Post, Paging } from "./types/post"; // Post 型をインポート

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]); // Post 型を使用
  const [paging, setPaging] = useState<Paging>({
    total_count: 0,
    page: 1,
    per_page: 8,
  });
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const fetchPosts = async () => {
    try {
      const fetchURL = `${process.env.NEXT_PUBLIC_API_URL}/post/list?page=${paging.page}&limit=${paging.per_page}`;
      const response = await axios.get(fetchURL, { withCredentials: true });
      setPosts(response.data.posts);
      setPaging({
        total_count: response.data.total_count,
        page: response.data.page,
        per_page: response.data.per_page,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleEditClick = (postId: number) => {
    window.location.href = `/post/edit?post_id=${postId}`;
  };

  const confirmDeletePost = (postId: number) => {
    setPostToDelete(postId);
    setShowModal(true);
  };

  const deletePost = async () => {
    if (postToDelete === null) return;
    const deleteURL = process.env.NEXT_PUBLIC_API_URL + "/post/delete";
    try {
      await axios.post(
        deleteURL,
        { post_id: postToDelete },
        { headers: { "Content-Type": "application/json" } }
      );
      setPosts(posts.filter((post) => post.id !== postToDelete));
      setPostToDelete(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  useLayoutEffect(() => {
    fetchPosts();
  }, [paging.page, paging.per_page]);

  return (
    <>
      <Header />
      {/* モーダル */}
      <div
        id="popup-modal"
        tabIndex={-1}
        className={`fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-gray-900 bg-opacity-50 ${
          showModal ? "block" : "hidden"
        }`}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow-lg dark:bg-gray-700">
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center"
              onClick={() => setShowModal(false)}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-4 md:p-5 text-center">
              <svg
                className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
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
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                この投稿を削除しますか？
              </h3>
              <button
                onClick={deletePost}
                type="button"
                className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
              >
                はい
              </button>
              <button
                onClick={() => setShowModal(false)}
                type="button"
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="py-20 px-6 md:px-12 lg:grid lg:grid-cols-4 lg:gap-8">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onEditClick={handleEditClick}
            onDeleteClick={confirmDeletePost}
          />
        ))}
      </div>
      <Footer />
    </>
  );
}
