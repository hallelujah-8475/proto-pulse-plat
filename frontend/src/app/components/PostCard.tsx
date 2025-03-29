import Image from "next/image";
import { Post } from "../types/post";
import Link from "next/link";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <>
      <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
        <div className="px-4 pb-6">
          <div className="text-center my-4">
            <div className="p-8 max-w-lg border border-gray-300 rounded-2xl hover:shadow-xl hover:shadow-gray-50 flex flex-col items-center">
              <Link
                href={{
                  pathname: `/post/detail/${post.id}`,
                  query: {
                    user_id: post.user_id,
                  },
                }}
              >
                <div className="w-[250px] h-[250px] relative">
                  <Image
                    src={post.post_image_base64 || "/noimage.jpg"}
                    alt="icon"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg border"
                  />
                </div>
              </Link>
              <div className="mt-8">
                <Link
                  href={{
                    pathname: `/post/detail/${post.id}`,
                    query: { user_id: post.user_id },
                  }}
                >
                  <h4 className="font-bold text-l">{post.title}</h4>
                  <p className="mt-2 text-gray-600">呪術廻戦</p>
                  <p className="mt-2 text-gray-600">東京都渋谷区</p>
                  <p className="mt-2 text-gray-600">2025/03/23 掲載</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostCard;
