import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Shield, User, Lock } from 'lucide-react';

interface Profile {
  username: string;
  email: string;
  referral_code: string;
}

const Settings = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, email, referral_code')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data && !error) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard',
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });

      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>

          {/* Profile Section */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Username</Label>
                <Input value={profile?.username || ''} readOnly className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <Input value={profile?.email || ''} readOnly className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Your Referral Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={profile?.referral_code || ''} readOnly className="font-mono" />
                  <Button variant="outline" size="icon" onClick={copyReferralCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Share this code to earn 50 ERSX for each referral
                </p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Change Password</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
              <Button
                variant="default"
                onClick={handleChangePassword}
                disabled={isChangingPassword || !newPassword}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </div>

          {/* Security Info */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Security</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 glass-panel rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 glass-panel rounded-lg">
                <div>
                  <p className="font-medium">Session Management</p>
                  <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
