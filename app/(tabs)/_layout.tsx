import {useState} from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import CreatePost from './create_post';
import ViewPosts from './view_posts';
import SearchUsers from './search_users';
import Profile from './profile';

export default function TabsLayout() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'create_post', title: 'Create Post', focusedIcon: 'playlist-plus'},
    { key: 'view_posts', title: 'View Posts', focusedIcon: 'playlist-play' },
    { key: 'search_users', title: 'Search Users', focusedIcon: 'account-search', unfocusedIcon: 'account-search-outline' },
    { key: 'profile', title: 'Profile', focusedIcon: 'account-circle', unfocusedIcon: 'account-circle-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    create_post:CreatePost,
    view_posts: ViewPosts,
    search_users: SearchUsers,
    profile: Profile
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};
