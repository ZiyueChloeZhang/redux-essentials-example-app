import { createSlice } from "@reduxjs/toolkit";

const initialState = [
    { id: '1', title: 'First Post!', content: 'Hello!' },
    { id: '2', title: 'Second Post', content: 'More text' }
]

// responsible for handling all updates to the posts data
const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers:{
        // a reducer funtion
        // createSlice() generate an action creator function with the same name 'postAdded'
        // export the action to dispatch in components
        postAdded(state, action) {
            // this is ok because inside createSlice it use Immer library to make immutable updates
            state.push(action.payload);
        }
    }
})

export const { postAdded }  = postsSlice.actions;
export default postsSlice.reducer;