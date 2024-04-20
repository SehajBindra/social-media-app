import { useParams, Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui";
import { Loader } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
  useCommentPost,
  useGetCommentByID,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
// import { addComment } from "@/lib/appwrite/api";
import { useState } from "react";
// import { Models } from "appwrite";
// interface Props {
//   comments: Models.DocumentList<Models.Document> | undefined;
// }
const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();
  const { mutate: addComment } = useCommentPost();
  const [comment, setComment] = useState("");
  const { data: comments } = useGetCommentByID(id!);
  // console.log("comments", comments);
  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  const sendComment = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    addComment({ userId: user.id, postId: post?.$id!, text: comment });
    setComment("");

    // console.log("userId", user.id);
    // console.log("postId", post?.$id);
    // console.log("comment", comment);
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={post?.imageUrl}
            alt="creator"
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3">
                <img
                  src={
                    post?.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}>
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ost_details-delete_btn ${
                    user.id !== post?.creator.$id && "hidden"
                  }`}>
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>

              <ul className="mt-10">
                <div>
                  <h2 className="text-xl">Comments</h2>
                  {comments?.documents.map((comment) => (
                    <div className="pt-4 flex items-center text-white/60">
                      <div className="flex items-center space-x-2">
                        <img
                          src={user.imageUrl}
                          alt="creator"
                          className="w-6 h-6 object-cover rounded-full"
                        />
                        <h2 className="font-semibold text-white">
                          {" "}
                          {user.name}{" "}
                        </h2>
                      </div>

                      <li
                        className=" flex items-center space-x-2 ml-2"
                        key={comment.$id}>
                        <p>{comment.text}</p>

                        {/* <p>{comment.$createdAt}</p> */}
                      </li>
                    </div>
                  ))}
                </div>
              </ul>

              <form className="  ">
                <textarea
                  rows={2}
                  cols={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your comments "
                  className=" mt-4 h-auto overflow-y-auto scrollbar-none w-full bg-transparent  resize-none  mr-2 flex-1 focus:ring-0 outline-none"
                />
                <button
                  type="submit"
                  disabled={!comment}
                  onClick={(e) => sendComment(e)}
                  className=" font-[600] mt-3 text-[16px] text-blue-400">
                  Post
                </button>
              </form>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string, index: string) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;
