import UploadForm from "@/components/UploadForm";
import AdminProjectList from "@/components/AdminProjectList";
import ProfileForm from "@/components/ProfileForm";
import GalleryManager from "@/components/GalleryManager";
import TestimonialManager from "@/components/TestimonialManager";
import CompanyManager from "@/components/CompanyManager";
import LogoutButton from "@/components/LogoutButton";
import { readProjects } from "@/lib/store";
import { readProfile } from "@/lib/profile-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [projects, profile] = await Promise.all([readProjects(), readProfile()]);

  return (
    <div className="px-6 pt-32 pb-20 md:px-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl text-white">Admin</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Everything here updates the public site immediately.
            </p>
          </div>
          <LogoutButton />
        </div>

        <ProfileForm profile={profile} />

        <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <div>
            <h2 className="font-heading text-lg text-white">
              Projects ({projects.length})
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Upload a video and it&apos;s compressed, thumbnailed, and published
              automatically.
            </p>
          </div>
          <UploadForm />
          <AdminProjectList projects={projects} />
        </section>

        <TestimonialManager testimonials={profile.testimonials} />
        <CompanyManager companies={profile.companies} />
        <GalleryManager images={profile.gallery} />
      </div>
    </div>
  );
}
