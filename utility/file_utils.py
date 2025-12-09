import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename

def allowed_file(filename, allowed_extensions=None):
    """检查文件扩展名是否允许"""
    if allowed_extensions is None:
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'heic', 'ico'}
        
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def is_image_mimetype(file):
    """检查文件是否为图片MIME类型"""
    if hasattr(file, 'content_type'):
        # 检查MIME类型是否以image/开头
        is_image = file.content_type.startswith('image/')
        print(f"DEBUG: 文件MIME类型: {file.content_type}, 是图片: {is_image}")
        return is_image
    return False

def save_file(file, folder='uploads', allowed_extensions=None):
    """保存上传的文件并返回唯一文件名"""
    if not file or not file.filename:
        print(f"DEBUG: 文件为空或没有文件名")
        return None
    
    filename = secure_filename(file.filename)
    if not filename:
        print(f"DEBUG: 安全文件名生成失败")
        return None
    
    # 输出文件信息以便调试
    print(f"DEBUG: 正在处理文件: {file.filename}, 安全文件名: {filename}")
    print(f"DEBUG: 文件MIME类型: {file.content_type if hasattr(file, 'content_type') else '未知'}")
    
    # 先检查MIME类型
    if is_image_mimetype(file):
        print("DEBUG: 文件通过MIME类型检查，确认为图像类型")
        # 如果是图片MIME类型，直接通过
        pass
    else:
        # 检查文件扩展名
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        print(f"DEBUG: 文件扩展名: {file_ext}")
        if allowed_extensions is None:
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'heic', 'ico'}
        
        print(f"DEBUG: 允许的扩展名: {allowed_extensions}")
        print(f"DEBUG: 文件扩展名是否允许: {file_ext in allowed_extensions}")
        
        if not file_ext or file_ext not in allowed_extensions:
            print(f"DEBUG: 文件类型不支持: {file_ext}")
            return None
    
    # 生成唯一文件名
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    
    # 确保目录存在
    upload_folder = os.path.join(current_app.static_folder, folder)
    os.makedirs(upload_folder, exist_ok=True)
    print(f"DEBUG: 上传目录: {upload_folder}")
    
    # 保存文件
    file_path = os.path.join(upload_folder, unique_filename)
    print(f"DEBUG: 保存文件到: {file_path}")
    try:
        file.save(file_path)
        print(f"DEBUG: 文件保存成功: {unique_filename}")
        return unique_filename
    except Exception as e:
        print(f"DEBUG: 文件保存失败: {str(e)}")
        return None

def delete_file(filename, folder='uploads'):
    """删除文件"""
    if not filename:
        return False
    
    file_path = os.path.join(current_app.static_folder, folder, filename)
    
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception:
        pass
    
    return False 