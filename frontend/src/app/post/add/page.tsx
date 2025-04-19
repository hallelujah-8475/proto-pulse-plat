"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { PostFormData } from "../../types/post";

const PostPage: React.FC = () => {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<PostFormData>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const onSubmit: SubmitHandler<PostFormData> = (data) => {
    const files = getValues("file");
    if (errors.title || errors.content || !files || data.file.length === 0) {
      setErrorMessage("ファイルを選択してください");
      return;
    }
    setIsConfirming(true);
  };

  const handleFinalSubmit = async () => {
    const values = getValues();
    const data = new FormData();
    data.append("title", values.title);
    data.append("content", values.content);
    data.append("content_title", values.content_title);
    data.append("location", values.location);

    Array.from(values.file).forEach((file) => {
      data.append("files[]", file);
    });

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/post/add",
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        router.push("/post/complete");
      }
    } catch (error) {
      console.log(error);
      alert(
        "セッションの有効期限が切れています。\nもう一度ログインしてやり直してください。"
      );
      router.push("/");
    }
  };

  const goBack = () => {
    setIsConfirming(false);
  };

  return (
    <>
      <div className="min-h-screen dark:bg-gray-800">
        <div className="max-w-xl mt-20 mx-auto">
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
              <li className="inline-flex items-center">
                <a
                  href="/"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3 me-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                  </svg>
                  Home
                </a>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <span className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">
                    投稿
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          {isConfirming ? (
            <div className="p-5">
              <h2 className="text-lg font-bold mb-4">確認ページ</h2>
              <p className="mb-2">タイトル:</p>
              <p className="border p-3 mb-4 border-none">
                {getValues("title") || "タイトルがありません"}
              </p>
              <p className="mb-2">コンテンツ名:</p>
              <p className="border p-3 mb-4 border-none">
                {getValues("content_title") || "コンテンツ名がありません"}
              </p>
              <p className="mb-2">取引場所:</p>
              <p className="border p-3 mb-4 border-none">
                {getValues("location") || "取引場所がありません"}
              </p>
              <p className="mb-2">投稿内容:</p>
              <p className="border p-3 mb-4 border-none">
                {getValues("content") || "内容がありません"}
              </p>
              <p className="mb-2">選択した画像:</p>
              <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    alt={`Preview ${index}`}
                    className="border w-full h-20 object-cover"
                    layout="responsive"
                    width={0}
                    height={0}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <button
                  onClick={goBack}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
                >
                  戻る
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="bg-indigo-600 hover:bg-indigo-400 text-white py-2 px-4 rounded"
                >
                  送信
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full px-3">
              <div>
                <label
                  className="block text-gray-700 text-xs font-bold mb-2"
                  htmlFor="title"
                >
                  タイトル
                </label>
                <input
                  {...register("title", {
                    required: "タイトルを入力してください",
                  })}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                />
                {errors.title && (
                  <p className="text-red-500">{errors.title.message}</p>
                )}
              </div>
              <div>
                <label
                  className="block text-gray-700 text-xs font-bold mb-2"
                  htmlFor="content_title"
                >
                  コンテンツ名
                </label>
                <input
                  {...register("content_title", {
                    required: "コンテンツ名を入力してください",
                  })}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                />
                {errors.content_title && (
                  <p className="text-red-500">{errors.content_title.message}</p>
                )}
              </div>
              <div>
                <label
                  className="block text-gray-700 text-xs font-bold mb-2"
                  htmlFor="location"
                >
                  取引場所
                </label>
                <input
                  {...register("location", {
                    required: "取引場所を入力してください",
                  })}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                />
                {errors.location && (
                  <p className="text-red-500">{errors.location.message}</p>
                )}
              </div>
              <div>
                <label
                  className="block text-gray-700 text-xs font-bold mb-2"
                  htmlFor="content"
                >
                  投稿内容
                </label>
                <textarea
                  {...register("content", {
                    required: "投稿内容を入力してください",
                  })}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                />
                {errors.content && (
                  <p className="text-red-500">{errors.content.message}</p>
                )}
              </div>
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  {...register("file", {
                    required: "ファイルを選択してください",
                  })}
                  className="block w-full text-sm text-gray-900 border rounded-lg bg-gray-50 cursor-pointer"
                  onChange={handleFileChange}
                />
                {errors.file && (
                  <p className="text-red-500">ファイルを選択してください</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {previewUrls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    alt={`Preview ${index}`}
                    className="border w-full h-20 object-cover"
                    layout="responsive"
                    width={0}
                    height={0}
                  />
                ))}
              </div>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <div className="flex justify-end w-full px-3 mt-5">
                <button
                  className="shadow bg-indigo-600 hover:bg-indigo-400 text-white font-bold py-2 px-6 rounded"
                  type="submit"
                >
                  確認
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default PostPage;
