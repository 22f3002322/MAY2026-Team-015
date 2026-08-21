import { useState } from "react";
import { toast } from "sonner";

import Layout from "../../components/layout/Layout";
import Modal from "../../components/ui/Modal";

import ProfileStats from "../../components/residents/profile/ProfileStats";
import ProfileCard from "../../components/residents/profile/ProfileCard";
import ProfileForm from "../../components/residents/profile/ProfileForm";
import EmergencyContacts from "../../components/residents/profile/EmergencyContact";
import ChangePassword from "../../components/residents/profile/ChangePassword";

import useProfileStore from "../../store/profileStore";

const Profile = () => {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [openModal, setOpenModal] = useState(false);

  return (
    <Layout title="My Profile" breadcrumb={["Resident", "Profile"]}>
      <ProfileStats />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <ProfileCard onEdit={() => setOpenModal(true)} />
        </div>
        <div className="space-y-6 xl:col-span-2">
          <EmergencyContacts />
          <ChangePassword />
        </div>
      </div>

      <Modal
        open={openModal}
        title="Edit Profile"
        onClose={() => setOpenModal(false)}
      >
        <ProfileForm
          initialData={profile}
          onSubmit={async (data) => {
            const res = await updateProfile(data);
            if (res?.success) {
              toast.success(res.message || "Profile updated.");
              setOpenModal(false);
            } else {
              toast.error(res?.message || "Failed to update profile.");
            }
          }}
          onClose={() => setOpenModal(false)}
        />
      </Modal>
    </Layout>
  );
};

export default Profile;
