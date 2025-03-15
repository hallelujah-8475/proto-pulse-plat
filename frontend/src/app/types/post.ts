export type UserProfile = {
  id: number;
  name: string;
  screen_name: string;
  profile_image_url_https: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  post_image_base64: string;
  user_name: string;
  account_id: string;
  icon_image_base64: string;
  is_own_post: boolean;
};

export type PostDetail = {
  id: number;
  title: string;
  content: string;
  post_images_base64: string[];
};

export type Paging = {
  total_count: number;
  page: number;
  per_page: number;
};

export type PostFormData = {
  title: string;
  content: string;
  file: FileList;
};
