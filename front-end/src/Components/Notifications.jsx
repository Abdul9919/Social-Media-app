import { useState } from "react";
import { useSocket } from "../Contexts/SocketContext";

function Avatar({ initials }) {
  return (
    <div className="w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-400 flex-shrink-0">
      {initials}
    </div>
  );
}

function Thumbnail() {
  return (
    <div className="w-11 h-11 rounded bg-neutral-800 flex-shrink-0" />
  );
}

function FollowButton() {
  const [following, setFollowing] = useState(true);
  return (
    <button
      onClick={() => setFollowing(!following)}
      className={`text-sm font-semibold px-4 py-1.5 rounded-lg flex-shrink-0 transition-colors ${
        following
          ? "bg-neutral-700 text-white hover:bg-neutral-600"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

function NotificationItem({ notif }) {
  const text = notif.message;
  const type = notif.type;
  const initials = "U"; // Placeholder, could fetch actor's initials

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors">
      <Avatar initials={initials} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-snug">
          {text}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">now</p>
      </div>
      {type === "follow" ? <FollowButton /> : <Thumbnail />}
    </div>
  );
}

export default function Notifications() {
  const { notifications: realNotifications } = useSocket();

  return (
    <div className="max-w-sm bg-black min-h-screen text-white">
      <h1 className="text-xl font-semibold px-4 pt-4 pb-3">Notifications</h1>
      <div className="flex flex-col">
        {realNotifications && realNotifications.length > 0 ? (
          realNotifications.map((notif, index) => (
            <NotificationItem key={notif.actorId + index} notif={notif} />
          ))
        ) : (
          <p className="text-neutral-500 px-4 py-2">No notifications yet</p>
        )}
      </div>
    </div>
  );
}
