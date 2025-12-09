from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length

class PostForm(FlaskForm):
    """博客文章表单"""
    title = StringField('标题', validators=[DataRequired(), Length(min=3, max=120)])
    location = StringField('地点', validators=[Length(max=100)])
    content = TextAreaField('内容', validators=[DataRequired()])
    featured_image = FileField('封面图片', validators=[
        FileAllowed(['jpg', 'jpeg', 'png', 'gif'], '只允许上传图片!')
    ])
    submit = SubmitField('发布') 