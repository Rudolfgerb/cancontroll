import React from 'react';

const Profile = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Mein Profil</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <p className="text-lg mb-4">Hier kannst du dein Profil verwalten.</p>
        {/* Hier könnten später Profilinformationen und Bearbeitungsoptionen eingefügt werden */}
        <p className="text-gray-400">Diese Seite ist noch in Entwicklung.</p>
      </div>
    </div>
  );
};

export default Profile;
