import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename
from PIL import Image

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def save_image(file, folder):
    """
    保存图片文件
    :param file: 文件对象
    :param folder: 要保存到的子文件夹名 (profiles 或 posts)
    :return: 生成的唯一文件名
    """
    if file and allowed_file(file.filename):
        # 生成安全的文件名
        filename = secure_filename(file.filename)
        
        # 创建唯一文件名
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        # 确定保存路径
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], folder)
        
        # 确保目录存在
        os.makedirs(save_path, exist_ok=True)
        
        # 完整保存路径
        file_path = os.path.join(save_path, unique_filename)
        
        # 保存原始文件
        file.save(file_path)
        
        # 使用 Pillow 优化图片（可选）
        try:
            image = Image.open(file_path)
            
            # 根据不同类型进行不同的处理
            if folder == 'profiles':
                # 头像做成正方形
                width, height = image.size
                size = min(width, height)
                
                # 进行居中裁剪
                left = (width - size) // 2
                top = (height - size) // 2
                right = left + size
                bottom = top + size
                
                image = image.crop((left, top, right, bottom))
                
                # 缩放到标准尺寸
                image = image.resize((200, 200), Image.LANCZOS)
            else:
                # 文章封面图等比例缩放
                image.thumbnail((1200, 800), Image.LANCZOS)
                
            # 保存处理后的图片（覆盖原文件）
            image.save(file_path, optimize=True, quality=85)
            
        except Exception as e:
            current_app.logger.error(f"Image processing error: {e}")
        
        return f"{folder}/{unique_filename}"
        
    return None