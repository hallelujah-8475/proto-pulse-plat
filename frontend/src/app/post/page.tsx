"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";

type FormData = {
  title: string;
  content: string;
  file: FileList;
};

const PostPage: React.FC = () => {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (errors.title || errors.content || !data.file?.length) {
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
    data.append("file", values.file[0]);
    data.append("filename", values.file[0].name);

    const add_post_URL = process.env.NEXT_PUBLIC_API_URL + "/post/add";
    try {
      const response = await fetch(add_post_URL!, {
        method: "POST",
        body: data,
      });
      if (response.ok) {
        router.push("/post/complete");
      } else {
        console.error("Failed to add post");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const goBack = () => {
    setIsConfirming(false);
  };

  return (
    <div className="h-screen dark:bg-gray-800">
      <div className="max-w-xl mt-20 mx-auto">
        {isConfirming ? (
          <div className="p-5">
            <h2 className="text-lg font-bold mb-4">確認ページ</h2>
            <p className="mb-2">タイトル:</p>
            <p className="border p-3 mb-4">
              {getValues("title") || "タイトルがありません"}
            </p>
            <p className="mb-2">投稿内容:</p>
            <p className="border p-3 mb-4">
              {getValues("content") || "内容がありません"}
            </p>
            <p className="border p-3">
              {getValues("file")?.[0]?.name || "ファイルなし"}
            </p>

            <div className="flex justify-between">
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
                {...register("file", {
                  required: "ファイルを選択してください",
                })}
                className="block w-full text-sm text-gray-900 border rounded-lg bg-gray-50 cursor-pointer"
              />
              {errors.file && (
                <p className="text-red-500">ファイルを選択してください</p>
              )}
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
  );
};

export default PostPage;
