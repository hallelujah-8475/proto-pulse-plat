// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Header } from "../../components/Header";
// import { Footer } from "../../components/Footer";

// const EditPostPage: React.FC = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const postId = searchParams.get("post_id");

//   const [formData, setFormData] = useState({
//     title: "",
//     content: "",
//     file: null as File | null,
//   });
//   const [isConfirming, setIsConfirming] = useState(false);
//   const [errors, setErrors] = useState({
//     title: "",
//     content: "",
//     file: "",
//   });

//   useEffect(() => {
//     const fetchPostData = async () => {
//       const post_URL = `${process.env.NEXT_PUBLIC_API_URL}/post/get?post_id=${postId}`;
//       try {
//         const response = await fetch(post_URL);
//         if (response.ok) {
//           const post = await response.json();
//           setFormData({
//             title: post.title,
//             content: post.content,
//             file: null,
//           });
//         } else {
//           console.error("Failed to load post data");
//         }
//       } catch (error) {
//         console.error("Error loading post data:", error);
//       }
//     };

//     if (postId) {
//       fetchPostData();
//     }
//   }, [postId]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, title: e.target.value });
//   };

//   const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setFormData({ ...formData, content: e.target.value });
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setFormData({ ...formData, file: e.target.files[0] });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = { title: "", content: "", file: "" };

//     if (!formData.title.trim()) {
//       newErrors.title = "タイトルは必須です";
//     }

//     if (!formData.content.trim()) {
//       newErrors.content = "投稿内容は必須です";
//     }

//     if (formData.file && formData.file.size > 5 * 1024 * 1024) {
//       newErrors.file = "ファイルサイズは5MB以下でなければなりません";
//     }

//     setErrors(newErrors);

//     return !newErrors.title && !newErrors.content && !newErrors.file;
//   };

//   const handleConfirm = () => {
//     if (validateForm()) {
//       setIsConfirming(true);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const data = new FormData();
//     data.append("title", formData.title);
//     data.append("content", formData.content);

//     if (formData.file) {
//       data.append("file", formData.file);
//       data.append("file_name", formData.file.name);
//     }

//     const edit_post_URL = `${process.env.NEXT_PUBLIC_API_URL}/post/edit?post_id=${postId}`;
//     if (edit_post_URL) {
//       try {
//         const response = await fetch(edit_post_URL, {
//           method: "PUT",
//           body: data,
//         });

//         if (response.ok) {
//           console.log("Post successfully edited!");
//           router.push("/post/complete");
//         } else {
//           console.error("Failed to edit post");
//         }
//       } catch (error) {
//         console.error("Error submitting form:", error);
//       }
//     }
//   };

//   const goBack = () => {
//     setIsConfirming(false);
//   };

//   return (
//     <>
//       <Header />
//       <div className="h-screen dark:bg-gray-800">
//         <div className="max-w-xl mt-20 mx-auto">
//           {isConfirming ? (
//             <div className="p-5">
//               <h2 className="text-lg font-bold mb-4">確認ページ</h2>
//               <p className="mb-2">タイトル:</p>
//               <p className="border p-3 mb-4">
//                 {formData.title || "タイトルがありません"}
//               </p>
//               <p className="mb-2">投稿内容:</p>
//               <p className="border p-3 mb-4">
//                 {formData.content || "内容がありません"}
//               </p>
//               {formData.file && (
//                 <div className="mb-4">
//                   <p className="mb-2">ファイル:</p>
//                   <p className="border p-3">{formData.file.name}</p>
//                 </div>
//               )}
//               <div className="flex justify-between">
//                 <button
//                   onClick={goBack}
//                   className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
//                 >
//                   戻る
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   className="bg-indigo-600 hover:bg-indigo-400 text-white py-2 px-4 rounded"
//                 >
//                   更新
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleConfirm();
//               }}
//             >
//               <div className="w-full px-3">
//                 <label
//                   className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
//                   htmlFor="title"
//                 >
//                   タイトル
//                 </label>
//                 <input
//                   id="title"
//                   className={`appearance-none block w-full bg-gray-200 text-gray-700 border ${
//                     errors.title ? "border-red-500" : "border-gray-200"
//                   } rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500`}
//                   value={formData.title}
//                   onChange={handleInputChange}
//                 />
//                 {errors.title && (
//                   <p className="text-red-500 text-xs italic">{errors.title}</p>
//                 )}
//                 <label
//                   className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
//                   htmlFor="content"
//                 >
//                   投稿内容
//                 </label>
//                 <textarea
//                   id="content"
//                   className={`appearance-none block w-full bg-gray-200 text-gray-700 border ${
//                     errors.content ? "border-red-500" : "border-gray-200"
//                   } rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500`}
//                   value={formData.content}
//                   onChange={handleTextAreaChange}
//                 />
//                 {errors.content && (
//                   <p className="text-red-500 text-xs italic">
//                     {errors.content}
//                   </p>
//                 )}
//               </div>
//               <input
//                 className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
//                 id="file_input"
//                 type="file"
//                 onChange={handleFileChange}
//               />
//               {errors.file && (
//                 <p className="text-red-500 text-xs italic">{errors.file}</p>
//               )}
//               <div className="flex justify-end w-full px-3 mt-5">
//                 <button
//                   className="shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded"
//                   type="button"
//                   onClick={handleConfirm}
//                 >
//                   確認
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default EditPostPage;
