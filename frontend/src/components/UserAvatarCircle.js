import React from 'react';

export default function UserAvatarCircle({ user, size = 38 }) {
  if (!user) return null;

  const initials = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: user.isAdmin ? "#dc3545":user.isSeller ? '#0d6efd' : '#FFD700',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  return user.image ? (
    <img
      src={user.image}
      alt={user.name}
      style={{ ...avatarStyle, objectFit: 'cover' }}
    />
  ) : (
    <div style={avatarStyle}>{user.isAdmin ? 'A' : initials}</div>
  );
}