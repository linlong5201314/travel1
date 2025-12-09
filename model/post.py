import sys
import os
# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from app import db

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100))
    featured_image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    views = db.Column(db.Integer, default=0)
    is_deleted = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=False)
    destination_type = db.Column(db.String(50))  # 目的地类型标签
    category = db.Column(db.String(50))  # 文章分类标签
    rating = db.Column(db.Float, default=0.0)  # 文章评分
    total_views = db.Column(db.Integer, default=0)  # 目的地总阅读量
    avg_rating = db.Column(db.Float, default=0.0)  # 目的地平均评分
    comment_count = db.Column(db.Integer, default=0)  # 目的地评论数
    growth_trend = db.Column(db.String(50), default='0%')  # 增长趋势
    
    # 外键关系
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # 关系
    comments = db.relationship('Comment', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    bookmarks = db.relationship('Bookmark', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    
    def increment_views(self):
        self.views += 1
        db.session.commit()
    
    def like_count(self):
        from model.bookmark import Bookmark
        return Bookmark.query.filter_by(post_id=self.id, is_liked=True).count()
    
    def comment_count(self):
        from model.comment import Comment
        return Comment.query.filter_by(post_id=self.id).count()
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'location': self.location,
            'featured_image': self.featured_image,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            'views': self.views,
            'user_id': self.user_id,
            'like_count': self.like_count(),
            'comment_count': self.comment_count(),
            'is_approved': self.is_approved,
            'destination_type': self.destination_type,
            'category': self.category,
            'rating': self.rating,
            'total_views': self.total_views,
            'avg_rating': self.avg_rating,
            'growth_trend': self.growth_trend
        }
    
    def __repr__(self):
        return f'<Post {self.title}>' 