from app import db
from model.bookmark import Bookmark
from model.post import Post
from sqlalchemy import desc

class BookmarkDAO:
    @staticmethod
    def get_bookmark(user_id, post_id):
        """获取用户对特定帖子的收藏"""
        return Bookmark.query.filter_by(user_id=user_id, post_id=post_id).first()
    
    @staticmethod
    def get_user_bookmarks(user_id):
        """获取用户的所有收藏"""
        return Bookmark.query.filter_by(user_id=user_id).all()
    
    @staticmethod
    def get_user_bookmarked_posts(user_id):
        """获取用户收藏的所有帖子"""
        # 使用联表查询获取已收藏且未删除的帖子
        bookmarked_posts = db.session.query(Post)\
            .join(Bookmark, Post.id == Bookmark.post_id)\
            .filter(Bookmark.user_id == user_id)\
            .filter(Post.is_deleted == False)\
            .filter(Post.is_approved == True)\
            .order_by(desc(Bookmark.created_at))\
            .all()
        
        return bookmarked_posts
    
    @staticmethod
    def toggle_bookmark(user_id, post_id):
        """切换收藏状态"""
        bookmark = Bookmark.query.filter_by(user_id=user_id, post_id=post_id).first()
        
        if bookmark:
            # 如果已存在，则删除收藏
            db.session.delete(bookmark)
            db.session.commit()
            return False  # 返回False表示取消收藏
        else:
            # 如果不存在，则创建收藏
            bookmark = Bookmark(user_id=user_id, post_id=post_id)
            db.session.add(bookmark)
            db.session.commit()
            return True  # 返回True表示添加收藏
    
    @staticmethod
    def toggle_like(user_id, post_id):
        """切换点赞状态"""
        bookmark = Bookmark.query.filter_by(user_id=user_id, post_id=post_id).first()
        
        if not bookmark:
            # 如果不存在收藏记录，创建一个并设置为点赞
            bookmark = Bookmark(user_id=user_id, post_id=post_id, is_liked=True)
            db.session.add(bookmark)
            db.session.commit()
            return True
        else:
            # 如果存在，则切换点赞状态
            bookmark.is_liked = not bookmark.is_liked
            db.session.commit()
            return bookmark.is_liked 