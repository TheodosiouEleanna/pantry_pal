import Image from "next/image";
import React from "react";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const menuItems = ["Ingredients", "Meals", "My Meals", "My Grocery List "];
const Navbar = () => {
  return (
    <nav className='navbar bg-transparent flex items-center justify-between px-32 py-8'>
      <div className='navbar__left flex items-center'>
        <Image
          src='/logo2.png'
          alt='Logo'
          className='navbar__logo px-4 py-1'
          width={300}
          height={40}
        />
        <div className='navbar__menu flex '>
          {menuItems.map((menuItem, index) => (
            <div
              className='navbar__menu-item uppercase pl-8 text-gray-800 font-bold hover:text-green-600'
              key={index}
            >
              <a href='#'>{menuItem}</a>
            </div>
          ))}
        </div>
      </div>
      <div className='navbar__right flex items-center'>
        <div className='navbar__user flex items-center mr-4'>
          <button className='navbar__profile bg-transparent border-none mr-2 uppercase pl-8 text-gray-800 font-bold hover:text-green-600'>
            <FontAwesomeIcon icon={faUser} className='pr-2' />
            John Doe
          </button>
        </div>
        <button className='bg-transparent border border-green-600 px-4 py-2 uppercase text-gray-800 font-bold hover:text-green-600 mr-2'>
          Sign In
        </button>
        <button className='bg-transparent border border-green-600 px-4 py-2 uppercase text-gray-800 font-bold hover:text-green-600'>
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
