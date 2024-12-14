"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Image from "next/image";

interface PostDetail {
  id: number;
  title: string;
  content: string;
  post_images_base64: string[];
}

const PostDetailPage: React.FC = () => {
  const [postDetail, setPostDetail] = useState<PostDetail>({
    id: 0,
    title: "",
    content: "",
    post_images_base64: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Suspense内でuseSearchParamsを使うためのコンポーネント
  const SearchParamsComponent = () => {
    const searchParams = useSearchParams();
    const postId = searchParams.get("post_id");

    useEffect(() => {
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
          } finally {
            setIsLoading(false);
          }
        };

        fetchPostDetail();
      }
    }, [postId]);

    return null; // データの読み込み中は何も表示しない
  };

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
        setIsAuthenticated(false); // ログアウト時に認証状態を false に
        window.location.href = "/";
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <Header isAuthenticated={isAuthenticated} oauth={oauth} logout={logout} />
      <div className="h-screen dark:bg-gray-800">
        <div className="max-w-xl mt-20 mx-auto p-5">
          <Suspense fallback={<p>Loading...</p>}>
            <SearchParamsComponent />
          </Suspense>
          {isLoading ? (
            <p>読み込み中...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div>
              <h1 className="text-2xl font-bold mb-4">{postDetail.title}</h1>
              <p className="text-gray-700 mb-4">{postDetail.content}</p>

              <div className="relative w-full">
                {/* Carousel wrapper */}
                <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
                  <Image
                    src={postDetail.post_images_base64[currentSlide]}
                    className="w-full h-full object-cover"
                    alt="carousel image"
                    layout="responsive"
                    width={0}
                    height={0}
                  />
                </div>

                {/* Slider controls */}
                <button
                  type="button"
                  className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                  onClick={handlePrevSlide}
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60">
                    <svg
                      className="w-4 h-4 text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 1L1 5l4 4"
                      />
                    </svg>
                    <span className="sr-only">Previous</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                  onClick={handleNextSlide}
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60">
                    <svg
                      className="w-4 h-4 text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 9l4-4-4-4"
                      />
                    </svg>
                    <span className="sr-only">Next</span>
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PostDetailPage;
