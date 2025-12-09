from functools import wraps
from flask import abort
from flask_login import current_user

def admin_required(f):
    """
    检查当前用户是否为管理员的装饰器
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin:
            abort(403)  # 无权限访问
        return f(*args, **kwargs)
    return decorated_function 