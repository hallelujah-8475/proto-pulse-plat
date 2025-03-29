"use client";

import Modal from "../../../components/Modal";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { PostDetail } from "../../../types/post";
import { User } from "../../../types/user";
import { useRouter } from "next/navigation";

const PostDetailPage: React.FC = () => {
  const router = useRouter();
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [userDetail, setUserDetail] = useState<User | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isOwnPost, setIsOwnPost] = useState(false);

  const postId = useParams().id;
  const userId = useSearchParams().get("user_id");

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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/post/get?post_id=${postId}`
      );
      const postDetail = response.data;
      setPostDetail({
        id: postDetail.id,
        title: postDetail.title,
        content: postDetail.content,
        post_images_base64: postDetail.post_images_base64,
      });
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  const fetchUserDetail = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/get?user_id=${userId}`
      );
      const userDetail: User = response.data;
      setUserDetail({
        id: userDetail.id,
        user_name: userDetail.user_name,
        account_id: userDetail.account_id,
        icon_image_base64: userDetail.icon_image_base64,
      });

      if (userDetail.id == Number(userId)) {
        setIsOwnPost(true);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handlePrevSlide = () => {
    if (postDetail) {
      setCurrentSlide((prevSlide) =>
        prevSlide === 0
          ? postDetail.post_images_base64.length - 1
          : prevSlide - 1
      );
    }
  };

  const handleNextSlide = () => {
    if (postDetail) {
      setCurrentSlide((prevSlide) =>
        prevSlide === postDetail.post_images_base64.length - 1
          ? 0
          : prevSlide + 1
      );
    }
  };

  const confirmDeletePost = (postId: number) => {
    setPostToDelete(postId);
    setShowModal(true);
  };

  const deletePost = async () => {
    if (postToDelete === null) return;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/post/delete`,
        { post_id: postToDelete },
        { headers: { "Content-Type": "application/json" } }
      );
      setPostDetail(postDetail);
      setPostToDelete(null);
      setShowModal(false);
      router.push("/");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <>
      <Modal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={deletePost}
      />
      <div className="min-screen dark:bg-gray-800">
        <div className="max-w-xl mt-20 mx-auto p-5">
          {isOwnPost && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() =>
                  confirmDeletePost(postDetail != null ? postDetail.id : 0)
                }
                className="text-slate-800 hover:text-blue-600 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
              >
                <span>投稿を削除する</span>
              </button>
            </div>
          )}
          <h1 className="text-2xl font-bold mb-4">
            {postDetail != null ? postDetail.title : "無題"}
          </h1>
          <pre className="text-gray-700 mb-4 whitespace-pre-wrap">
            {postDetail != null ? postDetail.content : ""}
          </pre>
          <div className="relative w-full">
            <div className="relative w-full h-auto overflow-visible rounded-lg md:h-auto border">
              <Image
                src={
                  postDetail != null
                    ? postDetail.post_images_base64[currentSlide]
                    : "/noimage.jpg"
                }
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
                        src={
                          userDetail != null
                            ? userDetail.icon_image_base64
                            : "/noimage.jpg"
                        }
                        width={64}
                        height={64}
                      />
                      <div className="flex-grow">
                        <h2 className="text-gray-900 title-font font-medium">
                          {userDetail != null ? userDetail.account_id : ""}
                        </h2>
                        <p className="text-gray-500">
                          @{userDetail != null ? userDetail.user_name : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetailPage;
