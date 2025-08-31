export default function HomePage() {
  // This page uses a meta refresh tag to redirect users to the login page.
  // This is a robust method that does not depend on Next.js server-side imports
  // which were causing the compilation error.
  return (
    <head>
      <meta http-equiv="refresh" content="0; url=/login" />
    </head>
  );
}

