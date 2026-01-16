import { supabase } from '../supabase';

export type UserRole = 'admin' | 'clinic' | 'patient';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  clinic_id: string | null;
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const authRoles = {
  async getUserRole(userId?: string): Promise<UserRoleData | null> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getUserRole:', error);
      return null;
    }
  },

  async isAdmin(userId?: string): Promise<boolean> {
    const roleData = await this.getUserRole(userId);
    return roleData?.role === 'admin';
  },

  async isClinic(userId?: string): Promise<boolean> {
    const roleData = await this.getUserRole(userId);
    return roleData?.role === 'clinic';
  },

  async isPatient(userId?: string): Promise<boolean> {
    const roleData = await this.getUserRole(userId);
    return roleData?.role === 'patient' || roleData === null;
  },

  async getCurrentUserRole(): Promise<UserRole> {
    const roleData = await this.getUserRole();
    return roleData?.role || 'patient';
  },

  async canAccessLead(leadId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data, error } = await supabase.rpc('can_access_lead', {
        check_user_id: user.user.id,
        check_lead_id: leadId,
      });

      if (error) {
        console.error('Error checking lead access:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Unexpected error in canAccessLead:', error);
      return false;
    }
  },

  async getClinicId(): Promise<string | null> {
    const roleData = await this.getUserRole();
    return roleData?.clinic_id || null;
  },

  hasPermission(roleData: UserRoleData | null, permission: string): boolean {
    if (!roleData) return false;
    if (roleData.role === 'admin') return true;
    return roleData.permissions?.[permission] === true;
  },
};
