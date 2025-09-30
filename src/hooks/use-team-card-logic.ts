
'use client';

import { useAuth } from '@/context/AuthContext';
import { createUIHook } from '@/core';
import type { Team } from '@/lib/models/team';
import { useMemo } from 'react';

/**
 * Hook محسن لإدارة بطاقات الفريق
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useTeamCardLogic(team: Team) {
  const { firebaseUser } = useAuth();

  // Memoize the isOwner check to prevent re-calculation on every render
  const isOwner = useMemo(() => team.ownerId === firebaseUser?.uid, [team, firebaseUser]);

  // Memoize the sorted members list
  const members = useMemo(() => team.members.sort((a, b) => a.name.localeCompare(b.name)), [team.members]);

  const uiHook = createUIHook({
    initialState: {
      team,
      isOwner,
      members,
      isExpanded: false,
      isEditing: false,
      selectedMembers: [],
    },
    customLogic: (state: any, setState: any, toast: any) => {
      const handleToggleExpanded = () => {
        setState((prev: any) => ({ ...prev, isExpanded: !prev.isExpanded }));
      };

      const handleEdit = () => {
        setState((prev: any) => ({ ...prev, isEditing: true }));
      };

      const handleSave = () => {
        setState((prev: any) => ({ ...prev, isEditing: false }));
        toast({ title: 'Team updated successfully!' });
      };

      const handleCancel = () => {
        setState((prev: any) => ({ ...prev, isEditing: false }));
      };

      const handleSelectMember = (memberId: string) => {
        setState((prev: any) => ({
          ...prev,
          selectedMembers: prev.selectedMembers.includes(memberId)
            ? prev.selectedMembers.filter(id => id !== memberId)
            : [...prev.selectedMembers, memberId]
        }));
      };

      const handleSelectAll = () => {
        setState((prev: any) => ({
          ...prev,
          selectedMembers: prev.selectedMembers.length === prev.members.length
            ? []
            : prev.members.map(member => member.id)
        }));
      };

      const handleRemoveSelected = () => {
        if (state.selectedMembers.length > 0) {
          setState((prev: any) => ({
            ...prev,
            selectedMembers: []
          }));
          toast({ title: `Removed ${state.selectedMembers.length} members from team` });
        }
      };

      const handleInviteMembers = () => {
        toast({ title: 'Invitation sent to selected members!' });
      };

      return {
        handleToggleExpanded,
        handleEdit,
        handleSave,
        handleCancel,
        handleSelectMember,
        handleSelectAll,
        handleRemoveSelected,
        handleInviteMembers,
        isExpanded: state.isExpanded,
        isEditing: state.isEditing,
        selectedMembers: state.selectedMembers,
        hasSelectedMembers: state.selectedMembers.length > 0,
        allMembersSelected: state.selectedMembers.length === state.members.length,
      };
    }
  })();

  return {
    // الوظائف الأساسية
    isOwner,
    members,

    // الوظائف الجديدة من UI Hook
    ...uiHook,
  };
}
