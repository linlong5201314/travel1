from app import db
from model.comment import Comment
from sqlalchemy import desc

class CommentDAO:
    @staticmethod
    def get_comment_by_id(comment_id):
        """根据ID获取评论"""
        return Comment.query.get(comment_id)
    
    @staticmethod
    def get_approved_comments_by_post_id(post_id, parent_id=None):
        """获取帖子的已审核评论"""
        return Comment.query.filter_by(
            post_id=post_id,
            parent_id=parent_id,
            is_deleted=False,
            is_approved=True
        ).order_by(desc(Comment.created_at)).all()
    
    @staticmethod
    def get_all_comments_by_post_id(post_id, parent_id=None, include_unapproved=False):
        """获取帖子的所有评论，包括未审核的"""
        query = Comment.query.filter_by(
            post_id=post_id,
            parent_id=parent_id,
            is_deleted=False
        )
        
        if not include_unapproved:
            query = query.filter_by(is_approved=True)
            
        return query.order_by(desc(Comment.created_at)).all()
    
    @staticmethod
    def create_comment(content, user_id, post_id, parent_id=None, is_approved=False):
        """创建新评论"""
        comment = Comment(
            content=content,
            user_id=user_id,
            post_id=post_id,
            parent_id=parent_id,
            is_approved=is_approved
        )
        db.session.add(comment)
        db.session.commit()
        return comment
    
    @staticmethod
    def update_comment(comment_id, content):
        """更新评论内容"""
        comment = Comment.query.get(comment_id)
        if not comment:
            return None
        
        comment.content = content
        db.session.commit()
        return comment
    
    @staticmethod
    def delete_comment(comment_id):
        """删除评论（软删除）"""
        comment = Comment.query.get(comment_id)
        if not comment:
            return False
        
        comment.is_deleted = True
        db.session.commit()
        return True
    
    @staticmethod
    def approve_comment(comment_id):
        """审核通过评论"""
        comment = Comment.query.get(comment_id)
        if not comment:
            return False
        
        comment.is_approved = True
        db.session.commit()
        return True
    
    @staticmethod
    def count_approved_comments():
        """统计已审核的评论数量"""
        return Comment.query.filter_by(is_deleted=False, is_approved=True).count() 