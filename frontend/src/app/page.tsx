"use client";

import React, { useLayoutEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

interface UserProfile {
  name: string;
  screen_name: string;
  profile_image_url_https: string;
}

type User = {
  id: number;
  user_name: string;
  account_id: string;
  icon_url: string;
  created_at: string;
  updated_at: string;
};

type Post = {
  id: number;
  title: string;
  content: string;
  file_name: string;
  file_path: string;
  file_base64: string;
  user_id: number;
  user: User;
  created_at: string;
  updated_at: string;
};

type Paging = {
  total_count: number;
  page: number;
  per_page: number;
};

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [paging, setPaging] = useState<Paging>({
    total_count: 0,
    page: 1,
    per_page: 8,
  });

  // const [error, setError] = useState<string | null>(null);
  const oauth = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const oauthURL = process.env.NEXT_PUBLIC_API_URL + "/oauth";

    if (oauthURL) {
      try {
        const response = await axios.get(oauthURL, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200 && response.data.redirectURL) {
          window.location.href = response.data.redirectURL;
        } else {
          console.error("Redirect URL is not available");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error during OAuth request:", error.message);
        } else {
          console.error("Unexpected error:", error);
        }
      }
    } else {
      console.error("OAuth URL is not defined");
    }
  };

  // const fetchUserProfile = async () => {
  //   try {
  //     const userProfileURL = process.env.NEXT_PUBLIC_API_URL + "/user/profile";

  //     const response = await fetch(userProfileURL, {
  //       method: "GET",
  //       credentials: "include",
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch user profile");
  //     }

  //     const data: UserProfile = await response.json();
  //     setProfile(data);
  //   } catch (error) {
  //     console.error("Error fetching user profile:", error);
  //   }
  // };

  const fetchPosts = async () => {
    const fetchURL = `${process.env.NEXT_PUBLIC_API_URL}/post/list?page=${paging.page}&limit=${paging.per_page}`;

    try {
      const response = await axios.get(fetchURL);

      const data = response.data;
      setPosts(data.posts);
      setPaging({
        total_count: data.total_count,
        page: data.page,
        per_page: data.per_page,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching posts:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const delete_post = async (
    postId: number,
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    event.preventDefault();

    const deleteURL = process.env.NEXT_PUBLIC_API_URL + "/post/delete";
    if (deleteURL) {
      try {
        const response = await axios.post(
          deleteURL,
          { post_id: postId },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error during delete post request:", error.message);
        } else {
          console.error("Unexpected error:", error);
        }
      }
    } else {
      console.error("Delete URL is not defined");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPaging({ ...paging, page: newPage });
    }
  };

  const handleEditClick = async (postId: number) => {
    try {
      const certificationURL =
        process.env.NEXT_PUBLIC_API_URL + "/certification";
      const response = await axios.get(certificationURL, {
        withCredentials: true,
      });

      if (response.status === 200) {
        window.location.href = `/post/edit?post_id=${postId}`;
      } else {
        console.error("Failed to fetch post details");
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  // ローカルストレージからプロファイルを取得する関数
  const loadProfileFromLocalStorage = () => {
    try {
      const profileData = localStorage.getItem("profile");
      if (profileData) {
        const parsedProfile = JSON.parse(profileData) as UserProfile;
        setProfile(parsedProfile);
      } else {
        console.warn("No profile found in localStorage");
      }
    } catch (error) {
      console.error("Error loading profile from localStorage:", error);
    }
  };

  // const testJWT = async () => {
  //   const fetchURL = `${process.env.NEXT_PUBLIC_API_URL}/certification`;

  //   try {
  //     const response = await axios.get(fetchURL, {
  //       withCredentials: true,
  //     });
  //     setProfile(response.data);
  //     alert(profile);
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       console.error("Error fetching certification:", error.message);
  //     } else {
  //       console.error("Unexpected error:", error);
  //     }
  //   }
  // };

  useLayoutEffect(() => {
    // fetchUserProfile();
    loadProfileFromLocalStorage();
    fetchPosts();
  }, [paging.page, paging.per_page]);

  const totalPages = Math.ceil(paging.total_count / paging.per_page);

  return (
    <>
      <Header />
      <div className="h-screen dark:bg-gray-800">
        <div className="py-20 px-6 md:px-12 lg:grid lg:grid-cols-4 lg:gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg"
            >
              <div className="px-4 pb-6">
                <div className="text-center my-4">
                  <div className="p-8 max-w-lg border border-gray-300 rounded-2xl hover:shadow-xl hover:shadow-gray-50 flex flex-col items-center">
                    {/* <Image
                      // src={post.file_path || "/noimage.jpg"}
                      src={post.file_path}
                      className="shadow rounded-lg overflow-hidden border"
                      width={50}
                      height={50}
                      alt="icon"
                    /> */}
                    <img
                      src={post.file_base64}
                      className="shadow rounded-lg overflow-hidden border"
                    />
                    {/* file_path
                    <img
                      src={post.file_path}
                      className="shadow rounded-lg overflow-hidden border"
                    /> */}
                    <div className="mt-8">
                      <h4 className="font-bold text-xl">{post.title}</h4>
                      <p className="mt-2 text-gray-600">{post.content}</p>
                      <div className="mt-5">
                        <a href={`/post/detail?post_id=${post.id}`}>
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900"
                          >
                            詳細
                          </button>
                        </a>
                      </div>
                      {profile &&
                        profile.screen_name === post.user.account_id && (
                          <div className="inline-flex items-center rounded-md shadow-sm mt-4">
                            <a onClick={() => handleEditClick(post.id)}>
                              <button className="text-slate-800 hover:text-blue-600 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-l-lg font-medium px-4 py-2 inline-flex space-x-1 items-center">
                                <span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                    />
                                  </svg>
                                </span>
                                <span className="hidden md:inline-block">
                                  Edit
                                </span>
                              </button>
                            </a>
                            <button className="text-slate-800 hover:text-blue-600 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-r-lg font-medium px-4 py-2 inline-flex space-x-1 items-center">
                              <span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-6 h-6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              </span>
                              <span
                                onClick={(event) => delete_post(post.id, event)}
                                className="hidden md:inline-block"
                              >
                                Delete
                              </span>
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                  <img
                    className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 mx-auto my-4"
                    src={post.user.icon_url}
                    alt=""
                  />
                  <div className="py-2">
                    <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-1">
                      {post.user.user_name}
                    </h3>
                    <div className="inline-flex text-gray-700 dark:text-gray-300 items-center">
                      <span className="me-2 [&>svg]:h-4 [&>svg]:w-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 512 512"
                          className="text-center"
                        >
                          <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
                        </svg>
                      </span>
                      @{post.user.account_id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8 mb-5">
          <ol className="flex list-reset space-x-1">
            {/* Previous Button */}
            <li>
              <button
                onClick={() => {
                  if (paging.page > 1) {
                    handlePageChange(paging.page - 1);
                  }
                }}
                className={`inline-flex items-center justify-center w-8 h-8 border border-gray-100 rounded ${
                  paging.page > 1 ? "" : "opacity-50 cursor-not-allowed"
                }`}
                disabled={paging.page <= 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index}>
                <button
                  onClick={() => handlePageChange(index + 1)}
                  className={`block w-8 h-8 text-center border border-gray-100 rounded leading-8 ${
                    paging.page === index + 1
                      ? "text-white bg-blue-600 border-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}

            {/* Next Button */}
            <li>
              <button
                onClick={() => {
                  if (paging.page < totalPages) {
                    handlePageChange(paging.page + 1);
                  }
                }}
                className={`inline-flex items-center justify-center w-8 h-8 border border-gray-100 rounded ${
                  paging.page < totalPages
                    ? ""
                    : "opacity-50 cursor-not-allowed"
                }`}
                disabled={paging.page >= totalPages}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          </ol>
        </div>
        <Footer />
      </div>
    </>
  );
}
