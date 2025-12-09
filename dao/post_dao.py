from app import db
from model.post import Post
from sqlalchemy import desc

class PostDAO:
    @staticmethod
    def get_post_by_id(post_id):
        """根据ID获取帖子"""
        return Post.query.get(post_id)
    
    @staticmethod
    def get_approved_posts(page=1, per_page=10, sort_by='latest'):
        """获取已审核的帖子"""
        query = Post.query.filter_by(is_deleted=False, is_approved=True)
        
        if sort_by == 'popular':
            query = query.order_by(desc(Post.views))
        else:  # 默认按最新排序
            query = query.order_by(desc(Post.created_at))
            
        return query.paginate(page=page, per_page=per_page)
    
    @staticmethod
    def get_latest_approved_posts(limit=3):
        """获取最新的已审核帖子"""
        return Post.query.filter_by(is_deleted=False, is_approved=True) \
                .order_by(desc(Post.created_at)) \
                .limit(limit) \
                .all()
    
    @staticmethod
    def get_popular_approved_posts(limit=3):
        """获取热门的已审核帖子"""
        return Post.query.filter_by(is_deleted=False, is_approved=True) \
                .order_by(desc(Post.views)) \
                .limit(limit) \
                .all()
    
    @staticmethod
    def get_posts_by_user_id(user_id, include_unapproved=False):
        """获取用户的帖子"""
        query = Post.query.filter_by(user_id=user_id, is_deleted=False)
        
        if not include_unapproved:
            query = query.filter_by(is_approved=True)
            
        return query.order_by(desc(Post.created_at)).all()
    
    @staticmethod
    def get_posts_by_location(location, exclude_post_id=None, limit=3):
        """获取指定地点的帖子"""
        query = Post.query.filter_by(location=location, is_deleted=False, is_approved=True)
        
        if exclude_post_id:
            query = query.filter(Post.id != exclude_post_id)
            
        return query.order_by(desc(Post.views)).limit(limit).all()
    
    @staticmethod
    def create_post(title, content, user_id, location=None, featured_image=None, is_approved=False):
        """创建新帖子"""
        post = Post(
            title=title,
            content=content,
            user_id=user_id,
            location=location,
            featured_image=featured_image,
            is_approved=is_approved
        )
        db.session.add(post)
        db.session.commit()
        return post
    
    @staticmethod
    def update_post(post_id, **kwargs):
        """更新帖子"""
        post = Post.query.get(post_id)
        if not post:
            return None
        
        for key, value in kwargs.items():
            if hasattr(post, key):
                setattr(post, key, value)
        
        db.session.commit()
        return post
    
    @staticmethod
    def delete_post(post_id):
        """删除帖子（软删除）"""
        post = Post.query.get(post_id)
        if not post:
            return False
        
        post.is_deleted = True
        db.session.commit()
        return True
    
    @staticmethod
    def count_approved_posts():
        """统计已审核的帖子数量"""
        return Post.query.filter_by(is_deleted=False, is_approved=True).count() 