from app import db
from model.user import User

class UserDAO:
    @staticmethod
    def get_user_by_id(user_id):
        """根据ID获取用户"""
        return User.query.get(user_id)
    
    @staticmethod
    def get_user_by_username(username):
        """根据用户名获取用户"""
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def get_user_by_email(email):
        """根据邮箱获取用户"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def create_user(username, email, password):
        """创建新用户"""
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user
    
    @staticmethod
    def update_user(user_id, **kwargs):
        """更新用户信息"""
        user = User.query.get(user_id)
        if not user:
            return None
        
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        db.session.commit()
        return user
    
    @staticmethod
    def delete_user(user_id):
        """删除用户"""
        user = User.query.get(user_id)
        if not user:
            return False
        
        db.session.delete(user)
        db.session.commit()
        return True
    
    @staticmethod
    def get_all_users():
        """获取所有用户"""
        return User.query.all()
    
    @staticmethod
    def count_users():
        """统计用户数量"""
        return User.query.count() 