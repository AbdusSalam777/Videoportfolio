import UploadForm from "@/components/UploadForm";
import AdminProjectList from "@/components/AdminProjectList";
import LogoutButton from "@/components/LogoutButton";
import { readProjects } from "@/lib/store";

export default async function AdminPage() {
  const projects = await readProjects();

  return (
    <div className="px-6 pt-32 pb-20 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-3xl text-white">Admin</h1>
          <LogoutButton />
        </div>

        <UploadForm />

        <h2 className="mt-10 mb-4 font-heading text-lg text-white">
          Projects ({projects.length})
        </h2>
        <AdminProjectList projects={projects} />
      </div>
    </div>
  );
}
