"use client";
import { useRef } from "react";
import Image from "next/image";
import { getProviders, getSession, signIn } from "next-auth/react";

const SignInPage = ({ providers }) => {
  const email = useRef("");
  const password = useRef("");
  return (
    <>
      <div className='flex justify-center items-center flex-col min-h-screen p-4 bg-[#272726] '>
        <div className='flex items-center h-[15vh]'>
          <Image
            src='/logo2.png'
            alt='Logo'
            className='navbar__logo px-4 py-1'
            width={300}
            height={40}
          />
        </div>
        <div className='flex flex-col overflow-hidden bg-white rounded-md shadow-lg max lg:max-w-screen-xl'>
          <div className='py-10 px-20 bg-white md:flex-1'>
            <h3 className='my-4 text-2xl font-semibold text-green-600'>
              Login
            </h3>
            <form action='#' className='flex flex-col space-y-5'>
              <div className='flex flex-col space-y-1'>
                <label
                  htmlFor='email'
                  className='text-sm font-semibold text-gray-500'
                >
                  Email address
                </label>
                <input
                  type='email'
                  id='email'
                  autoFocus
                  className='px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200'
                  onChange={(e) => (email.current = e.target.value)}
                />
              </div>
              <div className='flex flex-col space-y-1'>
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='password'
                    className='text-sm font-semibold text-gray-500'
                  >
                    Password
                  </label>
                  <a
                    href='#'
                    className='text-sm text-blue-600 hover:underline focus:text-blue-800'
                  >
                    Forgot Password?
                  </a>
                </div>
                <input
                  type='password'
                  id='password'
                  className='px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200'
                  onChange={(e) => (password.current = e.target.value)}
                />
              </div>
              <div>
                <button
                  type='button'
                  className='w-full px-4 py-2 text-lg font-semibold text-white transition-colors duration-300 bg-green-500 rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-blue-200 focus:ring-4'
                  onClick={() =>
                    signIn("credentials", {
                      email: email.current,
                      password: password.current,
                    })
                  }
                >
                  Log in
                </button>
              </div>
              <div>
                <p className='flex flex-col items-center justify-center mt-10 text-center'>
                  <span>Don't have an account?</span>
                  <a href='#' className='underline hover:text-green-600'>
                    Get Started!
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;

export async function getServerSideProps(context) {
  const { req } = context;
  const session = await getSession({ req });
  const providers = await getProviders();
  if (session) {
    return {
      redirect: { destination: "/" },
    };
  }
  return {
    props: {
      providers,
    },
  };
}
