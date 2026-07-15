import { useState } from "react";

import Layout from "../../components/layout/Layout";

import Modal from "../../components/ui/Modal";

import ProfileStats from "../../components/residents/profile/ProfileStats";
import ProfileCard from "../../components/residents/profile/ProfileCard";
import ProfileForm from "../../components/residents/profile/ProfileForm";
import EmergencyContacts from "../../components/residents/profile/EmergencyContact";
import ChangePassword from "../../components/residents/profile/ChangePassword";

import useProfileStore from "../../store/profileStore";

const Profile = () => {
  const profile = useProfileStore(
    (state) => state.profile
  );

  const updateProfile = useProfileStore(
    (state) => state.updateProfile
  );

  const [openModal, setOpenModal] =
    useState(false);

  return (
    <Layout
      title="My Profile"
      breadcrumb={[
        "Resident",
        "Profile",
      ]}
    >
      {/* Stats */}

      <ProfileStats />

      {/* Main Section */}

      <div className="grid gap-6 xl:grid-cols-3">

        {/* Left */}

        <div className="xl:col-span-1">

          <ProfileCard
            onEdit={() =>
              setOpenModal(true)
            }
          />

        </div>

        {/* Right */}

        <div className="space-y-6 xl:col-span-2">

          <EmergencyContacts />

          <ChangePassword />

        </div>

      </div>

      {/* Edit Profile */}

      <Modal
        open={openModal}
        title="Edit Profile"
        onClose={() =>
          setOpenModal(false)
        }
      >
        <ProfileForm
          initialData={profile}
          onSubmit={(data) => {
            updateProfile(data);

            setOpenModal(false);
          }}
          onClose={() =>
            setOpenModal(false)
          }
        />
      </Modal>

    </Layout>
  );
};

export default Profile;