import { supabase } from "./supabase";
import { UserData } from "./interfaces";
import { PostgrestError } from "@supabase/supabase-js";

export const getUserData = async () => {
  const { data: User, error } = await supabase.auth.getUser();

  const user = await supabase.from("users").select("*").eq("id", User.user?.id).single();

  return { user: user.data, error: user.error };
};

export const getUserHasPosted = async (user_id: number) => {
  const { data, error } = await supabase.from("daily_posts").select("*").eq("user_id", user_id).eq("date_posted", new Date().toISOString().slice(0, 10));

  if (data != null && data.length > 0) return true;
  else return false;
};

export const createPost = async (user: UserData, selected: any) => {
  const { error } = await supabase.from("daily_posts").insert({
    user_id: user?.id,
    display_name: user?.display_name,
    picture_url: user?.picture_url,
    post_data: selected,
  });
};

// TODO: prevent user from following themselves
export const followUser = async (user: UserData, follow: UserData) => {

  // Check if already following
  if (user.following.includes(follow.id.toString())) return {error: 'already following'};
  if (follow.followers.includes(user.id.toString())) return {error: "already followed"};

  // Append follow to following list
  const { data: followingData, error: followingError } = await supabase
    .from("users")
    .update({ following: [...user.following, follow.id] })
    .eq("id", user.id)
    .single();

  // Append user to followers list
  const { data: followersData, error: followersError } = await supabase
    .from("users")
    .update({ followers: [...follow.followers, user.id] })
    .eq("id", follow.id)
    .single();

  console.log(followingData, followingError);
  console.log(followersData, followersError);

  if (followingError || followersError) return {error: followingError && followersError};
  else return null;
};

// TODO Add second user to test displaying posts from following list
export const getPosts = async (user: UserData) => {
  const { data: userData, error: userError } = await supabase.from("daily_posts").select("*").eq("user_id", user.id).eq("date_posted", new Date().toISOString().slice(0, 10));

  const { data: followingData, error: followingError } = await supabase.from("daily_posts").select("*").in("user_id", user.following).eq("date_posted", new Date().toISOString().slice(0, 10));

  if (followingData && userData) {
    followingData.unshift(...userData);
    return { data: followingData, error: userError !== null || followingError !== null };
  }

  return { data: userData, error: userError !== null || followingError !== null };
};

// TOOD: Prevent user from searching for themselves
export const searchUsers = async (query: string): Promise<{ data: any; error: PostgrestError | null }> => {
  const { data, error } = await supabase.from("users").select().textSearch("display_name", `${query.toLowerCase()}:*`).limit(10);

  return { data, error };
};
