import sys
import os
# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from app import db

class Bookmark(db.Model):
    __tablename__ = 'bookmarks'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_liked = db.Column(db.Boolean, default=False)  # 是否点赞
    
    # 外键关系
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    
    # 唯一约束，确保一个用户只能收藏一篇文章一次
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='uq_user_post'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'is_liked': self.is_liked,
            'user_id': self.user_id,
            'post_id': self.post_id
        }
    
    def __repr__(self):
        return f'<Bookmark {self.id}>' 