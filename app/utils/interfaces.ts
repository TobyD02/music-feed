//TODO: Posts need comments and captions associated with them.
/*
Comments could be a separate table, each with an id relating to either a (parent) post or a (parent) comment.


COMMENT:
- comment_id: id of the comment
- user_id: id of the user who made the comment
- comment_text: content of the comment
- is_reply: true if comment is a reply to another comment
- parent_id: if is_reply, parent_id = comment_id, if not, parent_id = post_id
- replies: array of comment ids -> should be streamed in when replies are viewed

POST:
- ...already existing columns
- comments: array of comment ids
// TODO: Add caption to posts
- caption: string 
*/


export interface UserData {
  created_at: string;
  id: number;
  display_name: string;
  picture_url: string;
  followers: string[];
  following: string[];
  last_posted: string;
  email: string;
  just_created: boolean;
}

export interface Post {
  post_id: number;
  date_posted: string;
  user_id: number;
  display_name: string;
  picture_url: string;
  caption: string;
  post_data: {
    song_name: string;
    album_cover: string;
    song_artist: string;
    preview_url: string;
  };
}

export interface Comment {
  id: number;
  created_at: string;
  user_id: number;
  content: string;
  is_reply: boolean;
  reply_to: number | null;
  post_id: number;
  user_picture: string;
  display_name: string;
}
