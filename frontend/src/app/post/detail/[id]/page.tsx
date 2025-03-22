"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { PostDetail } from "../../../types/post";
import { User } from "../../../types/user";

const PostDetailPage: React.FC = () => {
  const [postDetail, setPostDetail] = useState<PostDetail>({
    id: 0,
    title: "",
    content: "",
    post_images_base64: [],
  });

  const [userDetail, setUserDetail] = useState<User>({
    id: 0,
    user_name: "",
    account_id: "",
    icon_image_base64: "",
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  const params = useParams();
  const searchParams = useSearchParams();
  const postId = params.id;
  const userId = searchParams.get("user_id");

  useEffect(() => {
    if (postId) {
      fetchPostDetail();
    }

    if (userId) {
      fetchUserDetail();
    }
  }, [postId, userId]);

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

  const fetchUserDetail = async () => {
    try {
      const user_URL = `${process.env.NEXT_PUBLIC_API_URL}/user/get?user_id=${userId}`;
      const response = await fetch(user_URL);
      if (response.ok) {
        const userDetail: User = await response.json();
        setUserDetail({
          id: userDetail.id,
          user_name: userDetail.user_name,
          account_id: userDetail.account_id,
          icon_image_base64: userDetail.icon_image_base64,
        });
      }
      console.log(userDetail);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
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

  return (
    <div className="min-screen dark:bg-gray-800">
      <div className="max-w-xl mt-20 mx-auto p-5">
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
              前の画像
            </button>
            <button
              className="flex items-center py-2 px-3 rounded font-medium select-none border text-gray-900 dark:text-white bg-white dark:bg-gray-800 transition-colors hover:border-blue-600 hover:bg-blue-400 hover:text-white dark:hover:text-white"
              onClick={handleNextSlide}
            >
              次の画像
            </button>
          </nav>

          <section className="text-gray-600 body-font">
            <div className="container px-5 py-24 mx-auto">
              <div className="flex flex-wrap -m-2">
                <div className="p-2 w-full">
                  <div className="h-full flex items-center border-gray-200 border p-4 rounded-lg">
                    <Image
                      alt="team"
                      className="w-16 h-16 bg-gray-100 object-cover object-center flex-shrink-0 rounded-full mr-4"
                      src={userDetail.icon_image_base64 || "/top_image.png"}
                      width={64}
                      height={64}
                    />
                    <div className="flex-grow">
                      <h2 className="text-gray-900 title-font font-medium">
                        {userDetail.account_id}
                      </h2>
                      <p className="text-gray-500">@{userDetail.user_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
