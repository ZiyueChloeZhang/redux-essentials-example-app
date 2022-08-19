import {
  createSlice,
  nanoid,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import { client } from '../../api/client'

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

const initialState = postsAdapter.getInitialState({
  status: 'idle',
  error: null,
})

// createAsyncThunk accepts two arguments:
// A string that will be used as the prefix for the generated action types
// A "payload creator" callback function that should return a Promise containing some data,
// or a rejected Promise with an error
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get('/fakeApi/posts')
  return response.data
})

export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  // The payload creator receives the partial `{title, content, user}` object
  async (initialPost) => {
    // We send the initial data to the fake API server
    const response = await client.post('/fakeApi/posts', initialPost)
    // The response includes the complete post object, including unique ID
    return response.data
  }
)

// responsible for handling all updates to the posts data
const postsSlice = createSlice({
  name: 'posts', // string action you see in redux devtool
  initialState,
  reducers: {
    // {reducer, prepare}
    // reducer is the reducer
    // prepare is a callback function to prepare the payload (e.g. generating id)
    // this one is not dispatched anymore
    postAdded: {
      reducer(state, action) {
        state.posts.push(action.payload)
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            date: new Date().toISOString(),
            title,
            content,
            author: userId,
          },
        }
      },
    },
    // a reducer funtion
    // createSlice() generate an action creator function with the same name 'postUpdated'
    // export the action to dispatch in components
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.entities[id]
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },

    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.entities[postId]
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
  },

  /**
   * The builder object in extraReducers provides methods that let us define additional case reducers
   * that will run in response to actions defined outside of the slice
   *
   * builder.addCase(actionCreator, reducer):
   * defines a case reducer that handles a single known action type
   * based on either an RTK action creator or a plain action type string
   *
   * builder.addMatcher(matcher, reducer):
   * defines a case reducer that can run in response to any action where the matcher function returns true
   *
   * builder.addDefaultCase(reducer):
   * defines a case reducer that will run if no other case reducers were executed for this action.
   */
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Use the `upsertMany` reducer as a mutating update utility
        postsAdapter.upsertMany(state, action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Use the `addOne` reducer for the fulfilled case
      .addCase(addNewPost.fulfilled, postsAdapter.addOne)
  },
})

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors((state) => state.posts)

// createSelector() takes in one or more 'input selector' functions as argument
// and an 'output selector' function
// selectPostsByUser(state, userId)
export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId], // input selector functions
  (posts, userId) => posts.filter((post) => post.user === userId)
)

export default postsSlice.reducer
