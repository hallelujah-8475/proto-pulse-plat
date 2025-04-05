export type Post = {
  id: number;
  title: string;
  content: string;
  content_title: string;
  location: string;
  post_image_base64: string;
  user_name: string;
  account_id: string;
  icon_image_base64: string;
  is_own_post: boolean;
  user_id: number;
  created_at: string;
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
  content_title: string;
  location: string;
};
