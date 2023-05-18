/* eslint-disable @next/next/no-img-element */
"use client";

import { decrement, increment, reset } from "@/redux/features/counterSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useGetUsersQuery, User } from "@/redux/services.ts/userApi";
import Image from "next/dist/client/image";
import Navbar from "./components/Navbar/Navbar";

export default function Home() {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.counterReducer.value);
  const { isLoading, isFetching, data, error } = useGetUsersQuery(null);

  return (
    <>
      <Navbar />
      <div className='h-full flex justify-center'>
        {/* // <Image src='/hero.jpg' alt='' width={1080} height={1800} /> */}
      </div>
      <main className='max-w-[80%] mx-auto p-4 bg-red'>
        <div className='mb-16 text-center'>
          <h4 className='mb-4'>{count}</h4>
          <button
            className='bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded mr-2'
            onClick={() => dispatch(increment())}
          >
            Increment
          </button>
          <button
            className='bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded mr-2'
            onClick={() => dispatch(decrement())}
          >
            Decrement
          </button>
          <button
            className='bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded'
            onClick={() => dispatch(reset())}
          >
            Reset
          </button>
        </div>
        {error ? (
          <p>Oh no, there was an error</p>
        ) : isLoading || isFetching ? (
          <p>Loading...</p>
        ) : data ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 20,
            }}
          >
            {data.map((user: User) => (
              <div
                key={user.id}
                style={{
                  border: "1px solid #ccc",
                  textAlign: "center",
                }}
              >
                <img
                  src={`https://robohash.org/${user.id}?set=set2&size=180x180`}
                  alt={user.name}
                  style={{ height: 180, width: 180, margin: "auto" }}
                />
                <h3>{user.name}</h3>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </>
  );
}
