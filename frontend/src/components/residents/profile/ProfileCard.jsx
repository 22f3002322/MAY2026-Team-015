import { useState } from "react";
import {
  Mail,
  Phone,
  Home,
  Building2,
  User,
  Pencil,
  Car,
  Camera,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import useProfileStore from "../../../store/profileStore";

const ProfileCard = ({ onEdit }) => {
  const { profile, uploadAvatar, removeAvatar } = useProfileStore();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
      toast.error("Please upload a valid JPEG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB.");
      return;
    }

    setUploading(true);
    try {
      await uploadAvatar(file);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      toast.success("Profile picture removed.");
    } catch (err) {
      toast.error("Failed to remove profile picture.");
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Cover */}
      <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500" />

      {/* Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar with Upload button */}
        <div className="-mt-14 flex justify-center">
          <div className="relative group">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg bg-white"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700 focus:outline-none"
              title="Upload new picture"
            >
              <Camera size={16} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            {profile.avatar && !profile.avatar.includes("pravatar") && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute top-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700"
                title="Remove picture"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {profile.name}
          </h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {profile.occupancy}
          </p>
        </div>

        {/* Details */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-indigo-600" />
            <span className="text-slate-700 break-all dark:text-slate-100">
              {profile.email}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Phone size={18} className="text-indigo-600" />
            <span className="text-slate-700 dark:text-slate-100">
              {profile.phone}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Building2 size={18} className="text-indigo-600" />
            <span className="text-slate-700 dark:text-slate-100">
              Block {profile.block}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Home size={18} className="text-indigo-600" />
            <span className="text-slate-700 dark:text-slate-100">
              Flat {profile.flat}
            </span>
          </div>


          <div className="flex items-center gap-3">
            <User size={18} className="text-indigo-600" />
            <span className="text-slate-700 dark:text-slate-100">
              Joined {profile.joined}
            </span>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-8">
          <Button className="w-full" onClick={onEdit}>
            <Pencil size={18} />
            Edit Profile
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;