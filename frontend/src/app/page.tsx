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
      </div>
    </>
  )
}
