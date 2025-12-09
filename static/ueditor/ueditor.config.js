/**
 * UEditor配置文件
 * 这只是一个临时文件，请运行install_ueditor.py脚本下载完整的UEditor
 */

// 基本配置
window.UEDITOR_CONFIG = {
    // 编辑器不自动被内容撑高
    autoHeightEnabled: true,
    // 初始容器高度
    initialFrameHeight: 400,
    // 初始容器宽度
    initialFrameWidth: '100%',
    // 上传图片配置
    imageUrl: '/api/upload_image',
    imagePath: '/static/uploads/',
    // 语言
    lang: 'zh-cn',
    // 字号
    'fontfamily': [
       { label: '宋体', val: '宋体,SimSun'},
       { label: '微软雅黑', val: '微软雅黑,Microsoft YaHei'},
       { label: '黑体', val: '黑体, SimHei'},
       { label: '楷体', val: '楷体,楷体_GB2312, SimKai'},
       { label: '隶书', val: '隶书, SimLi'},
       { label: 'Arial', val: 'arial, helvetica,sans-serif'}
    ],
    // 工具栏
    toolbars: [
        ['fullscreen', 'source', '|', 'undo', 'redo', '|',
            'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
            'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
            'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
            'directionalityltr', 'directionalityrtl', 'indent', '|',
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
            'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
            'simpleupload', 'insertimage', 'emotion', 'scrawl', 'insertvideo', 'music', 'attachment', 'map', 'gmap', 'insertframe', 'insertcode', 'webapp', 'pagebreak', 'template', 'background', '|',
            'horizontal', 'date', 'time', 'spechars', 'snapscreen', 'wordimage', '|',
            'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
            'print', 'preview', 'searchreplace', 'help', 'drafts']
    ]
}; 