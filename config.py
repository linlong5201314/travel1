import os
from dotenv import load_dotenv

# 加载.env文件中的环境变量
load_dotenv()

# 数据库配置 - 优先使用环境变量，用于Railway部署
# 本地开发时使用SQLite，Railway部署时使用PostgreSQL
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///global_travel_blog.db')

# 应用配置
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_key_for_global_travel_blog')
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = False # 禁用SQL查询日志

# 根据环境设置DEBUG模式，生产环境下应该为False
DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 't')

# 上传文件配置
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB 文件大小限制 

# 高德地图API配置 (已废弃，保留注释备查)
# AMAP_API_KEY = '3c2c19a35fc0c1d08e6f39afde9b6a1c' 