import os
import sys
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_moment import Moment
from flask_wtf.csrf import CSRFProtect
from flask_caching import Cache
from datetime import datetime
from config import DATABASE_URL, SECRET_KEY, SQLALCHEMY_TRACK_MODIFICATIONS

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 初始化扩展
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
moment = Moment()
csrf = CSRFProtect()
cache = Cache()

# 缓存配置
cache_config = {
    "CACHE_TYPE": "simple",  # 使用内存缓存，适合单机部署
    "CACHE_DEFAULT_TIMEOUT": 300,  # 缓存过期时间为5分钟
    "CACHE_THRESHOLD": 500  # 最多缓存500个项目
}



def create_app():
    app = Flask(__name__, 
                template_folder='templates',
                static_folder='static')
    
    # 配置
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads')
    
    # 优化静态文件处理，避免sendfile系统调用问题
    app.config['USE_X_SENDFILE'] = False
    
    # 增加静态文件缓存时间
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 3600
    
    # 确保上传目录存在
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads/profiles'), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads/posts'), exist_ok=True)
    
    # 初始化扩展
    db.init_app(app)
    migrate.init_app(app, db)
    moment.init_app(app)
    csrf.init_app(app)
    cache.init_app(app, config=cache_config)
    
    # 配置CSRF保护，使其支持AJAX请求
    app.config['WTF_CSRF_CHECK_DEFAULT'] = False  # 关闭默认的CSRF检查，我们将手动处理
    app.config['WTF_CSRF_HEADERS'] = ['X-CSRFToken']  # 指定CSRF令牌的头部名称
    
    # 设置登录管理
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = '请先登录以访问此页面'
    login_manager.login_message_category = 'info'
    
    # 导入模型
    from flask_login import UserMixin
    from werkzeug.security import generate_password_hash, check_password_hash
    
    # 定义模型
    class User(UserMixin, db.Model):
        __tablename__ = 'users'
        
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(64), index=True, nullable=False)
        email = db.Column(db.String(120), index=True, nullable=False)
        password_hash = db.Column(db.String(256), nullable=False)
        role = db.Column(db.String(10), default='user', nullable=False)  # 'user' 或 'admin'
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        is_deleted = db.Column(db.Boolean, default=False, nullable=False)
        avatar_url = db.Column(db.String(255), default=None)
        is_active = db.Column(db.Boolean, default=True, nullable=False)
        last_seen = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        activity_score = db.Column(db.Float, default=0.0)  # 用户活跃度评分
        
        # 添加复合唯一约束，当is_deleted=False时username和email唯一
        __table_args__ = (
            db.UniqueConstraint('username', 'is_deleted', name='uix_username_not_deleted'),
            db.UniqueConstraint('email', 'is_deleted', name='uix_email_not_deleted'),
        )
        
        def __init__(self, username, email, password=None, role='user'):
            self.username = username
            self.email = email
            if password:
                self.set_password(password)
            self.role = role
        
        def set_password(self, password):
            self.password_hash = generate_password_hash(password)
        
        def check_password(self, password):
            return check_password_hash(self.password_hash, password)
        
        @property
        def is_admin(self):
            return self.role == 'admin'
    
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
        category = db.Column(db.String(50))  # 文章分类
        destination_type = db.Column(db.String(50))  # 目的地类型
        rating = db.Column(db.Float, default=0.0)  # 文章评分
        total_views = db.Column(db.Integer, default=0)  # 目的地总阅读量
        avg_rating = db.Column(db.Float, default=0.0)  # 目的地平均评分
        comment_count = db.Column(db.Integer, default=0)  # 帖子评论数缓存
        like_count_cache = db.Column(db.Integer, default=0)  # 帖子点赞数缓存
        growth_trend = db.Column(db.String(50), default='0%')  # 增长趋势
        
        # 外键关系
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        
        # 关系
        author = db.relationship('User', backref=db.backref('posts', lazy='dynamic'))
        
        def increment_views(self):
            """异步增加阅读量，避免阻塞请求"""
            from concurrent.futures import ThreadPoolExecutor
            import threading
            
            def update_views():
                # 在新线程中更新阅读量
                with threading.Lock():
                    # 获取最新的帖子数据
                    post = Post.query.get(self.id)
                    if post:
                        post.views += 1
                        db.session.commit()
            
            # 使用线程池异步执行
            executor = ThreadPoolExecutor(max_workers=1)
            executor.submit(update_views)
        
        def like_count(self):
            """获取帖子的点赞数量"""
            return self.like_count_cache
        
        def update_like_count(self):
            """更新帖子的点赞数量"""
            self.like_count_cache = Like.query.filter_by(post_id=self.id).count()
            db.session.commit()
        
        def update_comment_count(self):
            """更新帖子的评论数量"""
            self.comment_count = Comment.query.filter_by(post_id=self.id, is_deleted=False).count()
            db.session.commit()
    
    class Comment(db.Model):
        __tablename__ = 'comments'
        
        id = db.Column(db.Integer, primary_key=True)
        content = db.Column(db.Text, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        is_deleted = db.Column(db.Boolean, default=False)
        is_approved = db.Column(db.Boolean, default=False)
        
        # 外键关系
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
        parent_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=True)
        
        # 关系
        author = db.relationship('User', backref=db.backref('comments', lazy='dynamic'))
        post = db.relationship('Post', backref=db.backref('comments', lazy='dynamic'))
        replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')
    
    class Bookmark(db.Model):
        __tablename__ = 'bookmarks'
        
        id = db.Column(db.Integer, primary_key=True)
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        is_liked = db.Column(db.Boolean, default=False)  # 是否点赞
        
        # 外键关系
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
        
        # 关系
        user = db.relationship('User', backref=db.backref('bookmarks', lazy='dynamic'))
        post = db.relationship('Post', backref=db.backref('bookmarks', lazy='dynamic'))
        
        # 唯一约束，确保一个用户只能收藏一篇文章一次
        __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='uq_user_post'),)
    
    class Like(db.Model):
        __tablename__ = 'likes'
        
        id = db.Column(db.Integer, primary_key=True)
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        
        # 外键关系
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
        
        # 关系
        user = db.relationship('User', backref=db.backref('likes', lazy='dynamic'))
        post = db.relationship('Post', backref=db.backref('likes', lazy='dynamic'))
        
        # 唯一约束，确保一个用户只能点赞一篇文章一次
        __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='uq_user_post_like'),)
    
    class PostImage(db.Model):
        __tablename__ = 'post_images'
        id = db.Column(db.Integer, primary_key=True)
        filename = db.Column(db.String(255), nullable=False)
        post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
 
        post = db.relationship('Post', backref=db.backref('images', lazy='dynamic', cascade='all, delete-orphan'))
    
    # 将模型添加到应用上下文
    app.User = User
    app.Post = Post
    app.Comment = Comment
    app.Bookmark = Bookmark
    app.Like = Like
    app.PostImage = PostImage
    app.db = db
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # 数据库事件监听器，用于更新帖子的点赞和评论计数
    from sqlalchemy import event
    
    # 当Like记录被添加或删除时，更新帖子的点赞计数
    @event.listens_for(Like, 'after_insert')
    @event.listens_for(Like, 'after_delete')
    def update_post_like_count(mapper, connection, target):
        # 更新帖子的点赞计数
        post = Post.query.get(target.post_id)
        if post:
            post.update_like_count()
    
    # 当Comment记录被添加、删除或更新时，更新帖子的评论计数
    @event.listens_for(Comment, 'after_insert')
    @event.listens_for(Comment, 'after_delete')
    @event.listens_for(Comment, 'after_update')
    def update_post_comment_count(mapper, connection, target):
        # 更新帖子的评论计数
        post = Post.query.get(target.post_id)
        if post:
            post.update_comment_count()
    
    # 注册蓝图
    from controllers.routes import bp as main_bp
    app.register_blueprint(main_bp)
    
    from controllers.auth_routes import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    from controllers.admin_routes import bp as admin_bp
    app.register_blueprint(admin_bp)
    
    # 添加全局上下文处理器
    @app.context_processor
    def inject_now():
        return {'now': datetime.utcnow()}
    
    return app

# 创建应用实例
app = create_app()

if __name__ == '__main__':
    # 创建所有表
    try:
        with app.app_context():
            db.create_all()
            logger.info("成功创建所有数据库表")
            
            # 检查并创建初始管理员用户
            admin_user = app.User.query.filter_by(role='admin').first()
            if not admin_user:
                admin = app.User(
                    username='admin', 
                    email='admin@example.com', 
                    password='Admin123', 
                    role='admin'
                )
                admin.activity_score = 100.0  # 设置活跃度
                db.session.add(admin)
                db.session.commit()
                logger.info("已创建初始管理员账号: admin@example.com (密码: Admin123)")
    except Exception as e:
        logger.error(f"创建数据库表时出错: {str(e)}")
        exit(1)
        
    # 运行应用
    debug_mode = app.config.get('DEBUG', False)
    logger.info(f"应用启动于: http://0.0.0.0:5000/ {'(调试模式)' if debug_mode else '(生产模式)'}")
    app.run(host='0.0.0.0', debug=debug_mode) 