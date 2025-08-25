'use client';

import { Avatar, Link } from "@nextui-org/react";

interface UserProfileProps {
  avatarUrl?: string;
  name: string;
  username: string;
  profileUrl?: string;
  className?: string;
}

export default function UserProfile({
  avatarUrl = "https://avatars.githubusercontent.com/u/30373425?v=4",
  name = "Junior Garcia",
  username = "jrgarciadev",
  profileUrl = "https://x.com/jrgarciadev",
  className = "",
}: UserProfileProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Avatar
        src={avatarUrl}
        className="w-10 h-10"
        fallback={<span className="text-sm font-medium">{name[0]}</span>}
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        <Link
          isExternal
          href={profileUrl}
          size="sm"
          className="text-purple-500 hover:text-purple-600"
        >
          @{username}
        </Link>
      </div>
    </div>
  );
}
