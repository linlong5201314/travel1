import os
from flask import render_template, redirect, url_for, flash, request, current_app, Blueprint
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.utils import secure_filename
from datetime import datetime
from utility.file_utils import save_file
import uuid

# 创建蓝图
bp = Blueprint('auth', __name__)

# 登录页面
@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    # 记录来源页面，如果是从旅行故事页面跳转过来的
    next_page = request.args.get('next')
    from_posts = next_page and 'posts' in next_page
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = 'remember' in request.form
        
        user = current_app.User.query.filter_by(username=username).first()
        
        if user is None or not user.check_password(password):
            flash('用户名或密码错误', 'danger')
            return redirect(url_for('auth.login', next=next_page))
        
        if not user.is_active:
            flash('账号已被禁用，请联系管理员', 'danger')
            return redirect(url_for('auth.login', next=next_page))
        
        login_user(user, remember=remember)
        
        # 更新最后登录时间
        user.last_seen = datetime.utcnow()
        current_app.db.session.commit()
        
        if not next_page or not next_page.startswith('/'):
            next_page = url_for('main.index')
            
        flash('登录成功！', 'success')
        return redirect(next_page)
    
    return render_template('auth/login.html', title='登录', from_posts=from_posts)

# 注册页面
@bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        password2 = request.form.get('password2')
        
        if not all([username, email, password, password2]):
            flash('所有字段都必须填写', 'danger')
            return redirect(url_for('auth.register'))
        
        if password != password2:
            flash('两次输入的密码不一致', 'danger')
            return redirect(url_for('auth.register'))
        
        if current_app.User.query.filter_by(username=username).first():
            flash('用户名已被注册', 'danger')
            return redirect(url_for('auth.register'))
        
        if current_app.User.query.filter_by(email=email).first():
            flash('邮箱已被注册', 'danger')
            return redirect(url_for('auth.register'))
        
        user = current_app.User(username=username, email=email, password=password)
        current_app.db.session.add(user)
        current_app.db.session.commit()
        
        flash('注册成功！请登录', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html', title='注册')

# 退出登录
@bp.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))

# 个人资料页面
@bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        # 从表单获取数据
        username = request.form.get('username')
        email = request.form.get('email')
        current_password = request.form.get('current_password')
        new_password = request.form.get('new_password')
        
        # 用户名和邮箱更新
        if username and username != current_user.username:
            if current_app.User.query.filter_by(username=username).first():
                flash('用户名已被占用', 'danger')
            else:
                current_user.username = username
        
        if email and email != current_user.email:
            if current_app.User.query.filter_by(email=email).first():
                flash('邮箱已被注册', 'danger')
            else:
                current_user.email = email
        
        # 密码更新
        if current_password and new_password:
            if not current_user.check_password(current_password):
                flash('当前密码不正确', 'danger')
            else:
                current_user.set_password(new_password)
                flash('密码已更新', 'success')
        
        # 头像更新
        if 'avatar' in request.files:
            file = request.files['avatar']
            if file and file.filename:
                unique_filename = save_file(file, 'uploads/profiles')
                if unique_filename:
                    current_user.avatar_url = unique_filename
        
        current_app.db.session.commit()
        flash('个人资料已更新', 'success')
        return redirect(url_for('auth.profile'))
    
    return render_template('auth/profile.html', title='个人资料')

# 账号设置页面 (用于管理后台)
@bp.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    # 重定向到profile页面，因为它们功能相同
    return redirect(url_for('auth.profile')) 