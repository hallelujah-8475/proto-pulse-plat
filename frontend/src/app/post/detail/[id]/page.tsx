"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import Image from "next/image";
import { PostDetail } from "../../../types/post";

const PostDetailPage: React.FC = () => {
  const [postDetail, setPostDetail] = useState<PostDetail>({
    id: 0,
    title: "",
    content: "",
    post_images_base64: [],
  });
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const params = useParams();
  const postId = params.id;

  useEffect(() => {
    if (!postId) return;

    if (postId) {
      const fetchPostDetail = async () => {
        try {
          const post_URL = `${process.env.NEXT_PUBLIC_API_URL}/post/get?post_id=${postId}`;
          const response = await fetch(post_URL);
          if (response.ok) {
            const postDetail = await response.json();
            setPostDetail({
              id: postDetail.id,
              title: postDetail.title,
              content: postDetail.content,
              post_images_base64: postDetail.post_images_base64,
            });
          } else {
            setError("投稿の詳細を取得できませんでした");
          }
        } catch (error) {
          console.error("Error fetching post details:", error);
          setError("エラーが発生しました");
        }
      };

      fetchPostDetail();
    }
  }, [postId]);

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? postDetail.post_images_base64.length - 1 : prevSlide - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === postDetail.post_images_base64.length - 1 ? 0 : prevSlide + 1
    );
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
        setIsAuthenticated(false);
        window.location.href = "/";
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <Header isAuthenticated={isAuthenticated} oauth={oauth} logout={logout} />
      <div className="min-screen dark:bg-gray-800">
        <div className="max-w-xl mt-20 mx-auto p-5">
          <div>
            <h1 className="text-2xl font-bold mb-4">{postDetail.title}</h1>
            <p className="text-gray-700 mb-4">{postDetail.content}</p>

            <div className="relative w-full">
              <div className="relative w-full h-auto overflow-visible rounded-lg md:h-auto border">
                <Image
                  src={postDetail.post_images_base64[currentSlide]}
                  className="w-full max-h-96 object-contain"
                  alt="carousel image"
                  layout="intrinsic"
                  width={0}
                  height={0}
                />
              </div>
              <nav className="inline-flex w-full justify-between mt-4">
                <button
                  className="flex items-center py-2 px-3 rounded font-medium select-none border text-gray-900 dark:text-white bg-white dark:bg-gray-800 transition-colors hover:border-blue-600 hover:bg-blue-400 hover:text-white dark:hover:text-white"
                  onClick={handlePrevSlide}
                >
                  Previous
                </button>
                <button
                  className="flex items-center py-2 px-3 rounded font-medium select-none border text-gray-900 dark:text-white bg-white dark:bg-gray-800 transition-colors hover:border-blue-600 hover:bg-blue-400 hover:text-white dark:hover:text-white"
                  onClick={handleNextSlide}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PostDetailPage;
