import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useProfileSetup = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const setupProfileForNewUser = async () => {
      // Only run for authenticated users who don't have a profile yet
      if (!user || profile) return;

      try {
        // Check if this user has invitation data
        const pendingInvitations = JSON.parse(localStorage.getItem('pending_invitations') || '[]');
        const userInvitation = pendingInvitations.find((inv: any) => inv.email === user.email);

        if (userInvitation) {
          // Create profile based on invitation data
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              first_name: userInvitation.firstName,
              last_name: userInvitation.lastName,
              role: userInvitation.role,
              company_id: userInvitation.companyId,
            });

          if (profileError) {
            console.error('Error creating profile from invitation:', profileError);
            return;
          }

          // Remove from pending invitations
          const updatedInvitations = pendingInvitations.filter((inv: any) => inv.email !== user.email);
          localStorage.setItem('pending_invitations', JSON.stringify(updatedInvitations));

          toast({
            title: "Welcome to AGORA!",
            description: `Your account has been set up successfully. Welcome, ${userInvitation.firstName}!`,
          });
        } else {
          // Handle users who signed up without invitation
          // Check if user metadata has invitation info
          const metadata = user.user_metadata;
          if (metadata?.invitation) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                user_id: user.id,
                first_name: metadata.first_name,
                last_name: metadata.last_name,
                role: metadata.role,
                company_id: metadata.company_id,
              });

            if (profileError) {
              console.error('Error creating profile from metadata:', profileError);
              return;
            }

            toast({
              title: "Account Setup Complete",
              description: `Welcome to AGORA, ${metadata.first_name}!`,
            });
          }
        }
      } catch (error) {
        console.error('Error in profile setup:', error);
      }
    };

    setupProfileForNewUser();
  }, [user, profile, toast]);

  return null;
};

export default useProfileSetup; 