import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Shield, Users, RefreshCw } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: AppRole;
  created_at: string;
}

const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  coach: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  parent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  athlete: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      toast({
        title: 'Access Denied',
        description: 'You must be an admin to access this page.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, role, authLoading, navigate, toast]);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles with their roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, created_at');
    
    if (profilesError) {
      toast({
        title: 'Error fetching users',
        description: profilesError.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');
    
    if (rolesError) {
      toast({
        title: 'Error fetching roles',
        description: rolesError.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Combine profiles with roles
    const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
      const userRole = roles?.find(r => r.user_id === profile.id);
      return {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: (userRole?.role as AppRole) || 'athlete',
        created_at: profile.created_at,
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (userId === user?.id) {
      toast({
        title: 'Cannot change own role',
        description: 'You cannot change your own role.',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(userId);

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Role updated',
        description: `User role has been changed to ${newRole}.`,
      });
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    }

    setUpdating(null);
  };

  if (authLoading || (role !== 'admin')) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-field p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-cream/80 hover:text-cream"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="font-display text-2xl text-cream">ADMIN DASHBOARD</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {(['admin', 'coach', 'parent', 'athlete'] as AppRole[]).map(r => (
            <Card key={r} className="bg-cream/5 border-cream/10">
              <CardHeader className="pb-2">
                <CardDescription className="text-cream/60 capitalize">{r}s</CardDescription>
                <CardTitle className="text-2xl text-cream">
                  {users.filter(u => u.role === r).length}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Users Table */}
        <Card className="bg-cream/5 border-cream/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-accent" />
                <div>
                  <CardTitle className="text-cream">User Management</CardTitle>
                  <CardDescription className="text-cream/60">
                    View and manage user roles
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                disabled={loading}
                className="border-cream/20 text-cream hover:bg-cream/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-cream/60">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-cream/10">
                      <TableHead className="text-cream/60">Name</TableHead>
                      <TableHead className="text-cream/60">Current Role</TableHead>
                      <TableHead className="text-cream/60">Joined</TableHead>
                      <TableHead className="text-cream/60">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="border-cream/10">
                        <TableCell className="text-cream">
                          <div className="flex items-center gap-2">
                            {u.first_name || u.last_name 
                              ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                              : 'Unnamed User'}
                            {u.id === user?.id && (
                              <Badge variant="outline" className="text-xs border-accent text-accent">
                                You
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${roleColors[u.role]} border capitalize`}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-cream/60">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={(value) => handleRoleChange(u.id, value as AppRole)}
                            disabled={updating === u.id || u.id === user?.id}
                          >
                            <SelectTrigger className="w-32 bg-cream/10 border-cream/20 text-cream">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-primary border-cream/20">
                              <SelectItem value="athlete" className="text-cream hover:bg-cream/10">
                                Athlete
                              </SelectItem>
                              <SelectItem value="parent" className="text-cream hover:bg-cream/10">
                                Parent
                              </SelectItem>
                              <SelectItem value="coach" className="text-cream hover:bg-cream/10">
                                Coach
                              </SelectItem>
                              <SelectItem value="admin" className="text-cream hover:bg-cream/10">
                                Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Note */}
        <p className="text-cream/40 text-sm text-center mt-6">
          Role changes take effect immediately. Users may need to refresh their browser to see updated permissions.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;