import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast"

const CrewComponent = () => {
  const { toast } = useToast()
  const [crew, setCrew] = useState<any>(null);
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewInitials, setNewCrewInitials] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false)
  const [userId, setUserId] = useState<string | null>(null);
  const [crews, setCrews] = useState([])
  const [newMemberId, setNewMemberId] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true)
      if (user) {
        setUserId(user.uid);
        // Fetch user data and check crewId
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData && userData.crewId) {
            // Fetch crew data
            const crewDocRef = doc(db, 'crews', userData.crewId);
            const crewDocSnap = await getDoc(crewDocRef);
            if (crewDocSnap.exists()) {
              const crewData = crewDocSnap.data();
              setCrew({ id: crewDocSnap.id, ...crewData });
              setIsLeader(crewData.leader === user.uid)
            } else {
              setCrew(null);
            }
          } else {
            setCrew(null);
          }
        } else {
          setCrew(null);
        }
      } else {
        setUserId(null);
        setCrew(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const crewsCollection = collection(db, 'crews')
    const unsubscribe = onSnapshot(crewsCollection, (snapshot) => {
      const crewsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCrews(crewsList)
    })

    return () => unsubscribe()
  }, [])

  const handleCreateCrew = async () => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Not authenticated',
        description: 'You must be logged in to create a crew.'
      })
      return
    }

    if (newCrewName && newCrewInitials) {
      setLoading(true);
      try {
        // Create a new crew document in Firestore
        const crewsCollectionRef = collection(db, 'crews');
        const newCrewDocRef = await addDoc(crewsCollectionRef, {
          name: newCrewName,
          initials: newCrewInitials,
          logo: 'https://via.placeholder.com/150', // Placeholder logo
          members: [userId],
          leader: userId,
        });

        // Update the current user's document with the new crew ID
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          crewId: newCrewDocRef.id,
        });

        toast({
          title: 'Crew created',
          description: 'Crew created successfully.',
        })

        // Update state
        setCrew({
          id: newCrewDocRef.id,
          name: newCrewName,
          initials: newCrewInitials,
          logo: 'https://via.placeholder.com/150', // Placeholder logo
          members: [userId],
          leader: userId,
        });
        setIsLeader(true)
        setNewCrewName('');
        setNewCrewInitials('');
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to create crew',
          description: error.message
        })
        console.error("Error creating crew: ", error);
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter a crew name and initials.'
      })
    }
  };

  const handleLeaveCrew = async () => {
    if (!userId || !crew) return;

    setLoading(true);
    try {
      // Remove user from crew's members array
      const crewDocRef = doc(db, 'crews', crew.id);
      await updateDoc(crewDocRef, {
        members: crew.members.filter((memberId: string) => memberId !== userId),
      });

      // Update user's crewId to null
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        crewId: null,
      });

      toast({
        title: 'Left crew',
        description: 'You have left the crew.',
      })

      // Update state
      setCrew(null);
      setIsLeader(false)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to leave crew',
        description: error.message
      })
      console.error("Error leaving crew: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteFriend = async () => {
    if (!userId || !crew) return
    if (!newMemberId) {
      toast({
        variant: 'destructive',
        title: 'Please provide a user id',
      })
      return
    }

    setLoading(true)

    try {
      const crewDocRef = doc(db, 'crews', crew.id)

      if (crew.members.includes(newMemberId)) {
        toast({
          variant: 'destructive',
          title: 'User is already in crew',
        })
        return
      }

      await updateDoc(crewDocRef, {
        members: [...crew.members, newMemberId]
      })

      const userDocRef = doc(db, 'users', newMemberId)
      await updateDoc(userDocRef, {
        crewId: crew.id
      })

      setCrew(prev => ({
        ...prev,
        members: [...prev.members, newMemberId]
      }))

      toast({
        title: 'Successfully added member to crew'
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to add member',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Crew Management</h1>

      <div className="space-y-6">
        {crew ? (
          <Card>
            <CardHeader>
              <CardTitle>Current Crew: {crew?.name}</CardTitle>
              <CardDescription>Your crew's details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                {crew?.logo ? (
                  <img src={crew.logo} alt="Crew Logo" className="h-16 w-16 rounded-full" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                    {crew?.initials}
                  </div>
                )}
                <div className="space-y-1">
                  <p><strong>Name:</strong> {crew?.name}</p>
                  <p><strong>Initials:</strong> {crew?.initials}</p>
                  <p><strong>Members:</strong> {crew?.members?.join(', ')}</p>
                </div>
              </div>
              {isLeader && (
                <Input placeholder="User id to add to crew" onChange={(e) => setNewMemberId(e.target.value)} />
              )}
              {isLeader && (
                <Button onClick={handleInviteFriend}>Add member</Button>
              )}
              <Button onClick={handleLeaveCrew}>
                Leave Crew
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create New Crew</CardTitle>
              <CardDescription>Found your own crew! First one is free, subsequent crews cost more.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crew-name">Crew Name</Label>
                <Input
                  id="crew-name"
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  placeholder="e.g., Graffiti Kings"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crew-initials">Crew Initials (2-4 chars)</Label>
                <Input
                  id="crew-initials"
                  value={newCrewInitials}
                  onChange={(e) => setNewCrewInitials(e.target.value)}
                  placeholder="e.g., GK"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crew-logo">Crew Logo (URL)</Label>
                <Input
                  id="crew-logo"
                  placeholder="e.g., https://example.com/logo.png"
                  disabled // Placeholder, actual upload logic would be complex
                />
                <p className="text-sm text-gray-500">Logo upload functionality is a placeholder.</p>
              </div>
              <Button onClick={handleCreateCrew}>
                Create Crew (Cost: {crewCount === 0 ? 'Free' : 500 * Math.pow(2, crewCount - 1) + ' coins'})
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Other Crews</CardTitle>
            <CardDescription>Send Request to Other Crews</CardDescription>
          </CardHeader>
          <CardContent className="flex w-full space-x-2">
            {crews.map(crew => {
              return (
                <div key={crew.id}>
                  <h1>{crew.name}</h1>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrewComponent;
