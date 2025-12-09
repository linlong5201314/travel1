# 旅游博客系统数据库ER图

生成时间: 2025-05-21 19:24:07

## 表: bookmark

### 列

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | 主键, 非空 | |
| created_at | DATETIME |  | |
| user_id | INTEGER | 非空, 外键 -> users.id | |
| post_id | INTEGER | 非空, 外键 -> post.id | |

### 索引

| 索引名 | 列 | 类型 |
|--------|----|---------|
| post_id | post_id | 普通索引 |
| unique_user_post_bookmark | user_id, post_id | 唯一索引 |


## 表: users

### 列

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | 主键, 非空 | |
| username | VARCHAR(64) COLLATE "utf8mb4_unicode_ci" | 非空 | |
| email | VARCHAR(120) COLLATE "utf8mb4_unicode_ci" | 非空 | |
| password_hash | VARCHAR(128) COLLATE "utf8mb4_unicode_ci" | 非空 | |
| role | VARCHAR(10) COLLATE "utf8mb4_unicode_ci" | 非空 | |
| created_at | DATETIME | 非空 | |
| is_deleted | TINYINT | 非空 | |
| avatar_url | VARCHAR(255) COLLATE "utf8mb4_unicode_ci" |  | |
| is_active | TINYINT | 非空 | |
| last_seen | DATETIME |  | |

### 索引

| 索引名 | 列 | 类型 |
|--------|----|---------|
| ix_users_email | email | 普通索引 |
| ix_users_username | username | 普通索引 |
| uix_email_not_deleted | email, is_deleted | 唯一索引 |
| uix_username_not_deleted | username, is_deleted | 唯一索引 |


## 表: post

### 列

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | 主键, 非空 | |
| title | VARCHAR(200) COLLATE "utf8mb4_unicode_ci" | 非空 | |
| content | TEXT COLLATE "utf8mb4_unicode_ci" | 非空 | |
| featured_image | VARCHAR(200) COLLATE "utf8mb4_unicode_ci" |  | |
| location | VARCHAR(100) COLLATE "utf8mb4_unicode_ci" |  | |
| created_at | DATETIME |  | |
| updated_at | DATETIME |  | |
| views | INTEGER |  | |
| is_deleted | TINYINT |  | |
| user_id | INTEGER | 非空, 外键 -> users.id | |
| is_approved | TINYINT |  | |

### 索引

| 索引名 | 列 | 类型 |
|--------|----|---------|
| user_id | user_id | 普通索引 |


## 表: bookmarks

### 列

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | 主键, 非空 | |
| created_at | DATETIME | 非空 | |
| is_liked | TINYINT |  | |
| user_id | INTEGER | 非空, 外键 -> users.id | |
| post_id | INTEGER | 非空, 外键 -> posts.id | |

### 索引

| 索引名 | 列 | 类型 |
|--------|----|---------|
| post_id | post_id | 普通索引 |
| uq_user_post | user_id, post_id | 唯一索引 |


## 表: posts

### 列

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | 主键, 非空 | |
| title | VARCHAR(100) COLLATE "utf8mb4_unicode_ci" | 非空 | |
| content | TEXT COLLATE "utf8mb4_unicode_ci" | 非空 | |
| location | VARCHAR(100) COLLATE "utf8mb4_unicode_ci" |  | |
| featured_image | VARCHAR(255) COLLATE "utf8mb4_unicode_ci" |  | |
| created_at | DATETIME | 非空 | |
| updated_at | DATETIME |  | |
| views | INTEGER |  | |
| is_deleted | TINYINT |  | |
| is_approved | TINYINT |  | |
| user_id | INTEGER | 非空, 外键 -> users.id | |

### 索引

| 索引名 | 列 | 类型 |
|--------|----|---------|
| user_id | user_id | 普通索引 |


## 表: comment

### 列

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | 主键, 非空 | |
| content | TEXT COLLATE "utf8mb4_unicode_ci" | 非空 | |
| created_at | DATETIME |  | |
| is_deleted | TINYINT |  | |
| user_id | INTEGER | 非空, 外键 -> users.id | |
| post_id | INTEGER | 非空, 外键 -> post.id | |
| updated_at | DATETIME |  | |
| is_approved | TINYINT |  | |

### 索引

| 索引名 | 列 | 类型 |
|--------|----|---------|
| post_id | post_id | 普通索引 |
| user_id | user_id | 普通索引 |


## 表: comments

### 列

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | 主键, 非空 | |
| content | TEXT COLLATE "utf8mb4_unicode_ci" | 非空 | |
| created_at | DATETIME | 非空 | |
| updated_at | DATETIME |  | |
| is_deleted | TINYINT |  | |
| is_approved | TINYINT |  | |
| user_id | INTEGER | 非空, 外键 -> users.id | |
| post_id | INTEGER | 非空, 外键 -> posts.id | |
| parent_id | INTEGER | 外键 -> comments.id | |

### 索引

| 索引名 | 列 | 类型 |
|--------|----|---------|
| parent_id | parent_id | 普通索引 |
| post_id | post_id | 普通索引 |
| user_id | user_id | 普通索引 |


## 表: like

### 列

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | 主键, 非空 | |
| created_at | DATETIME |  | |
| user_id | INTEGER | 非空, 外键 -> users.id | |
| post_id | INTEGER | 非空, 外键 -> post.id | |

### 索引

| 索引名 | 列 | 类型 |
|--------|----|---------|
| post_id | post_id | 普通索引 |
| unique_user_post_like | user_id, post_id | 唯一索引 |


## 表关系图

```
bookmark.user_id ----> users.id
bookmark.post_id ----> post.id
post.user_id ----> users.id
bookmarks.user_id ----> users.id
bookmarks.post_id ----> posts.id
posts.user_id ----> users.id
comment.user_id ----> users.id
comment.post_id ----> post.id
comments.post_id ----> posts.id
comments.parent_id ----> comments.id
comments.user_id ----> users.id
like.user_id ----> users.id
like.post_id ----> post.id
```
