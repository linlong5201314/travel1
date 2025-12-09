import os

# 数据库配置 - 使用SQLite简化开发
# 数据库URI
DATABASE_URL = 'sqlite:///global_travel_blog.db'

# 应用配置
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_key_for_global_travel_blog')
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = False # 禁用SQL查询日志
DEBUG = True 

# 上传文件配置
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB 文件大小限制 

# 高德地图API配置 (已废弃，保留注释备查)
# AMAP_API_KEY = '3c2c19a35fc0c1d08e6f39afde9b6a1c' 