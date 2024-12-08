// pages/index.tsx

"use client";
import React, { useLayoutEffect, useState } from "react";
import axios from "axios";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import Modal from "./components/Modal";
import PostCard from "./components/PostCard";
import { Post, Paging } from "./types/post";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [paging, setPaging] = useState<Paging>({
    total_count: 0,
    page: 1,
    per_page: 8,
  });
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const checkCookie = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    setIsAuthenticated(!!token);
  };

  // const handleEditClick = (postId: number) => {
  //   window.location.href = `/post/edit?post_id=${postId}`;
  // };

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
        setIsAuthenticated(false); // ログアウト時に認証状態を false に
        window.location.href = "/";
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useLayoutEffect(() => {
    fetchPosts();
    checkCookie();
  }, [paging.page, paging.per_page]);

  return (
    <>
      <Header isAuthenticated={isAuthenticated} oauth={oauth} logout={logout} />
      <Modal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={deletePost}
      />
      <div className="py-20 px-6 md:px-12 lg:grid lg:grid-cols-4 lg:gap-8">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            // onEditClick={handleEditClick}
            onDeleteClick={confirmDeletePost}
          />
        ))}
      </div>
      <Footer />
    </>
  );
}
