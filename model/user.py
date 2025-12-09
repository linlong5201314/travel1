import sys
import os
# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask import current_app

class User(UserMixin):
    __tablename__ = 'users'
    
    id = current_app.db.Column(current_app.db.Integer, primary_key=True)
    username = current_app.db.Column(current_app.db.String(64), index=True, nullable=False)
    email = current_app.db.Column(current_app.db.String(120), index=True, nullable=False)
    password_hash = current_app.db.Column(current_app.db.String(128), nullable=False)
    role = current_app.db.Column(current_app.db.String(10), default='user', nullable=False)  # 'user' 或 'admin'
    created_at = current_app.db.Column(current_app.db.DateTime, default=datetime.utcnow, nullable=False)
    is_deleted = current_app.db.Column(current_app.db.Boolean, default=False, nullable=False)
    avatar_url = current_app.db.Column(current_app.db.String(255), default=None)
    is_active = current_app.db.Column(current_app.db.Boolean, default=True, nullable=False)
    last_seen = current_app.db.Column(current_app.db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    activity_score = current_app.db.Column(current_app.db.Float, default=0.0)  # 用户活跃度
    
    # 关系
    posts = current_app.db.relationship('Post', backref='author', lazy='dynamic', cascade="all, delete-orphan")
    comments = current_app.db.relationship('Comment', backref='author', lazy='dynamic', cascade="all, delete-orphan")
    bookmarks = current_app.db.relationship('Bookmark', backref='user', lazy='dynamic', cascade="all, delete-orphan")
    
    # 添加复合唯一约束，当is_deleted=False时username和email唯一
    __table_args__ = (
        current_app.db.UniqueConstraint('username', 'is_deleted', name='uix_username_not_deleted'),
        current_app.db.UniqueConstraint('email', 'is_deleted', name='uix_email_not_deleted'),
    )
    
    def __init__(self, username, email, password, role='user'):
        self.username = username
        self.email = email
        self.set_password(password)
        self.role = role
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'is_active': self.is_active,
            'avatar_url': self.avatar_url,
            'last_seen': self.last_seen.strftime('%Y-%m-%d %H:%M:%S') if self.last_seen else None,
            'activity_score': self.activity_score
        }
    
    def __repr__(self):
        return f'<User {self.username}>' 