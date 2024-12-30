import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { SignedIn, SignedOut, SignInButton, SignOutButton, SignUpButton, UserButton } from '@clerk/remix';
import { NavLink } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Customs Auth Buttons which override the original styles keeping the functionalities same:
export function CustomSignOutButton() {
  return (
    <SignOutButton>
      <button className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
        Sign Out
      </button>
    </SignOutButton>
  );
}
export function CustomSignInButton() {
  return (
    <SignInButton mode="modal">
      <button className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
        Sign In
      </button>
    </SignInButton>
  );
}
export function CustomSignUpButton() {
  return (
    <SignUpButton mode="modal">
      <button className="px-4 hidden sm:block py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
        Sign Up
      </button>
    </SignUpButton>
  );
}
export function CustomUserButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#2D3343] transition-colors duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-10 h-10 rounded-full',
              userButtonPopoverCard: 'bg-white shadow-lg rounded-md border border-gray-200',
              userButtonPopoverActions: 'p-2',
              userButtonPopoverActionButton:
                'w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md transition-colors duration-200',
            },
          }}
        />
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 w-56 mt-1 origin-top-right rounded-md shadow-lg bg-[#1C2333] ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <NavLink
              to="#profile"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2D3343] hover:text-white transition-colors duration-200"
              role="menuitem"
            >
              Profile
            </NavLink>
            <CustomSignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames('flex items-center p-5 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="w-full flex items-center justify-between gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="flex gap-1 items-center justify-center">
          <div className="i-ph:sidebar-simple-duotone text-xl" />
          <a href="/" className="text-2xl font-semibold text-accent flex items-center">
            {/* <span className="i-bolt:logo-text?mask w-[46px] inline-block" /> */}
            <img src="/logo-light-styled.png" alt="logo" className="w-[90px] inline-block dark:hidden" />
            <img src="/logo-dark-styled.png" alt="logo" className="w-[90px] inline-block hidden dark:block" />
          </a>
        </div>
        <div className="flex gap-2 items-center justify-center">
          <SignedIn>
            {/* <CustomUserButton /> */}
            <UserButton />
            {/* <CustomSignOutButton /> */}
          </SignedIn>
          <SignedOut>
            <CustomSignUpButton />
            <CustomSignInButton />
          </SignedOut>
        </div>
      </div>
      {chat.started && ( // Display ChatDescription and HeaderActionButtons only when the chat has started.
        <>
          <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        </>
      )}
    </header>
  );
}
