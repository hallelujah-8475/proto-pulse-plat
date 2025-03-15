"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Modal from "./components/Modal";
import PostCard from "./components/PostCard";
import { Post, Paging } from "./types/post";
import Image from "next/image";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]); // 初期値は空の配列
  const [paging, setPaging] = useState<Paging>({
    total_count: 0,
    page: 1,
    per_page: 8,
  });
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const fetchURL = `${process.env.NEXT_PUBLIC_API_URL}/post/list?page=${paging.page}&limit=${paging.per_page}`;
      const response = await axios.get(fetchURL, { withCredentials: true });

      // APIのレスポンスを確認してpostsが配列であることを保証
      const fetchedPosts = Array.isArray(response.data.posts)
        ? response.data.posts
        : [];

      setPosts(fetchedPosts);
      setPaging({
        total_count: response.data.total_count,
        page: response.data.page,
        per_page: response.data.per_page,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [paging.page, paging.per_page]);

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

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <>
      <Modal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={deletePost}
      />
      <div className="w-full">
        <Image
          src={"/top_image.png"}
          alt="icon"
          width={0}
          height={0}
          layout="responsive"
        />
      </div>
      <div className="py-20 px-6 md:px-12 lg:grid lg:grid-cols-4 lg:gap-8">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleteClick={confirmDeletePost}
            />
          ))
        ) : (
          <p>No posts available</p>
        )}
      </div>
    </>
  );
}
