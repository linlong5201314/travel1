import os
from flask import render_template, request, redirect, url_for, flash, abort, current_app, jsonify, Blueprint
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename
from datetime import datetime
import uuid
from controllers.forms import PostForm
from utility.file_utils import save_file, allowed_file

# 创建蓝图
bp = Blueprint('main', __name__)

# =================== 新增目的地数据 ===================
# 目的地信息字典，用于详情页展示

destinations_info = {
    "japan": {
        "name": "日本",
        "slug": "japan",
        "continent": "亚洲",
        "image": "img/japan.jpg",
        "description": "探索日本的传统与现代融合，从东京繁华的街道到京都宁静的寺庙，体验丰富的文化遗产和精致的美食。",
        "key_cities": ["东京", "京都", "大阪"],
        "highlights": [
            {"title": "东京塔", "image": "img/tokyo.jpg", "desc": "东京标志性建筑，俯瞰城市全景。"},
            {"title": "清水寺", "image": "img/12.jpg", "desc": "京都历史悠久的古寺，赏樱名所。"},
            {"title": "大阪城", "image": "img/2.jpg", "desc": "日本战国时代著名古城。"}
        ]
    },
    "thailand": {
        "name": "泰国",
        "slug": "thailand",
        "continent": "亚洲",
        "image": "img/thailand.jpg",
        "description": "在泰国沉浸在微笑之国的魅力中，享受热带海滩、辣味美食和独特的寺庙建筑，感受热情好客的文化氛围。",
        "key_cities": ["曼谷", "普吉岛", "清迈"],
        "highlights": [
            {"title": "大皇宫", "image": "img/101.jpg", "desc": "曼谷最著名的地标建筑群。"},
            {"title": "芭东海滩", "image": "img/8.jpg", "desc": "普吉岛热闹的沙滩度假区。"},
            {"title": "白庙", "image": "img/9.jpg", "desc": "清莱独一无二的现代寺庙艺术。"}
        ]
    },
    "china": {
        "name": "中国",
        "slug": "china",
        "continent": "亚洲",
        "image": "img/china.jpg",
        "description": "领略中国丰富的自然景观和五千年文明，从长城的雄伟到桂林山水的秀丽，感受古老与现代共存的魅力。",
        "key_cities": ["北京", "上海", "桂林"],
        "highlights": [
            {"title": "长城", "image": "img/changcheng.jpg", "desc": "世界七大奇迹之一，蜿蜒万里。"},
            {"title": "外滩", "image": "img/waitan.jpg", "desc": "上海标志性的城市天际线。"},
            {"title": "漓江", "image": "img/guilin.jpg", "desc": "桂林山水的精华，烟雨漓江。"}
        ]
    },
    "vietnam": {
        "name": "越南",
        "slug": "vietnam",
        "continent": "亚洲",
        "image": "img/vietnam.jpg",
        "description": "在越南发现迷人的文化和令人惊叹的自然美景，从繁忙的河内到宁静的下龙湾，享受独特的美食和丰富的历史。",
        "key_cities": ["河内", "胡志明市", "下龙湾"],
        "highlights": [
            {"title": "下龙湾", "image": "img/13.jpg", "desc": "世界自然遗产，石灰岩奇景。"},
            {"title": "会安古镇", "image": "img/11.jpg", "desc": "灯笼与历史交织的浪漫老城。"},
            {"title": "岘港美溪海滩", "image": "img/beach.jpg", "desc": "被誉为世界最美海滩之一。"}
        ]
    },
    "italy": {
        "name": "意大利",
        "slug": "italy",
        "continent": "欧洲",
        "image": "img/italy.jpg",
        "description": "在意大利领略文艺复兴的辉煌，品尝正宗的意式美食，探索罗马的古迹、威尼斯的水城和托斯卡纳的乡村风光。",
        "key_cities": ["罗马", "威尼斯", "佛罗伦萨"],
        "highlights": [
            {"title": "罗马斗兽场", "image": "img/4.jpg", "desc": "古罗马帝国的象征。"},
            {"title": "威尼斯大运河", "image": "img/3.jpg", "desc": "浪漫水城的灵魂。"},
            {"title": "托斯卡纳乡村", "image": "img/6.jpg", "desc": "金色田园与葡萄酒庄园。"}
        ]
    },
    "france": {
        "name": "法国",
        "slug": "france",
        "continent": "欧洲",
        "image": "img/france.gif",
        "description": "感受法国的浪漫与艺术气息，在巴黎的街头漫步，在普罗旺斯的薰衣草田中放松，品味世界顶级的美食与葡萄酒。",
        "key_cities": ["巴黎", "尼斯", "普罗旺斯"],
        "highlights": [
            {"title": "埃菲尔铁塔", "image": "img/paris.jpg", "desc": "巴黎标志性建筑，浪漫象征。"},
            {"title": "卢浮宫", "image": "img/7.jpg", "desc": "世界三大博物馆之一。"},
            {"title": "薰衣草田", "image": "img/packing.gif", "desc": "普罗旺斯夏季紫色海洋。"}
        ]
    },
    "spain": {
        "name": "西班牙",
        "slug": "spain",
        "continent": "欧洲",
        "image": "img/spain.jpg",
        "description": "探索西班牙多元的文化和热情的生活方式，从马德里的艺术到巴塞罗那的建筑，体验弗拉门戈和午夜小食的魅力。",
        "key_cities": ["马德里", "巴塞罗那", "塞维利亚"],
        "highlights": [
            {"title": "圣家堂", "image": "img/story4.jpg", "desc": "高迪未完的建筑杰作。"},
            {"title": "塞维利亚王宫", "image": "img/story3.jpg", "desc": "摩尔与哥特风格交汇。"},
            {"title": "马德里艺术金三角", "image": "img/story2.jpg", "desc": "普拉多等世界级博物馆聚集。"}
        ]
    },
    "switzerland": {
        "name": "瑞士",
        "slug": "switzerland",
        "continent": "欧洲",
        "image": "img/switzerland.jpg",
        "description": "在瑞士的阿尔卑斯山脉中徒步，欣赏壮丽的湖泊和山峰，探索迷人的小镇，品尝巧克力、奶酪和精致的瑞士钟表工艺。",
        "key_cities": ["苏黎世", "琉森", "因特拉肯"],
        "highlights": [
            {"title": "少女峰", "image": "img/adventure.jpg", "desc": "阿尔卑斯山的著名雪峰。"},
            {"title": "卢塞恩湖", "image": "img/booking.jpg", "desc": "湖光山色交映的瑞士明珠。"},
            {"title": "因特拉肯滑翔伞", "image": "img/digital-nomad.jpg", "desc": "极限运动爱好者的天堂。"}
        ]
    }
}
# =====================================================

# 允许的图片扩展名
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'heic', 'ico'}

def allowed_file(filename):
    # 增加更多允许的文件扩展名
    global ALLOWED_EXTENSIONS
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'svg', 'heic', 'ico', 
                         'jfif', 'pjpeg', 'pjp', 'avif', 'apng'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 首页
@bp.route('/')
@bp.route('/index')
def index():
    # 只获取已审核的帖子
    posts = current_app.Post.query.filter_by(is_deleted=False, is_approved=True).order_by(current_app.Post.created_at.desc()).limit(3).all()
    total_users = current_app.User.query.count()
    total_posts = current_app.Post.query.filter_by(is_deleted=False, is_approved=True).count()
    total_comments = current_app.Comment.query.filter_by(is_deleted=False, is_approved=True).count()
    return render_template('main/index.html', title='首页', 
                          posts=posts, 
                          total_users=total_users,
                          total_posts=total_posts,
                          total_comments=total_comments)

# 目的地页面
@bp.route('/destinations')
def destinations():
    return render_template('main/destinations.html', title='目的地')

# 目的地详情页面
@bp.route('/destination/<slug>')
def destination_detail(slug):
    info = destinations_info.get(slug)
    if not info:
        abort(404)
    # 获取与目的地相关的已审核帖子（如果有）
    posts = current_app.Post.query.filter(
        current_app.Post.is_deleted == False,
        current_app.Post.is_approved == True,
        current_app.Post.location.like(f"%{info['name']}%")
    ).order_by(current_app.Post.views.desc()).limit(6).all()
    return render_template('main/destination_detail.html', title=info['name'], info=info, posts=posts)

# 旅行贴士页面
@bp.route('/tips')
def tips():
    return render_template('main/tips.html', title='旅行贴士')

# 关于我们页面
@bp.route('/about')
def about():
    return render_template('main/about.html', title='关于我们')

# 旅行故事页面
@bp.route('/posts')
def posts():
    # 检查用户是否登录
    if not current_user.is_authenticated:
        flash('请登录后查看和发布旅行故事', 'info')
        return redirect(url_for('auth.login', next=url_for('main.posts')))
        
    page = request.args.get('page', 1, type=int)
    sort = request.args.get('sort', 'latest')
    
    # 只显示已审核且未删除的帖子
    base_query = current_app.Post.query.filter_by(is_deleted=False, is_approved=True)
    
    if sort == 'popular':
        # 按浏览量排序热门帖子
        posts = base_query.order_by(current_app.Post.views.desc()).paginate(page=page, per_page=9)
    else:
        # 默认按时间最新排序
        posts = base_query.order_by(current_app.Post.created_at.desc()).paginate(page=page, per_page=9)
    
    return render_template('main/posts.html', title='旅行故事', posts=posts)

# 查看帖子详情
@bp.route('/post/<int:post_id>')
def post(post_id):
    post = current_app.Post.query.get_or_404(post_id)
    
    # 如果帖子被删除或未通过审核，且用户不是作者或管理员，则显示404
    if post.is_deleted or (not post.is_approved and (not current_user.is_authenticated or 
                                                  (current_user.id != post.user_id and not current_user.is_admin))):
        abort(404)
    
    # 增加阅读量
    post.increment_views()
    
    # 获取已审核的评论
    comments = current_app.Comment.query.filter_by(
        post_id=post_id, 
        parent_id=None, 
        is_deleted=False,
        is_approved=True
    ).order_by(current_app.Comment.created_at.desc()).all()
    
    # 如果用户是帖子作者或管理员，也显示未审核的评论
    if current_user.is_authenticated and (current_user.id == post.user_id or current_user.is_admin):
        pending_comments = current_app.Comment.query.filter_by(
            post_id=post_id, 
            parent_id=None, 
            is_deleted=False,
            is_approved=False
        ).order_by(current_app.Comment.created_at.desc()).all()
        
        # 在评论列表前添加未审核评论
        all_comments = pending_comments + comments
    else:
        all_comments = comments
    
    # 检查用户是否收藏了此帖子
    is_bookmarked = False
    has_liked = False
    if current_user.is_authenticated:
        bookmark = current_app.Bookmark.query.filter_by(user_id=current_user.id, post_id=post_id).first()
        if bookmark:
            is_bookmarked = True
            has_liked = bookmark.is_liked
    
    # 获取相关故事（同一位置或同一作者的其他已审核故事）
    related_posts = []
    if post.location:
        # 查找同一地点的其他故事
        location_posts = current_app.Post.query.filter(
            current_app.Post.id != post_id,
            current_app.Post.is_deleted == False,
            current_app.Post.is_approved == True,
            current_app.Post.location == post.location
        ).order_by(current_app.Post.views.desc()).limit(3).all()
        related_posts.extend(location_posts)
    
    # 如果相关故事不足3个，添加作者的其他故事
    if len(related_posts) < 3:
        author_posts = current_app.Post.query.filter(
            current_app.Post.id != post_id,
            current_app.Post.is_deleted == False,
            current_app.Post.is_approved == True,
            current_app.Post.user_id == post.user_id,
            ~current_app.Post.id.in_([p.id for p in related_posts]) if related_posts else True
        ).order_by(current_app.Post.created_at.desc()).limit(3 - len(related_posts)).all()
        related_posts.extend(author_posts)
    
    # 如果还不足3个，添加热门故事
    if len(related_posts) < 3:
        popular_posts = current_app.Post.query.filter(
            current_app.Post.id != post_id,
            current_app.Post.is_deleted == False,
            current_app.Post.is_approved == True,
            ~current_app.Post.id.in_([p.id for p in related_posts]) if related_posts else True
        ).order_by(current_app.Post.views.desc()).limit(3 - len(related_posts)).all()
        related_posts.extend(popular_posts)
    
    back_url = request.referrer or url_for('main.posts')
    return render_template('main/post.html', title=post.title, post=post, comments=all_comments, 
                           is_bookmarked=is_bookmarked, has_liked=has_liked, related_posts=related_posts,
                           back_url=back_url)

# 创建新帖子
@bp.route('/create_post', methods=['GET', 'POST'])
@login_required
def create_post():
    form = PostForm()
    
    if form.validate_on_submit():
        # 管理员创建的帖子自动审核通过，普通用户需要审核
        is_auto_approved = current_user.is_admin
        
        post = current_app.Post(
            title=form.title.data,
            content=form.content.data,
            location=form.location.data,
            user_id=current_user.id,
            is_approved=is_auto_approved
        )
        
        # 处理封面图片
        if form.featured_image.data:
            unique_filename = save_file(form.featured_image.data, 'uploads/posts')
            if unique_filename:
                post.featured_image = unique_filename
        
        # 处理多张附加图片
        images = request.files.getlist('images')
        for img in images:
            unique_filename = save_file(img, 'uploads/posts')
            if unique_filename:
                post_image = current_app.PostImage(filename=unique_filename)
                post.images.append(post_image)
        
        # 如果未上传封面图片，自动将第一张附图设为封面
        if not post.featured_image and post.images:
            first_img = post.images[0]
            post.featured_image = first_img.filename
        
        current_app.db.session.add(post)
        current_app.db.session.commit()
        
        if is_auto_approved:
            flash('游记发布成功！', 'success')
        else:
            flash('游记已提交，等待管理员审核后显示', 'info')
            
        return redirect(url_for('main.post', post_id=post.id))
    
    return render_template('main/create_post.html', title='发布游记', form=form)

# 编辑帖子
@bp.route('/edit_post/<int:post_id>', methods=['GET', 'POST'])
@login_required
def edit_post(post_id):
    post = current_app.Post.query.get_or_404(post_id)
    form = PostForm()
    
    # 检查权限
    if post.user_id != current_user.id and not current_user.is_admin:
        abort(403)
    
    if form.validate_on_submit():
        post.title = form.title.data
        post.content = form.content.data
        post.location = form.location.data
        
        # 处理封面图片
        if form.featured_image.data:
            unique_filename = save_file(form.featured_image.data, 'uploads/posts')
            if unique_filename:
                post.featured_image = unique_filename
        
        # 处理多张附加图片（追加，不删除旧图）
        images = request.files.getlist('images')
        for img in images:
            unique_filename = save_file(img, 'uploads/posts')
            if unique_filename:
                post_image = current_app.PostImage(filename=unique_filename)
                post.images.append(post_image)
        
        # 如果尚无封面图片，设置第一张附图为封面
        if not post.featured_image and post.images:
            post.featured_image = post.images[0].filename
        
        current_app.db.session.commit()
        flash('游记更新成功！', 'success')
        return redirect(url_for('main.post', post_id=post.id))
    
    # 预填充表单
    elif request.method == 'GET':
        form.title.data = post.title
        form.location.data = post.location
        form.content.data = post.content
    
    return render_template('main/edit_post.html', title='编辑游记', post=post, form=form)

# 删除帖子
@bp.route('/delete_post/<int:post_id>', methods=['POST'])
@login_required
def delete_post(post_id):
    post = current_app.Post.query.get_or_404(post_id)
    
    # 检查权限
    if post.user_id != current_user.id and not current_user.is_admin:
        abort(403)
    
    post.is_deleted = True
    current_app.db.session.commit()
    flash('游记已删除！', 'success')
    return redirect(url_for('main.index'))

# 添加评论
@bp.route('/add_comment/<int:post_id>', methods=['POST'])
@login_required
def add_comment(post_id):
    post = current_app.Post.query.get_or_404(post_id)
    content = request.form.get('content')
    parent_id = request.form.get('parent_id')
    
    if not content:
        flash('评论内容不能为空', 'danger')
        return redirect(url_for('main.post', post_id=post_id))
    
    # 创建评论, 默认需要审核 (管理员和作者自己评论自己的帖子除外)
    is_auto_approved = current_user.is_admin or (current_user.id == post.user_id)
    
    comment = current_app.Comment(
        content=content, 
        user_id=current_user.id, 
        post_id=post_id,
        is_approved=is_auto_approved
    )
    
    if parent_id:
        parent_comment = current_app.Comment.query.get(parent_id)
        if parent_comment and parent_comment.post_id == post_id:
            comment.parent_id = parent_id
    
    current_app.db.session.add(comment)
    current_app.db.session.commit()
    
    if is_auto_approved:
        flash('评论成功！', 'success')
    else:
        flash('评论已提交，等待审核后显示', 'info')
    
    return redirect(url_for('main.post', post_id=post_id))

# 用户个人主页
@bp.route('/user/<username>')
def user_profile(username):
    user = current_app.User.query.filter_by(username=username).first_or_404()
    if user.is_deleted:
        abort(404)
    
    page = request.args.get('page', 1, type=int)
    
    # 对于查看自己的主页或管理员，显示所有未删除帖子；否则只显示已审核的帖子
    if current_user.is_authenticated and (current_user.id == user.id or current_user.is_admin):
        posts = current_app.Post.query.filter_by(user_id=user.id, is_deleted=False).order_by(current_app.Post.created_at.desc()).paginate(page=page, per_page=5)
    else:
        posts = current_app.Post.query.filter_by(user_id=user.id, is_deleted=False, is_approved=True).order_by(current_app.Post.created_at.desc()).paginate(page=page, per_page=5)
    
    return render_template('main/user_profile.html', title=f'{user.username}的主页', user=user, posts=posts)

# 用户的帖子列表
@bp.route('/my_posts')
@login_required
def user_posts():
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')
    
    query = current_app.Post.query.filter_by(user_id=current_user.id, is_deleted=False)
    
    if status == 'pending':
        query = query.filter_by(is_approved=False)
    elif status == 'approved':
        query = query.filter_by(is_approved=True)
    
    posts = query.order_by(current_app.Post.created_at.desc()).paginate(page=page, per_page=10)
    return render_template('main/user_posts.html', title='我的游记', posts=posts, status=status)

# 收藏功能
@bp.route('/bookmark/<int:post_id>', methods=['POST'])
@login_required
def bookmark_post(post_id):
    # 检查CSRF令牌
    if request.is_json:
        # 对于JSON请求，CSRF令牌应该在X-CSRFToken头部
        csrf_token = request.headers.get('X-CSRFToken')
        from flask_wtf.csrf import validate_csrf
        try:
            validate_csrf(csrf_token)
        except:
            return jsonify({'error': 'CSRF token missing or invalid'}), 400
    
    post = current_app.Post.query.get_or_404(post_id)
    bookmark = current_app.Bookmark.query.filter_by(user_id=current_user.id, post_id=post_id).first()
    
    if bookmark:
        current_app.db.session.delete(bookmark)
        current_app.db.session.commit()
        return jsonify({'status': 'unbookmarked'})
    else:
        bookmark = current_app.Bookmark(user_id=current_user.id, post_id=post_id)
        current_app.db.session.add(bookmark)
        current_app.db.session.commit()
        return jsonify({'status': 'bookmarked'})

# 点赞功能
@bp.route('/like/<int:post_id>', methods=['POST'])
@login_required
def like_post(post_id):
    # 检查CSRF令牌
    if request.is_json:
        # 对于JSON请求，CSRF令牌应该在X-CSRFToken头部
        csrf_token = request.headers.get('X-CSRFToken')
        from flask_wtf.csrf import validate_csrf
        try:
            validate_csrf(csrf_token)
        except:
            return jsonify({'error': 'CSRF token missing or invalid'}), 400
    
    post = current_app.Post.query.get_or_404(post_id)
    bookmark = current_app.Bookmark.query.filter_by(user_id=current_user.id, post_id=post_id).first()
    
    if bookmark:
        bookmark.is_liked = not bookmark.is_liked
    else:
        bookmark = current_app.Bookmark(user_id=current_user.id, post_id=post_id, is_liked=True)
        current_app.db.session.add(bookmark)
    
    current_app.db.session.commit()
    return jsonify({'status': 'liked' if bookmark.is_liked else 'unliked', 'likes': post.like_count()})

# 查看收藏列表
@bp.route('/my_bookmarks')
@login_required
def user_bookmarks():
    page = request.args.get('page', 1, type=int)
    bookmarks = current_app.Bookmark.query.filter_by(user_id=current_user.id).join(current_app.Post).filter(current_app.Post.is_deleted==False).order_by(current_app.Bookmark.created_at.desc()).paginate(page=page, per_page=10)
    return render_template('main/bookmarks.html', title='我的收藏', bookmarks=bookmarks)

# 搜索功能
@bp.route('/search')
def search():
    query = request.args.get('q', '')
    if not query:
        return redirect(url_for('main.index'))
    
    page = request.args.get('page', 1, type=int)
    posts = current_app.Post.query.filter(
        current_app.Post.is_deleted==False,
        (current_app.Post.title.contains(query) | current_app.Post.content.contains(query) | current_app.Post.location.contains(query))
    ).order_by(current_app.Post.created_at.desc()).paginate(page=page, per_page=10)
    
    return render_template('main/search_results.html', title=f'搜索: {query}', posts=posts, query=query)

# 删除评论
@bp.route('/delete_comment/<int:comment_id>', methods=['POST'])
@login_required
def delete_comment(comment_id):
    comment = current_app.Comment.query.get_or_404(comment_id)
    post_id = comment.post_id
    
    # 检查权限（只有评论作者或管理员可以删除）
    if comment.user_id != current_user.id and not current_user.is_admin:
        abort(403)
    
    # 删除回复
    for reply in comment.replies:
        current_app.db.session.delete(reply)
    
    current_app.db.session.delete(comment)
    current_app.db.session.commit()
    flash('评论已删除！', 'success')
    return redirect(url_for('main.post', post_id=post_id))

# 数据分析与地图可视化
@bp.route('/data_analysis')
@login_required
def data_analysis():
    # 检查用户是否为管理员
    if not current_user.is_admin:
        flash('只有管理员可以访问数据分析页面', 'danger')
        return redirect(url_for('main.index'))
        
    # 获取帖子地点统计数据
    location_stats = current_app.db.session.query(
        current_app.Post.location, 
        current_app.db.func.count(current_app.Post.id)
    ).filter(
        current_app.Post.is_deleted == False,
        current_app.Post.is_approved == True,
        current_app.Post.location != None,
        current_app.Post.location != ''
    ).group_by(current_app.Post.location).all()
    
    # 获取帖子时间统计数据
    time_stats = current_app.db.session.query(
        current_app.db.func.date_format(current_app.Post.created_at, '%Y-%m'),
        current_app.db.func.count(current_app.Post.id)
    ).filter(
        current_app.Post.is_deleted == False,
        current_app.Post.is_approved == True
    ).group_by(current_app.db.func.date_format(current_app.Post.created_at, '%Y-%m')).all()
    
    # 转换为适合前端的格式
    location_data = [{"name": loc, "value": count} for loc, count in location_stats]
    time_data = [{"date": date, "count": count} for date, count in time_stats]
    
    # 如果没有数据，添加一些测试数据以便显示地图效果
    if not location_data:
        # 添加一些示例数据
        sample_locations = [
            {"name": "北京", "value": 25},
            {"name": "上海", "value": 20},
            {"name": "广州", "value": 15},
            {"name": "深圳", "value": 12},
            {"name": "成都", "value": 18},
            {"name": "杭州", "value": 10},
            {"name": "西安", "value": 8},
            {"name": "三亚", "value": 7},
            {"name": "丽江", "value": 6},
            {"name": "厦门", "value": 5}
        ]
        location_data = sample_locations
    
    # 如果没有时间数据，添加一些测试数据
    if not time_data:
        # 添加一些示例数据
        sample_times = [
            {"date": "2024-01", "count": 5},
            {"date": "2024-02", "count": 8},
            {"date": "2024-03", "count": 12},
            {"date": "2024-04", "count": 10},
            {"date": "2024-05", "count": 15},
            {"date": "2024-06", "count": 20},
            {"date": "2024-07", "count": 18}
        ]
        time_data = sample_times
    
    # 添加缓存控制参数，防止浏览器缓存
    cache_control = int(datetime.now().timestamp())
    
    return render_template('main/data_analysis.html', 
                          title='数据分析', 
                          location_data=location_data,
                          time_data=time_data,
                          cache_control=cache_control)

# 测试UEditor
@bp.route('/test_ueditor')
def test_ueditor():
    return render_template('test_ueditor.html') 