import { supabase } from "./supabase";
import { UserData, Comment, Post } from "./interfaces";
import { PostgrestError } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserData = async (): Promise<{ user: UserData | null; error: PostgrestError | null }> => {
  const userDataExists = await AsyncStorage.getItem("user");

  console.log({ userDataExists });

  if (userDataExists) return { user: JSON.parse(userDataExists), error: null };
  else {
    console.log("fetching user");
    const { data: User, error } = await supabase.auth.getUser();
    console.log({ User });

    const users = await supabase.from("users").select("*");
    console.log({ users });

    const user = await supabase.from("users").select("*").eq("id", User.user?.id).single();

    await AsyncStorage.setItem("user", JSON.stringify(user.data));
    return { user: user.data, error: user.error };
  }
};

export const getUserHasPosted = async (user_id: number) => {
  const { data, error } = await supabase
    .from("daily_posts")
    .select("*")
    .eq("user_id", user_id)
    .eq("date_posted", new Date().toISOString().slice(0, 10));

  if (data != null && data.length > 0) return true;
  else return false;
};

export const createPost = async (user: UserData, selected: any, caption: string) => {
  const { error: postError, data: postData } = await supabase.from("daily_posts").upsert({
    user_id: user?.id,
    display_name: user?.display_name,
    picture_url: user?.picture_url,
    post_data: selected,
    caption: caption,
  });
};

// TODO: prevent user from following themselves
export const followUser = async (user: UserData, follow: UserData) => {
  await clearUserData(); // clear stored user data

  // Check if already following
  if (user.following.includes(follow.id.toString())) return { error: "already following" };
  if (follow.followers.includes(user.id.toString())) return { error: "already followed" };
  if (user.id == follow.id) return { error: "cannot follow yourself" };

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

  if (followingError || followersError) return { error: followingError && followersError };
  else return null;
};

// TODO Add second user to test displaying posts from following list
export const getPosts = async (user: UserData) => {
  const { data: userData, error: userError } = await supabase
    .from("daily_posts")
    .select("*")
    .eq("user_id", user.id)
    .eq("date_posted", new Date().toISOString().slice(0, 10));

  const { data: followingData, error: followingError } = await supabase.from("daily_posts").select("*").in("user_id", user.following).eq("date_posted", new Date().toISOString().slice(0, 10));

  // const { data: followingData, error: followingError } = await supabase.from("daily_posts").select("*")

  if (followingData && userData) {
    followingData.unshift(...userData);
    return { data: followingData, error: userError !== null || followingError !== null };
  }

  return { data: userData, error: userError !== null || followingError !== null };
};

// TOOD: Prevent user from searching for themselves
export const searchUsers = async (query: string, user: UserData): Promise<{ data: any; error: PostgrestError | null }> => {
  // const { data, error } = await supabase.from("users").select().textSearch("display_name", `${query.toLowerCase()}:*`).limit(10).neq('id', user.id);
  const { data, error } = await supabase.from("users").select("*");

  return { data, error };
};

export const checkUsername = async (user: UserData, username: string): Promise<{ data: any; error: PostgrestError | string | null }> => {
  await clearUserData();

  if (username.length <= 3) return { data: null, error: "username too short" }; // username too short
  if (username.length >= 30) return { data: null, error: "username too long" }; // username too long
  if (!username.match(/^[\w]+$/)) return { data: null, error: "username contains invalid characters" }; // username contains invalid characters

  const { data: userExistsData, error: userExistsError } = await supabase.from("users").select().eq("display_name", username.toLowerCase());
  if (userExistsData && userExistsData.length > 0) return { data: null, error: "username already taken" };

  const { data: usernameUpdatedData, error: usernameUpdatedError } = await supabase
    .from("users")
    .update({ display_name: username })
    .eq("id", user.id);

  console.log("completed" + usernameUpdatedData, usernameUpdatedError);

  return { data: true, error: usernameUpdatedError };
};

export const updateJustCreated = async (user: UserData): Promise<{ success: boolean; error: PostgrestError | null }> => {
  await clearUserData();

  const { error } = await supabase.from("users").update({ just_created: false }).eq("id", user.id);

  if (error) return { success: false, error };
  else return { success: true, error: null };
};

export const postComment = async (comment: Comment) => {
  const { data, error } = await supabase.from("comments").upsert(comment);
  // console.log({ data, error });
};

export const deleteComment = async (id: number) => {
  const { data, error } = await supabase.from("comments").delete().eq("id", id);

};

export const clearUserData = async (): Promise<{ success: boolean }> => {
  console.log("clearing user data");
  await AsyncStorage.removeItem("user");
  return { success: true };
};
