export interface UserData {
  created_at: string;
  id: number;
  display_name: string;
  picture_url: string;
  followers: string[];
  following: string[];
  last_posted: string;
  email: string;
}

export interface Post {
  post_id: number;
  date_posted: string;
  user_id: number;
  display_name: string;
  picture_url: string;
  post_data: {
    song_name: string;
    album_cover: string;
    song_artist: string;
    preview_url: string;
  };
}
