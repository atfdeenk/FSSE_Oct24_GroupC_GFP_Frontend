import React from "react";

interface SellerInfoProps {
  name: string;
  location?: string;
  avatarUrl?: string;
  onViewProfile?: () => void;
}

const SellerInfo: React.FC<SellerInfoProps> = ({ name, location, avatarUrl, onViewProfile }) => {
  return (
    <div className="bg-neutral-900/50 p-6 rounded-sm border border-white/5 flex items-center mt-8">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-500/20 mr-4">
        <img
          src={avatarUrl || "/seller-avatar.jpg"}
          alt={name}
          className="w-full h-full object-cover"
          onError={e => {
            (e.target as HTMLImageElement).src =
              "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=amber&color=fff";
          }}
        />
      </div>
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-white/60 text-sm">{location || "Location not specified"}</p>
      </div>
      <button
        className="ml-auto text-amber-500 font-medium hover:text-amber-400 transition-colors"
        onClick={onViewProfile}
      >
        View Profile
      </button>
    </div>
  );
};

export default SellerInfo;
