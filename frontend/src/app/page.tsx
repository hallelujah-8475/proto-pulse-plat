"use client";

import React, { useLayoutEffect, useState } from 'react';

interface UserProfile {
  name: string;
  screen_name: string;
  profile_image_url_https: string;
}

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const oauth = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  
    const oauthURL = process.env.NEXT_PUBLIC_API_URL + '/oauth';
    if (oauthURL) {
      try {
        const response = await fetch(oauthURL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`OAuth request failed: ${response.statusText}`);
        }
  
        const data = await response.json();
        if (data.redirectURL) {
          window.location.href = data.redirectURL;
        } else {
            console.error("Redirect URL is not available");
        }
      } catch (error) {
        console.error("Error during OAuth request:", error);
      }
    } else {
      console.error("OAuth URL is not defined");
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userProfileURL = process.env.NEXT_PUBLIC_API_URL + '/user/profile';

      const response = await fetch(userProfileURL, {
        method: 'GET',
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
  
      const data: UserProfile = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useLayoutEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <>
      <header className="text-gray-600 body-font">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="ml-3 text-xl">Tailblocks</span>
          </a>
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          </nav>
          <button
          type="button"
          onClick={oauth}
          data-twe-ripple-init
          data-twe-ripple-color="light"
          className="mb-2 flex rounded bg-[#1da1f2] px-6 py-2.5 text-xs font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg">
            <span className="me-2 [&>svg]:h-4 [&>svg]:w-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 512 512"
                className='text-center'>
                <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
              </svg>
            </span>
            Twitter
          </button>
        </div>
      </header>
      <div className="h-screen dark:bg-gray-800">
        <div className="py-20 px-6 md:px-12 lg:grid lg:grid-cols-4 lg:gap-8">
          {profile ? (
          <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <div className="border-b px-4 pb-6">
                <div className="text-center my-4">
                  <a className="p-8 max-w-lg border border-gray-300 rounded-2xl hover:shadow-xl hover:shadow-gray-50 flex flex-col items-center"
                      href="#">
                      <img src="https://loremflickr.com/800/600/girl" className="shadow rounded-lg overflow-hidden border" />
                      <div className="mt-8">
                          <h4 className="font-bold text-xl">Exercises</h4>
                          <p className="mt-2 text-gray-600">Create Exercises for any subject with the topics you and your students care about.
                          </p>
                          <div className="mt-5">
                              <button type="button" className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900">Start Creating</button>
                          </div>
                      </div>
                  </a>
                  <img className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 mx-auto my-4" src={profile.profile_image_url_https.replace("_normal", "_bigger")} alt=""/>
                  <div className="py-2">
                      <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-1">
                        {profile.name}
                      </h3>
                      <div className="inline-flex text-gray-700 dark:text-gray-300 items-center">
                          <span className="me-2 [&>svg]:h-4 [&>svg]:w-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 512 512"
                              className='text-center'>
                              <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
                            </svg>
                          </span>
                          @{profile.screen_name}
                      </div>
                  </div>
                </div>
            </div>
          </div>
          ) : (
            <p>Loading...</p>
          )}
          {profile ? (
          <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <div className="border-b px-4 pb-6">
                <div className="text-center my-4">
                  <a className="p-8 max-w-lg border border-gray-300 rounded-2xl hover:shadow-xl hover:shadow-gray-50 flex flex-col items-center"
                      href="#">
                      <img src="https://loremflickr.com/800/600/girl" className="shadow rounded-lg overflow-hidden border" />
                      <div className="mt-8">
                          <h4 className="font-bold text-xl">Exercises</h4>
                          <p className="mt-2 text-gray-600">Create Exercises for any subject with the topics you and your students care about.
                          </p>
                          <div className="mt-5">
                              <button type="button" className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900">Start Creating</button>
                          </div>
                      </div>
                  </a>
                  <img className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 mx-auto my-4" src={profile.profile_image_url_https.replace("_normal", "_bigger")} alt=""/>
                  <div className="py-2">
                      <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-1">
                        {profile.name}
                      </h3>
                      <div className="inline-flex text-gray-700 dark:text-gray-300 items-center">
                          <span className="me-2 [&>svg]:h-4 [&>svg]:w-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 512 512"
                              className='text-center'>
                              <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
                            </svg>
                          </span>
                          @{profile.screen_name}
                      </div>
                  </div>
                </div>
            </div>
          </div>
          ) : (
            <p>Loading...</p>
          )}
          {profile ? (
          <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <div className="border-b px-4 pb-6">
                <div className="text-center my-4">
                  <a className="p-8 max-w-lg border border-gray-300 rounded-2xl hover:shadow-xl hover:shadow-gray-50 flex flex-col items-center"
                      href="#">
                      <img src="https://loremflickr.com/800/600/girl" className="shadow rounded-lg overflow-hidden border" />
                      <div className="mt-8">
                          <h4 className="font-bold text-xl">Exercises</h4>
                          <p className="mt-2 text-gray-600">Create Exercises for any subject with the topics you and your students care about.
                          </p>
                          <div className="mt-5">
                              <button type="button" className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900">Start Creating</button>
                          </div>
                      </div>
                  </a>
                  <img className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 mx-auto my-4" src={profile.profile_image_url_https.replace("_normal", "_bigger")} alt=""/>
                  <div className="py-2">
                      <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-1">
                        {profile.name}
                      </h3>
                      <div className="inline-flex text-gray-700 dark:text-gray-300 items-center">
                          <span className="me-2 [&>svg]:h-4 [&>svg]:w-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 512 512"
                              className='text-center'>
                              <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
                            </svg>
                          </span>
                          @{profile.screen_name}
                      </div>
                  </div>
                </div>
            </div>
          </div>
          ) : (
            <p>Loading...</p>
          )}
          {profile ? (
          <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <div className="border-b px-4 pb-6">
                <div className="text-center my-4">
                  <a className="p-8 max-w-lg border border-gray-300 rounded-2xl hover:shadow-xl hover:shadow-gray-50 flex flex-col items-center"
                      href="#">
                      <img src="https://loremflickr.com/800/600/girl" className="shadow rounded-lg overflow-hidden border" />
                      <div className="mt-8">
                          <h4 className="font-bold text-xl">Exercises</h4>
                          <p className="mt-2 text-gray-600">Create Exercises for any subject with the topics you and your students care about.
                          </p>
                          <div className="mt-5">
                              <button type="button" className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900">Start Creating</button>
                          </div>
                      </div>
                  </a>
                  <img className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 mx-auto my-4" src={profile.profile_image_url_https.replace("_normal", "_bigger")} alt=""/>
                  <div className="py-2">
                      <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-1">
                        {profile.name}
                      </h3>
                      <div className="inline-flex text-gray-700 dark:text-gray-300 items-center">
                          <span className="me-2 [&>svg]:h-4 [&>svg]:w-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 512 512"
                              className='text-center'>
                              <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
                            </svg>
                          </span>
                          @{profile.screen_name}
                      </div>
                  </div>
                </div>
            </div>
          </div>
          ) : (
            <p>Loading...</p>
          )}
          {profile ? (
          <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <div className="border-b px-4 pb-6">
                <div className="text-center my-4">
                  <a className="p-8 max-w-lg border border-gray-300 rounded-2xl hover:shadow-xl hover:shadow-gray-50 flex flex-col items-center"
                      href="#">
                      <img src="https://loremflickr.com/800/600/girl" className="shadow rounded-lg overflow-hidden border" />
                      <div className="mt-8">
                          <h4 className="font-bold text-xl">Exercises</h4>
                          <p className="mt-2 text-gray-600">Create Exercises for any subject with the topics you and your students care about.
                          </p>
                          <div className="mt-5">
                              <button type="button" className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900">Start Creating</button>
                          </div>
                      </div>
                  </a>
                  <img className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 mx-auto my-4" src={profile.profile_image_url_https.replace("_normal", "_bigger")} alt=""/>
                  <div className="py-2">
                      <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-1">
                        {profile.name}
                      </h3>
                      <div className="inline-flex text-gray-700 dark:text-gray-300 items-center">
                          <span className="me-2 [&>svg]:h-4 [&>svg]:w-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 512 512"
                              className='text-center'>
                              <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
                            </svg>
                          </span>
                          @{profile.screen_name}
                      </div>
                  </div>
                </div>
            </div>
          </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <footer className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-900/5 py-10"><svg className="mx-auto h-5 w-auto text-slate-900" aria-hidden="true"
                viewBox="0 0 160 24" fill="none">
                <path
                    d="M18.724 1.714c-4.538 0-7.376 2.286-8.51 6.857 1.702-2.285 3.687-3.143 5.957-2.57 1.296.325 2.22 1.271 3.245 2.318 1.668 1.706 3.6 3.681 7.819 3.681 4.539 0 7.376-2.286 8.51-6.857-1.701 2.286-3.687 3.143-5.957 2.571-1.294-.325-2.22-1.272-3.245-2.32-1.668-1.705-3.6-3.68-7.819-3.68zM10.214 12c-4.539 0-7.376 2.286-8.51 6.857 1.701-2.286 3.687-3.143 5.957-2.571 1.294.325 2.22 1.272 3.245 2.32 1.668 1.705 3.6 3.68 7.818 3.68 4.54 0 7.377-2.286 8.511-6.857-1.702 2.286-3.688 3.143-5.957 2.571-1.295-.326-2.22-1.272-3.245-2.32-1.669-1.705-3.6-3.68-7.82-3.68z"
                    className="fill-sky-400"></path>
                <path
                    d="M51.285 9.531V6.857h-3.166v-3.6l-2.758.823v2.777h-2.348v2.674h2.348v6.172c0 3.343 1.686 4.526 5.924 4.011V17.22c-2.094.103-3.166.129-3.166-1.517V9.53h3.166zm12.087-2.674v1.826c-.97-1.337-2.476-2.16-4.468-2.16-3.472 0-6.357 2.931-6.357 6.763 0 3.805 2.885 6.763 6.357 6.763 1.992 0 3.498-.823 4.468-2.186v1.851h2.758V6.857h-2.758zM59.338 17.4c-2.297 0-4.034-1.723-4.034-4.114 0-2.392 1.736-4.115 4.034-4.115s4.034 1.723 4.034 4.115c0 2.391-1.736 4.114-4.034 4.114zM70.723 4.929c.97 0 1.762-.823 1.762-1.775 0-.977-.792-1.774-1.762-1.774s-1.762.797-1.762 1.774c0 .952.792 1.775 1.762 1.775zm-1.379 14.785h2.758V6.857h-2.758v12.857zm5.96 0h2.757V.943h-2.758v18.771zM95.969 6.857l-2.502 8.872-2.655-8.872h-2.63L85.5 15.73l-2.477-8.872h-2.91l4.008 12.857h2.707l2.68-8.665 2.656 8.665h2.706L98.88 6.857h-2.911zm6.32-1.928c.97 0 1.762-.823 1.762-1.775 0-.977-.792-1.774-1.762-1.774s-1.762.797-1.762 1.774c0 .952.792 1.775 1.762 1.775zm-1.379 14.785h2.758V6.857h-2.758v12.857zm12.674-13.191c-1.736 0-3.115.643-3.957 1.98V6.857h-2.758v12.857h2.758v-6.891c0-2.623 1.43-3.703 3.242-3.703 1.737 0 2.86 1.029 2.86 2.983v7.611h2.757V11.82c0-3.343-2.042-5.297-4.902-5.297zm17.982-4.809v6.969c-.971-1.337-2.477-2.16-4.468-2.16-3.473 0-6.358 2.931-6.358 6.763 0 3.805 2.885 6.763 6.358 6.763 1.991 0 3.497-.823 4.468-2.186v1.851h2.757v-18h-2.757zM127.532 17.4c-2.298 0-4.034-1.723-4.034-4.114 0-2.392 1.736-4.115 4.034-4.115 2.297 0 4.034 1.723 4.034 4.115 0 2.391-1.737 4.114-4.034 4.114z"
                    fill="currentColor"></path>
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M145.532 3.429h8.511c.902 0 1.768.36 2.407 1.004.638.643.997 1.515.997 2.424v8.572c0 .909-.359 1.781-.997 2.424a3.394 3.394 0 01-2.407 1.004h-8.511a3.39 3.39 0 01-2.407-1.004 3.438 3.438 0 01-.997-2.424V6.857c0-.91.358-1.781.997-2.424a3.39 3.39 0 012.407-1.004zm-5.106 3.428c0-1.364.538-2.672 1.495-3.636a5.09 5.09 0 013.611-1.507h8.511c1.354 0 2.653.542 3.61 1.507a5.16 5.16 0 011.496 3.636v8.572a5.16 5.16 0 01-1.496 3.636 5.086 5.086 0 01-3.61 1.506h-8.511a5.09 5.09 0 01-3.611-1.506 5.164 5.164 0 01-1.495-3.636V6.857zm10.907 6.251c0 1.812-1.359 2.916-3.193 2.916-1.823 0-3.182-1.104-3.182-2.916v-5.65h1.633v5.52c0 .815.429 1.427 1.549 1.427 1.12 0 1.549-.612 1.549-1.428v-5.52h1.644v5.652zm1.72 2.748V7.457h1.644v8.4h-1.644z"
                    fill="currentColor"></path>
            </svg>
            <p className="mt-5 text-center text-sm leading-6 text-slate-500">© 2022 Tailwind Labs Inc. All rights reserved.</p>
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm font-semibold leading-6 text-slate-700"><a
                    href="/privacy-policy">Privacy policy</a>
                <div className="h-4 w-px bg-slate-500/20"></div><a href="/changelog">Changelog</a>
            </div>
        </div>
    </footer>
      </div>
    </>
  )
}
