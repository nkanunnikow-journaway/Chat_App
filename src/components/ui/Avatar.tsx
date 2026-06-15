import type { User } from '../../types/users.tsx';

type AvatarProps = {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  overrideUrl?: string | null;
};

function Avatar({ user, size = 'md', overrideUrl }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-24 w-24 text-2xl'
  };

  const imageUrl =
    overrideUrl ?? (user.profileImageUrl ? `${import.meta.env.VITE_API_BASE_URL}${user.profileImageUrl}` : null);

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 rounded-full overflow-hidden bg-primary flex items-center justify-center font-bold text-white`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        user.name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

export default Avatar;
