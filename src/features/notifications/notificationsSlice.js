import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit'

import { client } from '../../api/client'

const notificationsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  // first arg: can only pass in one argument, whatever we pass in becomes the first argument of the payload creation callback
  // second arg:  a thunkAPI object
  // dipatch, getState : the actual disptach and getState methods from Redux store

  async (_, { getState }) => {
    const allNotifications = selectAllNotifications(getState())
    // get the first one in the array using array destructuring
    const [latestNotification] = allNotifications
    const latestTimestamp = latestNotification ? latestNotification.date : ''
    const response = await client.get(
      `/fakeApi/notifications?since=${latestTimestamp}`
    )
    return response.data
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: notificationsAdapter.getInitialState(),
  reducers: {
    allNotificationsRead(state, action) {
      Object.values(state.entities).forEach((notification) => {
        notification.read = true
      })
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      notificationsAdapter.upsertMany(state, action.payload)
      Object.values(state.entities).forEach((notification) => {
        // Any notifications we've read are no longer new
        notification.isNew = !notification.read
      })
    })
  },
})

export const { selectAll: selectAllNotifications } =
  notificationsAdapter.getSelectors((state) => state.notifications)
export const { allNotificationsRead } = notificationsSlice.actions
export default notificationsSlice.reducer
