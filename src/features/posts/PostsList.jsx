import React from 'react'
import { Spinner } from '../../components/Spinner'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { PostAuthor } from './PostAuthor'
import { TimeAgo } from './TimeAgo'
import { ReactionButtons } from './ReactionButtons'
import { fetchPosts, selectAllPosts } from './postsSlice'
import { useDispatch } from 'react-redux'

const PostExcerpt = ({ post }) => {
  return (
    <article className="post-excerpt">
      <h3>{post.title}</h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>

      <ReactionButtons post={post} />
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  )
}

export const PostsList = () => {
  const dispatch = useDispatch()

  const posts = useSelector(selectAllPosts)
  const postsStatus = useSelector((state) => state.posts.status)
  const error = useSelector((state) => state.posts.error)

  React.useEffect(() => {
    // prevent fecthing multiple times
    if (postsStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postsStatus, dispatch])

  const renderContent = () => {
    if (postsStatus === 'loading') {
      return <Spinner text="Loading..." />
    }

    if (postsStatus === 'succeeded') {
      // Sort posts in reverse chronological order by datetime string
      const orderedPosts = posts
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))

      return orderedPosts.map((post) => (
        <PostExcerpt key={post.id} post={post} />
      ))
    }

    if (postsStatus === 'failed') {
      return <div>{error}</div>
    }

    return null // should not happen
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {renderContent()}
    </section>
  )
}
