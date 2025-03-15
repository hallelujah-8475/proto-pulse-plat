"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
          }
        } catch (error) {
          console.error("Error fetching post details:", error);
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

  return (
    <>
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
    </>
  );
};

export default PostDetailPage;
