import { genderAvatarEmoji } from '../../utils/avatar';

// Renders an uploaded profile photo if there is one, otherwise a default
// avatar matching the person's gender — same circular "avatar" styling used
// everywhere else in the app, just able to hold a real image too.
export default function ProfileAvatar({ image, gender, role, size = 56, style, className = '' }) {
  const sizeStyle = { width: size, height: size, fontSize: Math.round(size * 0.5), overflow: 'hidden', ...style };
  return (
    <div className={`avatar role-${role || 'guest'} ${className}`.trim()} style={sizeStyle}>
      {image ? <img src={image} alt="Profile" /> : genderAvatarEmoji(gender)}
    </div>
  );
}
