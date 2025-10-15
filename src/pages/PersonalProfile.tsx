import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PersonalProfilePage = () => {
  const [personalProfile, setPersonalProfile] = useState({
    name: 'Player One',
    avatar: 'https://github.com/shadcn.png',
  });

  const handlePersonalProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPersonalProfile((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Personal Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Manage Your Profile</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={personalProfile.avatar} alt="@user" />
              <AvatarFallback>{personalProfile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={personalProfile.name}
                onChange={handlePersonalProfileChange}
                className="w-auto"
              />
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={personalProfile.avatar}
                onChange={handlePersonalProfileChange}
                className="w-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalProfilePage;
