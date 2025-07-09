"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SignedOut, SignIn, SignUp } from "@clerk/nextjs";

const Auth = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden max-[924px]:p-8 max-[600px]:p-4">
        <div className="fixed inset-0 -z-10 blur-[20px] pointer-events-none bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20"></div>
        <div className="fixed inset-0 -z-10 blur-[20px] pointer-events-none bg-gradient-to-l from-cyan-500/15 via-blue-500/15 to-indigo-500/15"></div>

        <div className="bg-white/10 p-12 rounded-2xl flex justify-center items-center w-full max-w-[800px] max-[924px]:w-full max-[600px]:p-8">
          <AuthHandler />
        </div>
      </div>
    </Suspense>
  );
};

const AuthHandler = () => {
  const searchParams = useSearchParams();
  const isSignUp = searchParams.get("mode") === "sign-up";

  return (
    <SignedOut>
      {isSignUp ? (
        <SignUp
          routing="hash"
          signInUrl="/auth?mode=sign-in"
          forceRedirectUrl="/"
        />
      ) : (
        <SignIn
          routing="hash"
          signUpUrl="/auth?mode=sign-up"
          forceRedirectUrl="/"
        />
      )}
    </SignedOut>
  );
};

export default Auth;
