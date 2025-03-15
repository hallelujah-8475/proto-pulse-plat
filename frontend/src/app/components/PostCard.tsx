import React from "react";
import Image from "next/image";
import { Post } from "../types/post";
import Link from "next/link";

interface PostCardProps {
  post: Post;
  onDeleteClick: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDeleteClick }) => {
  return (
    <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      <div className="px-4 pb-6">
        <div className="text-center my-4">
          <div className="p-8 max-w-lg border border-gray-300 rounded-2xl hover:shadow-xl hover:shadow-gray-50 flex flex-col items-center">
            <Image
              src={post.post_image_base64 || "/noimage.jpg"}
              className="shadow rounded-lg overflow-hidden border max-h-60 object-contain"
              layout="responsive"
              width={0}
              height={0}
              alt="icon"
            />
            <div className="mt-8">
              <h4 className="font-bold text-xl">{post.title}</h4>
              <p className="mt-2 text-gray-600">{post.content}</p>
              <div className="mt-5">
                <Link
                  href={{
                    pathname: `/post/detail/${post.id}`,
                  }}
                  passHref
                >
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900"
                  >
                    詳細
                  </button>
                </Link>
              </div>
              {post.is_own_post && (
                <div className="inline-flex items-center rounded-md shadow-sm mt-4">
                  <button
                    onClick={() => onDeleteClick(post.id)}
                    className="text-slate-800 hover:text-blue-600 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-r-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
                  >
                    <span>投稿を削除する</span>
                  </button>
                </div>
              )}
              <Image
                src={post.icon_image_base64 || "/noimage.jpg"}
                className="shadow rounded-lg overflow-hidden border mt-4"
                layout="responsive"
                width={0}
                height={0}
                alt="icon"
              />
              <p className="mt-2 text-gray-600">{post.account_id}</p>
              <p className="mt-2 text-gray-600">@{post.user_name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
