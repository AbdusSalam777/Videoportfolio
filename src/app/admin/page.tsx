import UploadForm from "@/components/UploadForm";
import AdminProjectList from "@/components/AdminProjectList";
import ProfileForm from "@/components/ProfileForm";
import GalleryManager from "@/components/GalleryManager";
import LogoutButton from "@/components/LogoutButton";
import { readProjects } from "@/lib/store";
import { readProfile } from "@/lib/profile-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [projects, profile] = await Promise.all([readProjects(), readProfile()]);

  return (
    <div className="px-6 pt-32 pb-20 md:px-12">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl text-white">Admin</h1>
          <LogoutButton />
        </div>

        <ProfileForm profile={profile} />
        <GalleryManager images={profile.gallery} />

        <div>
          <UploadForm />
          <h2 className="mt-10 mb-4 font-heading text-lg text-white">
            Projects ({projects.length})
          </h2>
          <AdminProjectList projects={projects} />
        </div>
      </div>
    </div>
  );
}
