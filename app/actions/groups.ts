"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// --- 1. Create Group ---
export async function createGroup(name: string, leaderId: string, memberIds: string[], location: string) {
    try {
        // 1. Create Group Record
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .insert({
                name,
                leader_id: leaderId,
                location
            })
            .select('id')
            .single();

        if (groupError) throw groupError;

        // 2. Add Members (Leader is also a member usually, let's assume memberIds includes leader or we add them)
        // Ensure unique list
        const allMembers = Array.from(new Set([...memberIds, leaderId]));

        const memberRecords = allMembers.map(mid => ({
            group_id: group.id,
            member_id: mid
        }));

        const { error: membersError } = await supabase
            .from('group_members')
            .insert(memberRecords);

        if (membersError) throw membersError;

        // 3. Initial Score Calculation
        await calculateJointLiabilityScore(group.id);

        revalidatePath('/groups');
        return { success: true, groupId: group.id };

    } catch (error: any) {
        console.error("Create Group Error:", error);
        return { error: error.message };
    }
}

// --- 2. Calculate Joint Liability Score ---
export async function calculateJointLiabilityScore(groupId: string) {
    try {
        // 1. Fetch Members and their Trust Scores
        const { data: members, error } = await supabase
            .from('group_members')
            .select(`
                member_id,
                profile:profiles!member_id(trust_score)
            `)
            .eq('group_id', groupId);

        if (error) throw error;

        if (!members || members.length === 0) return { success: true, score: 0 };

        // 2. Calculate Average
        let totalScore = 0;
        let count = 0;

        members.forEach((m: any) => {
            const score = m.profile?.trust_score || 0;
            totalScore += Number(score);
            count++;
        });

        const averageScore = count > 0 ? Math.round(totalScore / count) : 0;

        // 3. Update Group
        const { error: updateError } = await supabase
            .from('groups')
            .update({ joint_liability_score: averageScore })
            .eq('id', groupId);

        if (updateError) throw updateError;

        return { success: true, score: averageScore };

    } catch (error: any) {
        console.error("Calc Joint Score Error:", error);
        return { error: error.message };
    }
}

// --- 3. Get Group Details ---
export async function getGroupDetails(groupId: string) {
    try {
        const { data: group, error } = await supabase
            .from('groups')
            .select(`
                *,
                leader:profiles!leader_id(full_name, phone),
                members:group_members(
                    joined_at,
                    profile:profiles!member_id(id, full_name, trust_score, phone)
                )
            `)
            .eq('id', groupId)
            .single();

        if (error) throw error;
        return { success: true, group };

    } catch (error: any) {
        return { error: error.message };
    }
}

// --- 4. Get User Groups ---
export async function getUserGroups(userId: string) {
    try {
        // Get groups where user is a member
        const { data: memberships, error } = await supabase
            .from('group_members')
            .select(`
                group:groups (
                    id, name, location, joint_liability_score, leader_id, created_at
                )
            `)
            .eq('member_id', userId);

        if (error) throw error;

        const groups = memberships.map((m: any) => m.group);
        return { success: true, groups };

    } catch (error: any) {
        return { error: error.message };
    }
}
