
# Assignment 1: Project Concepts

## Project: Blogging Platform 

This document includes a list of important concepts used in my existing blogging platform project. The concepts are divided into Object, Context, and Important Information.


## 1. Object: Blog

**Context:**  
Blog is the main content entity in the application. Each blog is created by a user, belongs to a category, can receive likes and comments.

**Important Information:**
 `title`: Blog title (required)
 `description`: Short blog description (required)
 `content`: Full blog content (optional)
 `image`: URL to blog image
 `category`: Reference to category collection
 `user`: Reference to user (author)
 `likes`: Array of users who liked the blog
 `comments`: Array of comment IDs
 `createdAt`: Date when blog is created


## 2. Object: Category

**Context:-**
Used to group blogs under different topics or categories.

**Important Information:**
 `name`: Name of the category (unique and required)
 `createdAt`: Date when category is added


## 3. Object: Comment

**Context:-**
Represents user feedback or discussion on a blog post.

**Important Information:**
`content`: Comment text (required)
`user`: Reference to user who commented
`blog`: Reference to blog the comment belongs to
`createdAt`: Date when comment was made

## 4. Object: Notification

**Context:-** 
Notifies a user when someone likes or comments on their blog post.

**Important Information:**
`user`: Receiver of notification
`from`: Who performed the action (like/comment)
`blog`: Related blog
`type`: Type of notification (like or comment)
`message`: Notification text
`isRead`: Boolean to check if user has read it
`createdAt`: Date when notification was generated

## 5. Object: User

**Context:-**
Represents a person using the application. Can write blogs, like/comment, and receive notifications.

**Important Information:**
`username`: Unique username (required)
`name`: Optional name
`email`: Unique and valid email (required)
`password`: Password (min 6 characters)
`profileImage`: Optional profile picture
`role`: Either "user" or "admin"
`createdAt`: Date of registration

