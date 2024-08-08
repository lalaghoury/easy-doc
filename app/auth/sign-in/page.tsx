"use client";

// Importing the SignInForm component from the @/components/auth directory
import SignInForm from "@/components/auth/SignInForm";

// Exporting a default function named SignInPage
// This function returns a JSX element which is an instance of the SignInForm component
export default function SignInPage() {
  return <SignInForm />; // Rendering the SignInForm component
}
