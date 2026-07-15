import {
  Mail,
  Phone,
  Home,
  Building2,
  User,
  Pencil,
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import useProfileStore from "../../../store/profileStore";

const ProfileCard = ({
  onEdit,
}) => {
  const profile = useProfileStore(
    (state) => state.profile
  );

  return (
    <Card className="overflow-hidden">

      {/* Cover */}

      <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500" />

      {/* Content */}

      <div className="relative px-6 pb-6">

        {/* Avatar */}

        <div className="-mt-14 flex justify-center">

          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
          />

        </div>

        {/* Name */}

        <div className="mt-4 text-center">

          <h2 className="text-2xl font-bold text-slate-800">
            {profile.name}
          </h2>

          <p className="mt-1 text-slate-500">
            {profile.occupancy}
          </p>

        </div>

        {/* Details */}

        <div className="mt-8 space-y-4">

          <div className="flex items-center gap-3">

            <Mail
              size={18}
              className="text-indigo-600"
            />

            <span className="text-slate-700 break-all">
              {profile.email}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <Phone
              size={18}
              className="text-indigo-600"
            />

            <span className="text-slate-700">
              {profile.phone}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <Building2
              size={18}
              className="text-indigo-600"
            />

            <span className="text-slate-700">
              Block {profile.block}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <Home
              size={18}
              className="text-indigo-600"
            />

            <span className="text-slate-700">
              Flat {profile.flat}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <User
              size={18}
              className="text-indigo-600"
            />

            <span className="text-slate-700">
              Joined {profile.joined}
            </span>

          </div>

        </div>

        {/* Edit Button */}

        <div className="mt-8">

          <Button
            className="w-full"
            onClick={onEdit}
          >
            <Pencil size={18} />

            Edit Profile
          </Button>

        </div>

      </div>

    </Card>
  );
};

export default ProfileCard;