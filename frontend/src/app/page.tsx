"use client";

import React, { useCallback, useEffect, useState } from "react";
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

  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/post/list?page=${paging.page}&limit=${paging.per_page}`,
        { withCredentials: true }
      );

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

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <>
      <div className="py-20 px-6 md:px-16 lg:grid lg:grid-cols-4 lg:gap-2">
        {posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p>まだ投稿はありません。</p>
        )}
      </div>
    </>
  );
}
