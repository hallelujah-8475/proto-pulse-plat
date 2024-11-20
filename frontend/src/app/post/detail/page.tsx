"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

interface PostDetail {
  title: string;
  content: string;
  fileUrl: string | null;
}

const PostDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("post_id");

  const [postDetail, setPostDetail] = useState<PostDetail>({
    title: "",
    content: "",
    fileUrl: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchPostDetail = async () => {
      const post_URL = `${process.env.NEXT_PUBLIC_API_URL}/post/get?post_id=${postId}`;
      try {
        const response = await fetch(post_URL);
        if (response.ok) {
          const post = await response.json();
          setPostDetail({
            title: post.title,
            content: post.content,
            fileUrl: post.file_url || null,
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

    if (postId) {
      fetchPostDetail();
    }
  }, [postId]);

  const images = [
    "https://loremflickr.com/800/600/girl",
    "https://loremflickr.com/800/600/dog",
    "https://loremflickr.com/800/600/girl",
    "https://loremflickr.com/800/600/dog",
    "https://loremflickr.com/800/600/girl",
  ];

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? images.length - 1 : prevSlide - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === images.length - 1 ? 0 : prevSlide + 1
    );
  };

  return (
    <>
      <Header />
      <div className="h-screen dark:bg-gray-800">
        <div className="max-w-xl mt-20 mx-auto p-5">
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
                  <img
                    src={images[currentSlide]}
                    className="w-full h-full object-cover"
                    alt="carousel image"
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

              {postDetail.fileUrl && (
                <div className="mt-4">
                  <p className="font-bold">ファイル:</p>
                  <a
                    href={postDetail.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {postDetail.fileUrl}
                  </a>
                </div>
              )}
              <button
                onClick={() => router.push("/edit?post_id=" + postId)}
                className="mt-5 bg-indigo-600 hover:bg-indigo-400 text-white py-2 px-4 rounded"
              >
                編集
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PostDetailPage;
