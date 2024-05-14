
import { router } from "expo-router";
import { useEffect } from "react";
import { supabase } from "./utils/supabase";
import { getUserData } from "./utils/api_interface";

export default function IndexPage() {

  // const checkAccount() => {
    
  // }

  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("session", session);
      if (session) {
        router.replace("/(tabs)/view_posts/");
      } else {
        console.log("no user");
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/(tabs)/view_posts/");
      } else {
        console.log("no user");
        router.replace("/(auth)/login");
      }
    });
  }, []);

}