import { configureStore } from '@reduxjs/toolkit'

import postsReducer from '../features/posts/postsSlice';

export default configureStore({
  reducer: {
    // tells Redux that we want our top-level state object to have a field named posts inside
    posts: postsReducer
  }
})
