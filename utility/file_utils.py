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
        return file.content_type.startswith('image/')
    return False

def save_file(file, folder='uploads', allowed_extensions=None):
    """保存上传的文件并返回唯一文件名"""
    if not file or not file.filename:
        return None
    
    filename = secure_filename(file.filename)
    if not filename:
        return None
    
    # 生成唯一文件名
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    
    # 确保目录存在 - 只检查一次，避免重复调用
    upload_folder = os.path.join(current_app.static_folder, folder)
    os.makedirs(upload_folder, exist_ok=True)
    
    # 保存文件
    file_path = os.path.join(upload_folder, unique_filename)
    try:
        file.save(file_path)
        return unique_filename
    except Exception:
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