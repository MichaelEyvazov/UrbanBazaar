// src/components/UserAvatarCircle.js
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
    backgroundColor: user.isAdmin ? '#ff4444' : '#007bff',
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
