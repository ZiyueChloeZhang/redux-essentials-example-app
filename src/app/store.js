import { configureStore } from '@reduxjs/toolkit'

import postsReducer from '../features/posts/postsSlice'
import usersReducer from '../features/users/usersSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'

export default configureStore({
  reducer: {
    // tells Redux that we want our top-level state object to have a field named posts inside
    posts: postsReducer,
    users: usersReducer,
    notifications: notificationsReducer,
  },
})
