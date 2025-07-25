export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white mt-12">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-slate-500">
          &copy; {currentYear} Sistem Informasi Personalia. All rights reserved.
        </p>
      </div>
    </footer>
  );
}